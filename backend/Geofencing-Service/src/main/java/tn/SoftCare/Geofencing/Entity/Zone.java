package tn.SoftCare.Geofencing.Entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Data @NoArgsConstructor @AllArgsConstructor
public class Zone {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String patientId;
    private String nomZone;
    private double centreLat;
    private double centreLon;
    private double rayon;
}
