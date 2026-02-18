package SoftCare.Dossier_Medical_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateDescriptionRequest {

    private Long analyseId;          // ID de l'analyse à modifier
    private String descriptionRisque; // Nouvelle description
    private String conseilMedecin;    // Conseil ajouté par le médecin
    private String notesCliniques;    // Notes cliniques supplémentaires
}