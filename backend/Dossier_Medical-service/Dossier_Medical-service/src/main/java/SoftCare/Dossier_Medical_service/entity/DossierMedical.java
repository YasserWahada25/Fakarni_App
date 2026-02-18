package SoftCare.Dossier_Medical_service.entity;


import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "dossiers_medicaux")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DossierMedical {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Identifiant du patient (sera lié au User-Service plus tard)
    @Column(name = "patient_id", nullable = false, unique = true)
    private Long patientId;

    // Informations du dossier
    @Column(name = "date_creation")
    private LocalDateTime dateCreation;

    @Column(name = "date_derniere_maj")
    private LocalDateTime dateDerniereMaj;

    // Statut global du dossier basé sur la dernière analyse
    @Column(name = "derniere_prediction")
    private String dernierePrediction;

    @Column(name = "dernier_niveau_risque")
    private String dernierNiveauRisque;

    @Column(name = "derniere_couleur_risque")
    private String derniereCouleurRisque;

    // Nombre total d'analyses effectuées
    @Column(name = "nombre_analyses")
    private Integer nombreAnalyses;

    // Liste des analyses IRM liées à ce dossier
    @OneToMany(mappedBy = "dossierMedical", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<AnalyseIRMDossier> analyses = new ArrayList<>();
}