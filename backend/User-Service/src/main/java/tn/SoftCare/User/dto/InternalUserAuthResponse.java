package tn.SoftCare.User.dto;

import tn.SoftCare.User.model.Role;

public class InternalUserAuthResponse {
    private String id;
    private String email;
    private String password; // hash
    private Role role;

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }
}
