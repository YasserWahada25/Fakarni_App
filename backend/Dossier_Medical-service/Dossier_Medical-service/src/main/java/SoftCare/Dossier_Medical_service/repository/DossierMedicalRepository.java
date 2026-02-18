package SoftCare.Dossier_Medical_service.repository;


import SoftCare.Dossier_Medical_service.entity.DossierMedical;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DossierMedicalRepository extends JpaRepository<DossierMedical, Long> {

    // Trouver le dossier d'un patient par son ID
    Optional<DossierMedical> findByPatientId(Long patientId);

    // Vérifier si un dossier existe pour un patient
    boolean existsByPatientId(Long patientId);
}