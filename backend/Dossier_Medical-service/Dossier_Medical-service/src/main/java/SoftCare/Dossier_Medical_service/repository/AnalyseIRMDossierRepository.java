package SoftCare.Dossier_Medical_service.repository;

import SoftCare.Dossier_Medical_service.entity.AnalyseIRMDossier;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AnalyseIRMDossierRepository extends JpaRepository<AnalyseIRMDossier, Long> {

    /**
     * Trouver toutes les analyses d'un dossier
     */
    List<AnalyseIRMDossier> findByDossierMedical_Id(Long dossierId);

    /**
     * Trouver une analyse par l'ID de l'analyse IRM originale
     */
    AnalyseIRMDossier findByAnalyseIrmId(Long analyseIrmId);
}