package SoftCare.Detection_Maladie_Service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnalyseIRMResponse {
    private Long id;
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
    private Long patientId;
}