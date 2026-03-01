package com.alzheimer.session_service.dto;

import com.alzheimer.session_service.entities.VideoSession;
import com.alzheimer.session_service.entities.VideoSessionStatus;
import com.alzheimer.session_service.entities.SessionType;
import com.alzheimer.session_service.entities.SessionVisibility;
import lombok.Builder;
import lombok.Value;

import java.time.Instant;

/**
 * DTO de réponse pour une {@link VideoSession}.
 * Utilisé par tous les endpoints REST vidéo pour ne pas exposer l'entité directement.
 */
@Value
@Builder
public class VideoSessionDTO {

    Long id;

    /** UUID de la room WebRTC – à transmettre au client pour la signalisation. */
    String roomId;

    /** ID de la {@link com.alzheimer.session_service.entities.VirtualSession} parente. */
    Long virtualSessionId;

    String hostUserId;

    SessionType sessionType;

    SessionVisibility sessionVisibility;

    VideoSessionStatus status;

    int maxParticipants;

    int currentParticipants;

    Instant startedAt;

    /** Null tant que la session n'est pas terminée. */
    Instant endedAt;

    /**
     * Construit un {@code VideoSessionDTO} à partir d'une entité {@link VideoSession}.
     */
    public static VideoSessionDTO from(VideoSession entity) {
        return VideoSessionDTO.builder()
                .id(entity.getId())
                .roomId(entity.getRoomId())
                .virtualSessionId(entity.getVirtualSessionId())
                .hostUserId(entity.getHostUserId())
                .sessionType(entity.getSessionType())
                .sessionVisibility(entity.getSessionVisibility())
                .status(entity.getStatus())
                .maxParticipants(entity.getMaxParticipants())
                .currentParticipants(entity.getCurrentParticipants())
                .startedAt(entity.getStartedAt())
                .endedAt(entity.getEndedAt())
                .build();
    }
}
