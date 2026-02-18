package SoftCare.Dossier_Medical_service.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "analyses_irm_dossier")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AnalyseIRMDossier {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dossier_id")
    @ToString.Exclude
    private DossierMedical dossierMedical;

    // ── Référence vers l'analyse originale ──
    private Long analyseIrmId;
    private String nomFichier;

    // ── Résultat IA ──
    private String prediction;
    private Double confidence;

    // ── Risque ──
    private String niveauRisque;
    private String couleurRisque;

    @Column(length = 1000)
    private String descriptionRisque;  // ✅ Modifiable par médecin

    // ── Probabilités ──
    private Double probMildDemented;
    private Double probModerateDemented;
    private Double probNonDemented;
    private Double probVeryMildDemented;

    // ── ✅ NOUVEAUX CHAMPS POUR MÉDECIN ──
    @Column(length = 2000)
    private String conseilMedecin;     // Conseil du médecin

    @Column(length = 2000)
    private String notesCliniques;     // Notes cliniques détaillées

    private LocalDateTime dateModification; // Date dernière modification

    // ── Méta ──
    private LocalDateTime dateAnalyse;
}