package com.alzheimer.session_service.repositories;

import com.alzheimer.session_service.entities.VideoSession;
import com.alzheimer.session_service.entities.VideoSessionStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

/**
 * Repository JPA pour {@link VideoSession}.
 *
 * <p>Cohérence avec {@code VirtualSessionRepository} : même pattern de méthodes dérivées
 * Spring Data, sans JPQL personnalisé sauf nécessité absolue.</p>
 */
public interface VideoSessionRepository extends JpaRepository<VideoSession, Long> {

    /**
     * Recherche une session vidéo par son {@code roomId} (UUID unique de la room WebRTC).
     * Utilisé lors d'un {@code joinVideoSession} pour retrouver la session à partir du
     * roomId transmis au client après {@code startVideoSession}.
     */
    Optional<VideoSession> findByRoomId(String roomId);

    /**
     * Recherche la {@code VideoSession} liée à une {@link com.alzheimer.session_service.entities.VirtualSession}.
     * Utilisé pour vérifier qu'une room vidéo n'existe pas déjà avant d'en créer une nouvelle.
     */
    Optional<VideoSession> findByVirtualSessionId(Long virtualSessionId);

    /**
     * Liste toutes les sessions vidéo d'un hôte donné.
     * Utile pour un dashboard de l'hôte.
     */
    List<VideoSession> findByHostUserId(String hostUserId);

    /**
     * Liste les sessions vidéo par statut.
     * Cohérent avec {@code VirtualSessionRepository.findByStatus()}.
     */
    List<VideoSession> findByStatus(VideoSessionStatus status);
}
