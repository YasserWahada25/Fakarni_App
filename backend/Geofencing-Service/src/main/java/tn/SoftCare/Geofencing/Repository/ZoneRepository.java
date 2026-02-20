package tn.SoftCare.Geofencing.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.SoftCare.Geofencing.Entity.Zone;
import java.util.Optional;

public interface ZoneRepository extends JpaRepository<Zone, Long> {
    Optional<Zone> findByPatientId(String patientId);
}
