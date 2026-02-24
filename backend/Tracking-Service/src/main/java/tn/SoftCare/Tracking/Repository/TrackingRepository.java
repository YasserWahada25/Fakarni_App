package tn.SoftCare.Tracking.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import tn.SoftCare.Tracking.Entity.Position;

import java.util.List;
import java.util.Optional;

public interface TrackingRepository extends JpaRepository<Position, Long> {

    /** Dernière position d'un patient donné */
    Optional<Position> findTopByPatientIdOrderByTimestampDesc(String patientId);

    /**
     * Dernière position de chaque patient distinct.
     * On récupère l'id MAX (= le plus récent) par patientId,
     * puis on joint pour avoir l'objet complet.
     */
    @Query("""
        SELECT p FROM Position p
        WHERE p.id IN (
            SELECT MAX(p2.id) FROM Position p2 GROUP BY p2.patientId
        )
    """)
    List<Position> findAllLastPositions();

}
