    package tn.SoftCare.User.dto;

    import tn.SoftCare.User.model.Role;

    public class UserResponse {
        private String id;
        private String nom;
        private String prenom;
        private String email;
        private Role role;
        private String numTel;
        private String adresse;

        // getters/setters
        public String getId() { return id; }
        public void setId(String id) { this.id = id; }

        public String getNom() { return nom; }
        public void setNom(String nom) { this.nom = nom; }

        public String getPrenom() { return prenom; }
        public void setPrenom(String prenom) { this.prenom = prenom; }

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }

        public Role getRole() { return role; }
        public void setRole(Role role) { this.role = role; }

        public String getNumTel() { return numTel; }
        public void setNumTel(String numTel) { this.numTel = numTel; }

        public String getAdresse() { return adresse; }
        public void setAdresse(String adresse) { this.adresse = adresse; }
    }
