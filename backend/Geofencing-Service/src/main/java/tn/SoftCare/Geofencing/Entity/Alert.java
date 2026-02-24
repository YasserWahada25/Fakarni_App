package tn.SoftCare.Geofencing.Entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Data @NoArgsConstructor @AllArgsConstructor
public class Alert {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String patientId;
    private String patientName;
    private String type; // ex: "Zone Exit"
    private LocalDateTime timestamp;
    private String status; // ex: "Active", "Resolved"
    private String severity; // ex: "High", "Medium", "Low"
    private double distanceHorsZone; // Info supplémentaire utile
}