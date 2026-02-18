package SoftCare.Detection_Maladie_Service.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "analyses_irm")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AnalyseIRM {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nomFichier;

    // ── Résultat IA ──
    private String prediction;
    private Double confidence;

    // ── Risque ──
    private String niveauRisque;
    private String couleurRisque;
    private String descriptionRisque;

    // ── Probabilités ──
    private Double probMildDemented;
    private Double probModerateDemented;
    private Double probNonDemented;
    private Double probVeryMildDemented;

    // ── Méta ──
    private LocalDateTime dateAnalyse;
    private Long patientId; // statique = 1L pour l'instant
}