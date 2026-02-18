package tn.SoftCare.User.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import tn.SoftCare.User.dto.CreateUserRequest;
import tn.SoftCare.User.dto.UpdateUserRequest;
import tn.SoftCare.User.dto.UserResponse;
import tn.SoftCare.User.model.User;
import tn.SoftCare.User.repository.UserRepository;

import java.util.List;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public UserResponse create(CreateUserRequest req) {
        if (userRepository.existsByEmail(req.getEmail())) {
            throw new RuntimeException("Email déjà utilisé");
        }

        User u = new User();
        u.setNom(req.getNom());
        u.setPrenom(req.getPrenom());
        u.setEmail(req.getEmail());
        u.setPassword(passwordEncoder.encode(req.getPassword())); // ✅ hash
        u.setRole(req.getRole());
        u.setNumTel(req.getNumTel());
        u.setAdresse(req.getAdresse());

        return toResponse(userRepository.save(u));
    }

    public List<UserResponse> findAll() {
        return userRepository.findAll().stream().map(this::toResponse).toList();
    }

    public UserResponse findById(String id) {
        User u = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User introuvable"));
        return toResponse(u);
    }

    public UserResponse update(String id, UpdateUserRequest req) {
        User u = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User introuvable"));

        if (req.getEmail() != null && !req.getEmail().equals(u.getEmail())) {
            if (userRepository.existsByEmail(req.getEmail())) {
                throw new RuntimeException("Email déjà utilisé");
            }
            u.setEmail(req.getEmail());
        }

        if (req.getNom() != null) u.setNom(req.getNom());
        if (req.getPrenom() != null) u.setPrenom(req.getPrenom());
        if (req.getRole() != null) u.setRole(req.getRole());
        if (req.getNumTel() != null) u.setNumTel(req.getNumTel());
        if (req.getAdresse() != null) u.setAdresse(req.getAdresse());

        // ⚠️ update password via endpoint dédié (plus safe)
        // (on ne change pas le password ici)

        return toResponse(userRepository.save(u));
    }

    // ✅ endpoint interne pour reset-password
    public void updatePassword(String userId, String rawPassword) {
        User u = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User introuvable"));
        u.setPassword(passwordEncoder.encode(rawPassword));
        userRepository.save(u);
    }

    public void delete(String id) {
        if (!userRepository.existsById(id)) {
            throw new RuntimeException("User introuvable");
        }
        userRepository.deleteById(id);
    }

    private UserResponse toResponse(User u) {
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
}
