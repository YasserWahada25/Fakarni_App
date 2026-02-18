package SoftCare.Dossier_Medical_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DossierMedicalResponse {

    private Long id;
    private Long patientId;
    private LocalDateTime dateCreation;
    private LocalDateTime dateDerniereMaj;

    // Synthèse dernière analyse
    private String dernierePrediction;
    private String dernierNiveauRisque;
    private String derniereCouleurRisque;

    private Integer nombreAnalyses;
    private List<AnalyseIRMDossierResponse> analyses;

    // ══════════════════════════════════════════════════
    //   DTO INTERNE - Analyse IRM dans le dossier
    // ══════════════════════════════════════════════════
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AnalyseIRMDossierResponse {

        private Long id;                    // ID dans dossier
        private Long analyseIrmId;          // ID analyse originale

        private String nomFichier;
        private String prediction;
        private Double confidence;

        private String niveauRisque;
        private String couleurRisque;
        private String descriptionRisque;   // ✅ Modifiable par médecin

        // ✅ NOUVEAUX CHAMPS
        private String conseilMedecin;      // Conseil du médecin
        private String notesCliniques;      // Notes cliniques détaillées

        private Double probMildDemented;
        private Double probModerateDemented;
        private Double probNonDemented;
        private Double probVeryMildDemented;

        private LocalDateTime dateAnalyse;
        private LocalDateTime dateModification; // ✅ Date dernière modification
    }
}