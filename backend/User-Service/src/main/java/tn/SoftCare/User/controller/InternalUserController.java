package tn.SoftCare.User.controller;

import org.springframework.web.bind.annotation.*;
import tn.SoftCare.User.dto.InternalUserAuthResponse;
import tn.SoftCare.User.model.User;
import tn.SoftCare.User.repository.UserRepository;
import tn.SoftCare.User.service.UserService;

@RestController
@RequestMapping("/internal/users")
public class InternalUserController {

    private final UserRepository userRepository;
    private final UserService userService;

    public InternalUserController(UserRepository userRepository, UserService userService) {
        this.userRepository = userRepository;
        this.userService = userService;
    }

    // ✅ utilisé par Auth-Service pour login
    @GetMapping("/by-email")
    public InternalUserAuthResponse getByEmail(@RequestParam String email) {
        User u = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User introuvable"));

        InternalUserAuthResponse r = new InternalUserAuthResponse();
        r.setId(u.getId());
        r.setEmail(u.getEmail());
        r.setPassword(u.getPassword()); // hash
        r.setRole(u.getRole());
        return r;
    }

    // ✅ utilisé par Auth-Service pour reset-password
    @PutMapping("/{id}/password")
    public void updatePassword(@PathVariable String id, @RequestBody String newPassword) {
        userService.updatePassword(id, newPassword);
    }
}
