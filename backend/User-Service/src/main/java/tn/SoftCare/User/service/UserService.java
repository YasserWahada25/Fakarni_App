package tn.SoftCare.User.service;

import tn.SoftCare.User.dto.CreateUserRequest;
import tn.SoftCare.User.dto.UpdateUserRequest;
import tn.SoftCare.User.dto.UserResponse;
import tn.SoftCare.User.model.User;
import tn.SoftCare.User.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public UserResponse create(CreateUserRequest req) {
        if (userRepository.existsByEmail(req.getEmail())) {
            throw new RuntimeException("Email déjà utilisé");
        }

        User u = new User();
        u.setNom(req.getNom());
        u.setPrenom(req.getPrenom());
        u.setEmail(req.getEmail());
        u.setPassword(req.getPassword()); // (plus tard on hash)
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
        if (req.getPassword() != null && !req.getPassword().isBlank()) u.setPassword(req.getPassword());
        if (req.getRole() != null) u.setRole(req.getRole());
        if (req.getNumTel() != null) u.setNumTel(req.getNumTel());
        if (req.getAdresse() != null) u.setAdresse(req.getAdresse());

        return toResponse(userRepository.save(u));
    }

    public void delete(String id) {
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
