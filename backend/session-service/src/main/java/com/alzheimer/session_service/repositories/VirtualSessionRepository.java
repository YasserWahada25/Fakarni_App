package com.alzheimer.session_service.repositories;

import com.alzheimer.session_service.entities.VirtualSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;

public interface VirtualSessionRepository extends JpaRepository<VirtualSession, Long> {

    List<VirtualSession> findByStatus(com.alzheimer.session_service.entities.SessionStatus status);

    List<VirtualSession> findByStartTimeBetween(Instant from, Instant to);

    List<VirtualSession> findByStartTimeGreaterThanEqual(Instant from);

    List<VirtualSession> findByStartTimeLessThanEqual(Instant to);

    List<VirtualSession> findByStatusAndStartTimeBetween(
            com.alzheimer.session_service.entities.SessionStatus status,
            Instant from,
            Instant to
    );

    // sessions où un user est participant (utile pour favoris/reminders)
    @Query("SELECT v FROM VirtualSession v JOIN v.participants p WHERE p.userId = :userId")
    List<VirtualSession> findByParticipantUserId(@Param("userId") String userId);
}
