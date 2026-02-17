package tn.SoftCare.User.dto;

import jakarta.validation.constraints.Email;
import tn.SoftCare.User.model.Role;

public class UpdateUserRequest {

    private String nom;
    private String prenom;

    @Email
    private String email;

    private String password;
    private Role role;
    private String numTel;
    private String adresse;

    // getters/setters
    public String getNom() { return nom; }
    public void setNom(String nom) { this.nom = nom; }

    public String getPrenom() { return prenom; }
    public void setPrenom(String prenom) { this.prenom = prenom; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }

    public String getNumTel() { return numTel; }
    public void setNumTel(String numTel) { this.numTel = numTel; }

    public String getAdresse() { return adresse; }
    public void setAdresse(String adresse) { this.adresse = adresse; }
}
