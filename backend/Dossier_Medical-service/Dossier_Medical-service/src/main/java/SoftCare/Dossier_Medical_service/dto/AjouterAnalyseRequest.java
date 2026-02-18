package SoftCare.Dossier_Medical_service.dto;


import lombok.Data;
import java.time.LocalDateTime;

/**
 * DTO reçu depuis Detection_Maladie-Service
 * après une analyse IRM réussie.
 * Contient toutes les infos nécessaires pour mettre à jour le dossier médical.
 */
@Data
public class AjouterAnalyseRequest {

    // ID de l'analyse dans Detection_Maladie-Service
    private Long analyseIrmId;

    // Identifiant du patient
    private Long patientId;

    // Résultats de l'analyse
    private String nomFichier;
    private String prediction;
    private Double confidence;
    private String niveauRisque;
    private String couleurRisque;
    private String descriptionRisque;

    // Probabilités détaillées
    private Double probMildDemented;
    private Double probModerateDemented;
    private Double probNonDemented;
    private Double probVeryMildDemented;

    private LocalDateTime dateAnalyse;
}