package SoftCare.Detection_Maladie_Service.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class AjouterAnalyseRequest {

    private Long analyseIrmId;
    private Long patientId;

    private String nomFichier;
    private String prediction;
    private Double confidence;
    private String niveauRisque;
    private String couleurRisque;
    private String descriptionRisque;

    private Double probMildDemented;
    private Double probModerateDemented;
    private Double probNonDemented;
    private Double probVeryMildDemented;

    private LocalDateTime dateAnalyse;
}