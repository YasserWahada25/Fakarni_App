package SoftCare.Detection_Maladie_Service.repository;

import SoftCare.Detection_Maladie_Service.entity.AnalyseIRM;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AnalyseIRMRepository extends JpaRepository<AnalyseIRM, Long> {
    List<AnalyseIRM> findByPatientId(Long patientId);
}