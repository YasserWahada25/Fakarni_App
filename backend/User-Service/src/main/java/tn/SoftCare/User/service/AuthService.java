package tn.SoftCare.User.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import tn.SoftCare.User.dto.*;
import tn.SoftCare.User.model.Session;
import tn.SoftCare.User.model.User;
import tn.SoftCare.User.repository.SessionRepository;
import tn.SoftCare.User.repository.UserRepository;
import tn.SoftCare.User.security.JwtService;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.Base64;
import java.util.UUID;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final SessionRepository sessionRepository;
    private final PasswordEncoder passwordEncoder; // ✅ uniquement pour password user
    private final JwtService jwtService;

    public AuthService(UserRepository userRepository,
                       SessionRepository sessionRepository,
                       PasswordEncoder passwordEncoder,
                       JwtService jwtService) {
        this.userRepository = userRepository;
        this.sessionRepository = sessionRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public AuthResponse login(LoginRequest req, String userAgent, String ip) {
        User user = userRepository.findByEmail(req.getEmail())
                .orElseThrow(() -> new RuntimeException("Email ou mot de passe incorrect"));

        // ✅ Comparaison correcte
        if (!passwordEncoder.matches(req.getPassword(), user.getPassword())) {
            throw new RuntimeException("Email ou mot de passe incorrect");
        }

        // ✅ Créer une session
        Session s = new Session();
        s.setId(UUID.randomUUID().toString());
        s.setUserId(user.getId());
        s.setCreatedAt(Instant.now());
        s.setExpiresAt(Instant.now().plusSeconds(jwtService.getRefreshDays() * 24 * 3600));
        s.setRevoked(false);
        s.setUserAgent(userAgent);
        s.setIp(ip);

        // ✅ Générer refresh token (JWT)
        String refreshToken = jwtService.generateRefreshToken(user.getId(), s.getId());

        // ✅ IMPORTANT: on ne fait PAS bcrypt(refreshToken) (limite 72 bytes)
        // On stocke plutôt un SHA-256 du refresh token
        s.setRefreshTokenHash(hashTokenSha256(refreshToken));

        sessionRepository.save(s);

        // ✅ Générer access token
        String accessToken = jwtService.generateAccessToken(user);

        AuthResponse res = new AuthResponse();
        res.setAccessToken(accessToken);
        res.setRefreshToken(refreshToken);
        res.setUser(toUserResponse(user));
        return res;
    }

    public AuthResponse refresh(RefreshRequest req) {
        String refreshToken = req.getRefreshToken();
        if (refreshToken == null || refreshToken.isBlank()) {
            throw new RuntimeException("Refresh token invalide");
        }

        if (!jwtService.isValid(refreshToken)) {
            throw new RuntimeException("Refresh token invalide");
        }

        String userId = jwtService.extractUserId(refreshToken);
        String sessionId = jwtService.extractSessionId(refreshToken);

        Session s = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session introuvable"));

        if (s.isRevoked() || s.getExpiresAt().isBefore(Instant.now())) {
            throw new RuntimeException("Session expirée");
        }

        // ✅ Comparer SHA-256(token) avec le hash stocké
        if (!constantTimeEquals(hashTokenSha256(refreshToken), s.getRefreshTokenHash())) {
            throw new RuntimeException("Refresh token invalide");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User introuvable"));

        // ✅ Rotation du refresh token (même sessionId)
        String newRefresh = jwtService.generateRefreshToken(userId, sessionId);
        s.setRefreshTokenHash(hashTokenSha256(newRefresh));
        sessionRepository.save(s);

        AuthResponse res = new AuthResponse();
        res.setAccessToken(jwtService.generateAccessToken(user));
        res.setRefreshToken(newRefresh);
        res.setUser(toUserResponse(user));
        return res;
    }

    public void logout(String refreshToken) {
        if (refreshToken == null || refreshToken.isBlank()) return;
        if (!jwtService.isValid(refreshToken)) return;

        String sessionId = jwtService.extractSessionId(refreshToken);

        sessionRepository.findById(sessionId).ifPresent(s -> {
            s.setRevoked(true);
            sessionRepository.save(s);
        });
    }

    private UserResponse toUserResponse(User u) {
        UserResponse r = new UserResponse();
        r.setId(u.getId());
        r.setNom(u.getNom());
        r.setPrenom(u.getPrenom());
        r.setEmail(u.getEmail());
        r.setRole(u.getRole());
        r.setNumTel(u.getNumTel());
        r.setAdresse(u.getAdresse());
        return r;
    }

    /**
     * Hash SHA-256 du token, encodé en Base64 (stockage DB friendly)
     */
    private String hashTokenSha256(String token) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] digest = md.digest(token.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(digest);
        } catch (Exception e) {
            throw new RuntimeException("Erreur hashing refresh token", e);
        }
    }

    /**
     * Comparaison en temps constant (évite timing attacks)
     */
    private boolean constantTimeEquals(String a, String b) {
        if (a == null || b == null) return false;
        return MessageDigest.isEqual(
                a.getBytes(StandardCharsets.UTF_8),
                b.getBytes(StandardCharsets.UTF_8)
        );
    }
}