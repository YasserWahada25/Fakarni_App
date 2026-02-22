package tn.SoftCare.User.security;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import tn.SoftCare.User.model.User;

import javax.crypto.SecretKey;
import java.time.Instant;
import java.util.Date;
import java.util.Map;

@Service
public class JwtService {

    @Value("${security.jwt.secret}")
    private String secret;

    @Value("${security.jwt.access-token-minutes:15}")
    private long accessMinutes;

    @Value("${security.jwt.refresh-token-days:7}")
    private long refreshDays;

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(Decoders.BASE64.decode(secret));
    }

    public long getRefreshDays() {
        return refreshDays;
    }

    public String generateAccessToken(User user) {
        Instant now = Instant.now();
        Instant exp = now.plusSeconds(accessMinutes * 60);

        return Jwts.builder()
                .setSubject(user.getId())
                .addClaims(Map.of(
                        "email", user.getEmail(),
                        "role", user.getRole().name()
                ))
                .setIssuedAt(Date.from(now))
                .setExpiration(Date.from(exp))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    public String generateRefreshToken(String userId, String sessionId) {
        Instant now = Instant.now();
        Instant exp = now.plusSeconds(refreshDays * 24 * 3600);

        return Jwts.builder()
                .setSubject(userId)
                .addClaims(Map.of(
                        "sid", sessionId,
                        "type", "refresh"
                ))
                .setIssuedAt(Date.from(now))
                .setExpiration(Date.from(exp))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    public boolean isValid(String token) {
        try {
            Jwts.parser()
                    .verifyWith(getSigningKey())
                    .build()
                    .parseSignedClaims(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    public String extractUserId(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .getSubject();
    }

    public String extractSessionId(String refreshToken) {
        Object sid = Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(refreshToken)
                .getPayload()
                .get("sid");
        return sid == null ? null : sid.toString();
    }
}