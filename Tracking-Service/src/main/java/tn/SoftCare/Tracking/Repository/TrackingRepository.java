package tn.SoftCare.Tracking.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.SoftCare.Tracking.Entity.Position;

public interface TrackingRepository extends JpaRepository<Position, Long> {
}
