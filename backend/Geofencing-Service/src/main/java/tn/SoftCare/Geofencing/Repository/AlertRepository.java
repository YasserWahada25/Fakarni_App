package tn.SoftCare.Geofencing.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tn.SoftCare.Geofencing.Entity.Alert;
import java.util.List;

@Repository
public interface AlertRepository extends JpaRepository<Alert, Long> {
    List<Alert> findByPatientId(String patientId);
    List<Alert> findByStatusOrderByTimestampDesc(String status);
}