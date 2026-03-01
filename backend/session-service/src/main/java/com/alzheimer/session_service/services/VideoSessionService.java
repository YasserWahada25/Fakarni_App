package com.alzheimer.session_service.services;

import com.alzheimer.session_service.dto.AddRoomParticipantRequest;
import com.alzheimer.session_service.dto.JoinVideoSessionRequest;
import com.alzheimer.session_service.dto.StartVideoSessionRequest;
import com.alzheimer.session_service.dto.VideoChatMessageDTO;
import com.alzheimer.session_service.dto.VideoSessionDTO;
import com.alzheimer.session_service.entities.JoinStatus;
import com.alzheimer.session_service.entities.MeetingMode;
import com.alzheimer.session_service.entities.ParticipantRole;
import com.alzheimer.session_service.entities.SessionParticipant;
import com.alzheimer.session_service.entities.SessionStatus;
import com.alzheimer.session_service.entities.SessionType;
import com.alzheimer.session_service.entities.SessionVisibility;
import com.alzheimer.session_service.entities.VideoChatMessage;
import com.alzheimer.session_service.entities.VideoSession;
import com.alzheimer.session_service.entities.VideoSessionStatus;
import com.alzheimer.session_service.entities.VirtualSession;
import com.alzheimer.session_service.repositories.VideoChatMessageRepository;
import com.alzheimer.session_service.repositories.VideoSessionRepository;
import com.alzheimer.session_service.repositories.VirtualSessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class VideoSessionService {

    private final VideoSessionRepository videoSessionRepository;
    private final VideoChatMessageRepository videoChatMessageRepository;
    private final VirtualSessionRepository virtualSessionRepository;

    public static class UnauthorizedException extends RuntimeException {
        public UnauthorizedException(String message) { super(message); }
    }

    public static class VideoSessionFullException extends RuntimeException {
        public VideoSessionFullException(String message) { super(message); }
    }

    public static class VideoSessionAlreadyExistsException extends RuntimeException {
        public VideoSessionAlreadyExistsException(String message) { super(message); }
    }

    @Transactional
    public VideoSessionDTO startVideoSession(StartVideoSessionRequest req) {
        VirtualSession virtualSession = getVirtualSessionOrThrow(req.getVirtualSessionId());

        validateOnlineMode(virtualSession);
        validateScheduledStatus(virtualSession);
        validateHostAuthorization(virtualSession, req.getHostUserId());
        ensureNoActiveVideoSession(req.getVirtualSessionId());

        int maxParticipants = resolveMaxParticipants(virtualSession.getSessionType(), req.getMaxParticipants());

        VideoSession videoSession = VideoSession.builder()
                .roomId(UUID.randomUUID().toString())
                .virtualSessionId(virtualSession.getId())
                .sessionType(virtualSession.getSessionType())
                .sessionVisibility(virtualSession.getVisibility())
                .hostUserId(req.getHostUserId())
                .maxParticipants(maxParticipants)
                .currentParticipants(0)
                .status(VideoSessionStatus.WAITING)
                .build();

        return VideoSessionDTO.from(videoSessionRepository.save(videoSession));
    }

    @Transactional
    public VideoSessionDTO joinVideoSession(JoinVideoSessionRequest req) {
        VideoSession videoSession = getVideoSessionByRoomIdOrThrow(req.getRoomId());

        validateSessionJoinable(videoSession);
        validateParticipantAccess(videoSession, req.getUserId());
        Set<String> activeParticipants = getOrInitActiveParticipants(videoSession);
        boolean changed = normalizeLegacyVideoSessionState(videoSession, activeParticipants);

        if (!activeParticipants.contains(req.getUserId())) {
            validateSessionNotFull(videoSession, activeParticipants.size());
        }

        boolean newlyJoined = activeParticipants.add(req.getUserId());
        if (newlyJoined) {
            videoSession.setCurrentParticipants(activeParticipants.size());
            if (videoSession.getStatus() == VideoSessionStatus.WAITING
                    && videoSession.getCurrentParticipants() > 0) {
                videoSession.setStatus(VideoSessionStatus.ACTIVE);
            }
            changed = true;
        }

        if (changed) {
            return VideoSessionDTO.from(videoSessionRepository.save(videoSession));
        }

        return VideoSessionDTO.from(videoSession);
    }

    @Transactional
    public VideoSessionDTO endVideoSession(Long id, String userId) {
        VideoSession videoSession = getVideoSessionOrThrow(id);

        if (!videoSession.getHostUserId().equals(userId)) {
            throw new UnauthorizedException("Seul l'hote peut terminer la session video.");
        }
        if (videoSession.getStatus() == VideoSessionStatus.ENDED) {
            throw new VirtualSessionService.BadRequestException("La session video est deja terminee.");
        }

        videoSession.setStatus(VideoSessionStatus.ENDED);
        videoSession.setEndedAt(Instant.now());
        getOrInitActiveParticipants(videoSession).clear();
        videoSession.setCurrentParticipants(0);
        videoSessionRepository.save(videoSession);

        syncVirtualSessionToDone(videoSession.getVirtualSessionId());
        return VideoSessionDTO.from(videoSession);
    }

    @Transactional(readOnly = true)
    public VideoSessionDTO getVideoSession(Long id) {
        return VideoSessionDTO.from(getVideoSessionOrThrow(id));
    }

    @Transactional(readOnly = true)
    public VideoSessionDTO getVideoSessionByVirtualSessionId(Long virtualSessionId) {
        return videoSessionRepository.findByVirtualSessionId(virtualSessionId)
                .filter(vs -> vs.getStatus() != VideoSessionStatus.ENDED)
                .map(VideoSessionDTO::from)
                .orElseThrow(() -> new VirtualSessionService.NotFoundException(
                        "Aucune session video active pour la session virtuelle : " + virtualSessionId));
    }

    @Transactional(readOnly = true)
    public List<VideoChatMessageDTO> listRoomMessages(String roomId, String userId) {
        VideoSession videoSession = getVideoSessionByRoomIdOrThrow(roomId);
        validateParticipantAccess(videoSession, normalizeRequiredUserId(userId, "userId"));
        return videoChatMessageRepository.findByRoomIdOrderBySentAtAsc(roomId).stream()
                .map(VideoChatMessageDTO::from)
                .toList();
    }

    @Transactional
    public VideoChatMessageDTO saveChatMessage(String roomId, String fromUserId, String text) {
        String normalizedSender = normalizeRequiredUserId(fromUserId, "fromUserId");
        String normalizedText = normalizeRequiredText(text, "text");

        VideoSession videoSession = getVideoSessionByRoomIdOrThrow(roomId);
        validateSessionJoinable(videoSession);
        validateParticipantAccess(videoSession, normalizedSender);

        VideoChatMessage chatMessage = VideoChatMessage.builder()
                .roomId(roomId)
                .fromUserId(normalizedSender)
                .text(normalizedText)
                .build();

        return VideoChatMessageDTO.from(videoChatMessageRepository.save(chatMessage));
    }

    @Transactional
    public List<SessionParticipant> addParticipantToRoom(String roomId, AddRoomParticipantRequest req) {
        VideoSession videoSession = getVideoSessionByRoomIdOrThrow(roomId);
        VirtualSession virtualSession = getVirtualSessionOrThrow(videoSession.getVirtualSessionId());

        String requesterUserId = normalizeRequiredUserId(req.getRequesterUserId(), "requesterUserId");
        String participantUserId = normalizeRequiredUserId(req.getUserId(), "userId");

        validateParticipantManagementAuthorization(virtualSession, videoSession, requesterUserId);

        boolean exists = virtualSession.getParticipants().stream()
                .anyMatch(p -> p.getUserId().equals(participantUserId));
        if (exists) {
            throw new VirtualSessionService.BadRequestException("Participant deja present dans cette reunion.");
        }

        ParticipantRole role = req.getRole() != null ? req.getRole() : ParticipantRole.PARTICIPANT;
        JoinStatus joinStatus = req.getJoinStatus() != null ? req.getJoinStatus() : JoinStatus.CONFIRMED;

        virtualSession.getParticipants().add(SessionParticipant.builder()
                .userId(participantUserId)
                .role(role)
                .joinStatus(joinStatus)
                .joinedAt(null)
                .isFavorite(false)
                .reminderMinutesBefore(null)
                .build());

        virtualSession.setUpdatedAt(Instant.now());
        VirtualSession saved = virtualSessionRepository.save(virtualSession);
        return new ArrayList<>(saved.getParticipants());
    }

    @Transactional
    public void onParticipantLeave(String roomId, String userId) {
        if (userId == null || userId.isBlank()) return;
        videoSessionRepository.findByRoomId(roomId).ifPresent(videoSession -> {
            if (videoSession.getStatus() == VideoSessionStatus.ENDED) return;
            Set<String> activeParticipants = getOrInitActiveParticipants(videoSession);
            boolean removed = activeParticipants.remove(userId);
            if (!removed) return;
            int updated = activeParticipants.size();
            videoSession.setCurrentParticipants(updated);
            if (updated == 0) {
                videoSession.setStatus(VideoSessionStatus.WAITING);
            }
            videoSessionRepository.save(videoSession);
        });
    }

    private VirtualSession getVirtualSessionOrThrow(Long id) {
        return virtualSessionRepository.findById(id)
                .orElseThrow(() -> new VirtualSessionService.NotFoundException(
                        "Session virtuelle introuvable : " + id));
    }

    private VideoSession getVideoSessionOrThrow(Long id) {
        return videoSessionRepository.findById(id)
                .orElseThrow(() -> new VirtualSessionService.NotFoundException(
                        "Session video introuvable : " + id));
    }

    private VideoSession getVideoSessionByRoomIdOrThrow(String roomId) {
        return videoSessionRepository.findByRoomId(roomId)
                .orElseThrow(() -> new VirtualSessionService.NotFoundException(
                        "Room video introuvable : " + roomId));
    }

    private void validateOnlineMode(VirtualSession session) {
        if (session.getMeetingMode() == null || session.getMeetingMode() != MeetingMode.ONLINE) {
            throw new VirtualSessionService.BadRequestException(
                    "La discussion video est disponible uniquement pour les sessions ONLINE.");
        }
    }

    private void validateScheduledStatus(VirtualSession session) {
        if (session.getStatus() == null || session.getStatus() != SessionStatus.SCHEDULED) {
            throw new VirtualSessionService.BadRequestException(
                    "La session video peut demarrer uniquement pour une session SCHEDULED.");
        }
    }

    private void validateHostAuthorization(VirtualSession session, String userId) {
        boolean isCreator = session.getCreatedBy().equals(userId);
        boolean isHostOrOrganizer = session.getParticipants().stream()
                .anyMatch(p -> p.getUserId().equals(userId)
                        && (p.getRole() == ParticipantRole.HOST || p.getRole() == ParticipantRole.ORGANIZER));
        if (!isCreator && !isHostOrOrganizer) {
            throw new UnauthorizedException(
                    "Seul l'hote ou l'organisateur peut demarrer la video. Utilisateur : " + userId);
        }
    }

    private void ensureNoActiveVideoSession(Long virtualSessionId) {
        videoSessionRepository.findByVirtualSessionId(virtualSessionId).ifPresent(existing -> {
            if (existing.getStatus() != VideoSessionStatus.ENDED) {
                throw new VideoSessionAlreadyExistsException(
                        "Une session video est deja active pour cette session. Room : " + existing.getRoomId());
            }
        });
    }

    private void validateSessionJoinable(VideoSession videoSession) {
        if (videoSession.getStatus() == VideoSessionStatus.ENDED) {
            throw new VirtualSessionService.BadRequestException(
                    "Impossible de rejoindre une session video terminee.");
        }
    }

    private void validateParticipantAccess(VideoSession videoSession, String userId) {
        if (videoSession.getHostUserId().equals(userId)) {
            return;
        }

        VirtualSession virtualSession = getVirtualSessionOrThrow(videoSession.getVirtualSessionId());

        if (videoSession.getSessionVisibility() == SessionVisibility.PRIVATE) {
            boolean isAuthorized = virtualSession.getParticipants().stream()
                    .anyMatch(p -> p.getUserId().equals(userId)
                            && (p.getJoinStatus() == JoinStatus.CONFIRMED
                            || p.getJoinStatus() == JoinStatus.ATTENDED));
            if (!isAuthorized) {
                throw new UnauthorizedException(
                        "Utilisateur non autorise a rejoindre cette session video privee : " + userId);
            }
        }
    }

    private void validateSessionNotFull(VideoSession videoSession, int activeParticipantsCount) {
        if (activeParticipantsCount >= videoSession.getMaxParticipants()) {
            throw new VideoSessionFullException(
                    "La session video est pleine. Maximum atteint : " + videoSession.getMaxParticipants());
        }
    }

    private Set<String> getOrInitActiveParticipants(VideoSession videoSession) {
        if (videoSession.getActiveParticipantIds() == null) {
            videoSession.setActiveParticipantIds(new HashSet<>());
        }
        return videoSession.getActiveParticipantIds();
    }

    private boolean normalizeLegacyVideoSessionState(VideoSession videoSession, Set<String> activeParticipants) {
        boolean changed = false;

        int normalizedMax = resolveMaxParticipants(videoSession.getSessionType(), videoSession.getMaxParticipants());
        if (videoSession.getMaxParticipants() < normalizedMax) {
            videoSession.setMaxParticipants(normalizedMax);
            changed = true;
        }

        if (activeParticipants.isEmpty()
                && videoSession.getCurrentParticipants() > 0
                && videoSession.getHostUserId() != null
                && !videoSession.getHostUserId().isBlank()) {
            activeParticipants.add(videoSession.getHostUserId());
            changed = true;
        }

        if (videoSession.getCurrentParticipants() != activeParticipants.size()) {
            videoSession.setCurrentParticipants(activeParticipants.size());
            changed = true;
        }

        if (activeParticipants.isEmpty() && videoSession.getStatus() == VideoSessionStatus.ACTIVE) {
            videoSession.setStatus(VideoSessionStatus.WAITING);
            changed = true;
        } else if (!activeParticipants.isEmpty() && videoSession.getStatus() == VideoSessionStatus.WAITING) {
            videoSession.setStatus(VideoSessionStatus.ACTIVE);
            changed = true;
        }

        return changed;
    }

    private int resolveMaxParticipants(SessionType sessionType, Integer requested) {
        if (sessionType == SessionType.PRIVATE) {
            return 2;
        }
        return (requested != null && requested >= 2) ? requested : 10;
    }

    private void syncVirtualSessionToDone(Long virtualSessionId) {
        virtualSessionRepository.findById(virtualSessionId).ifPresent(vs -> {
            vs.setStatus(SessionStatus.DONE);
            vs.setUpdatedAt(Instant.now());
            virtualSessionRepository.save(vs);
        });
    }

    private void validateParticipantManagementAuthorization(
            VirtualSession virtualSession,
            VideoSession videoSession,
            String requesterUserId
    ) {
        if (requesterUserId.equals(videoSession.getHostUserId())
                || requesterUserId.equals(virtualSession.getCreatedBy())) {
            return;
        }

        boolean canManage = virtualSession.getParticipants().stream()
                .anyMatch(p -> p.getUserId().equals(requesterUserId)
                        && (p.getRole() == ParticipantRole.HOST || p.getRole() == ParticipantRole.ORGANIZER));
        if (!canManage) {
            throw new UnauthorizedException(
                    "Seul l'hote ou l'organisateur peut ajouter un participant a la reunion.");
        }
    }

    private String normalizeRequiredUserId(String userId, String fieldName) {
        if (userId == null || userId.trim().isEmpty()) {
            throw new VirtualSessionService.BadRequestException(
                    "Champ obligatoire manquant : " + fieldName);
        }
        return userId.trim();
    }

    private String normalizeRequiredText(String text, String fieldName) {
        if (text == null || text.trim().isEmpty()) {
            throw new VirtualSessionService.BadRequestException(
                    "Champ obligatoire manquant : " + fieldName);
        }
        return text.trim();
    }
}
