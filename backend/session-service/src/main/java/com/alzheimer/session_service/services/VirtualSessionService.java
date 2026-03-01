package com.alzheimer.session_service.services;

import com.alzheimer.session_service.dto.AddParticipantRequest;
import com.alzheimer.session_service.dto.CreateSessionRequest;
import com.alzheimer.session_service.dto.UpdateParticipantPrefsRequest;
import com.alzheimer.session_service.dto.UpdateParticipantStatusRequest;
import com.alzheimer.session_service.dto.UpdateSessionRequest;
import com.alzheimer.session_service.entities.JoinStatus;
import com.alzheimer.session_service.entities.MeetingMode;
import com.alzheimer.session_service.entities.ParticipantRole;
import com.alzheimer.session_service.entities.SessionParticipant;
import com.alzheimer.session_service.entities.SessionStatus;
import com.alzheimer.session_service.entities.SessionType;
import com.alzheimer.session_service.entities.SessionVisibility;
import com.alzheimer.session_service.entities.VirtualSession;
import com.alzheimer.session_service.repositories.VirtualSessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class VirtualSessionService {

    private static final String GENERIC_USER_ID = "admin";

    private final VirtualSessionRepository repository;

    public static class NotFoundException extends RuntimeException {
        public NotFoundException(String message) { super(message); }
    }

    public static class BadRequestException extends RuntimeException {
        public BadRequestException(String message) { super(message); }
    }

    public VirtualSession create(CreateSessionRequest req) {
        return createReservation(req);
    }

    public VirtualSession update(Long id, UpdateSessionRequest req) {
        VirtualSession session = getById(id);

        if (req.getEndTime().isBefore(req.getStartTime()) || req.getEndTime().equals(req.getStartTime())) {
            throw new BadRequestException("endTime must be after startTime");
        }

        session.setTitle(req.getTitle());
        session.setDescription(req.getDescription());
        session.setStartTime(req.getStartTime());
        session.setEndTime(req.getEndTime());
        session.setMeetingUrl(req.getMeetingUrl());
        session.setStatus(req.getStatus());
        session.setVisibility(req.getVisibility());
        session.setUpdatedAt(Instant.now());

        return repository.save(session);
    }

    public void delete(Long id) {
        getById(id);
        repository.deleteById(id);
    }

    public VirtualSession getById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new NotFoundException("Session not found: " + id));
    }

    public List<VirtualSession> list(Instant from, Instant to, SessionStatus status) {
        if (from != null && to != null) {
            if (status != null) {
                return repository.findByStatusAndStartTimeBetween(status, from, to);
            }
            return repository.findByStartTimeBetween(from, to);
        }
        if (status != null) {
            return repository.findByStatus(status);
        }
        if (from != null) {
            return repository.findByStartTimeGreaterThanEqual(from);
        }
        if (to != null) {
            return repository.findByStartTimeLessThanEqual(to);
        }
        return repository.findAll();
    }

    public VirtualSession addParticipant(Long sessionId, AddParticipantRequest req) {
        String participantUserId = normalizeParticipantUserId(req.getUserId());
        VirtualSession session = getById(sessionId);

        boolean exists = session.getParticipants().stream()
                .anyMatch(p -> p.getUserId().equals(participantUserId));
        if (exists) {
            throw new BadRequestException("Participant already exists in this session");
        }

        session.getParticipants().add(SessionParticipant.builder()
                .userId(participantUserId)
                .role(req.getRole())
                .joinStatus(req.getJoinStatus())
                .joinedAt(null)
                .isFavorite(false)
                .reminderMinutesBefore(null)
                .build());

        session.setUpdatedAt(Instant.now());
        return repository.save(session);
    }

    public VirtualSession updateParticipantStatus(Long sessionId, UpdateParticipantStatusRequest req) {
        VirtualSession session = getById(sessionId);
        SessionParticipant participant = findParticipant(session, GENERIC_USER_ID);

        participant.setJoinStatus(req.getJoinStatus());
        if (req.isSetJoinedNow()) {
            participant.setJoinedAt(Instant.now());
        }

        session.setUpdatedAt(Instant.now());
        return repository.save(session);
    }

    public VirtualSession updateParticipantPrefs(Long sessionId, UpdateParticipantPrefsRequest req) {
        VirtualSession session = getById(sessionId);
        SessionParticipant participant = findOrCreateParticipant(session, GENERIC_USER_ID);

        if (req.getIsFavorite() != null) {
            participant.setFavorite(req.getIsFavorite());
        }
        participant.setReminderMinutesBefore(req.getReminderMinutesBefore());

        session.setUpdatedAt(Instant.now());
        return repository.save(session);
    }

    public VirtualSession setFavorite(Long sessionId, boolean favorite) {
        UpdateParticipantPrefsRequest req = UpdateParticipantPrefsRequest.builder()
                .isFavorite(favorite)
                .build();
        return updateParticipantPrefs(sessionId, req);
    }


    public List<SessionParticipant> listParticipants(Long sessionId) {
        return getById(sessionId).getParticipants();
    }

    public List<VirtualSession> listUserFavorites() {
        return repository.findByParticipantUserId(GENERIC_USER_ID).stream()
                .filter(session -> session.getParticipants().stream()
                        .anyMatch(p -> p.getUserId().equals(GENERIC_USER_ID) && p.isFavorite()))
                .toList();
    }

    public List<VirtualSession> listUserReminders(Instant from, Instant to) {
        return repository.findByParticipantUserId(GENERIC_USER_ID).stream()
                .filter(session -> {
                    if (from != null && session.getStartTime().isBefore(from)) {
                        return false;
                    }
                    if (to != null && session.getStartTime().isAfter(to)) {
                        return false;
                    }

                    return session.getParticipants().stream().anyMatch(p ->
                            p.getUserId().equals(GENERIC_USER_ID) && p.getReminderMinutesBefore() != null
                    );
                })
                .toList();
    }

    private SessionParticipant findOrCreateParticipant(VirtualSession session, String userId) {
        return session.getParticipants().stream()
                .filter(p -> p.getUserId().equals(userId))
                .findFirst()
                .orElseGet(() -> {
                    SessionParticipant created = SessionParticipant.builder()
                            .userId(userId)
                            .role(ParticipantRole.PARTICIPANT)
                            .joinStatus(JoinStatus.INVITED)
                            .joinedAt(null)
                            .isFavorite(false)
                            .reminderMinutesBefore(null)
                            .build();
                    session.getParticipants().add(created);
                    return created;
                });
    }

    private SessionParticipant findParticipant(VirtualSession session, String userId) {
        return session.getParticipants().stream()
                .filter(p -> p.getUserId().equals(userId))
                .findFirst()
                .orElseThrow(() -> new NotFoundException("Participant not found for userId=" + userId));
    }

    private String normalizeParticipantUserId(String userId) {
        if (userId == null || userId.trim().isEmpty()) {
            return GENERIC_USER_ID;
        }
        return userId.trim();
    }

    public VirtualSession createReservation(CreateSessionRequest req) {
        if (req.getEndTime().isBefore(req.getStartTime()) || req.getEndTime().equals(req.getStartTime())) {
            throw new BadRequestException("endTime must be after startTime");
        }

        SessionType sessionType = req.getSessionType() != null ? req.getSessionType() : SessionType.PRIVATE;
        SessionVisibility visibility = resolveVisibility(req.getVisibility(), sessionType);
        MeetingMode meetingMode = resolveMeetingMode(req.getMeetingMode(), req.getMeetingUrl());
        String meetingUrl = normalizeMeetingUrl(req.getMeetingUrl());
        String createdBy = normalizeCreatedBy(req.getCreatedBy());
        SessionStatus status = resolveStatus(createdBy, req.getStatus());

        if (meetingMode == MeetingMode.ONLINE && meetingUrl == null) {
            throw new BadRequestException("meetingUrl is required for online sessions");
        }
        if (meetingMode == MeetingMode.IN_PERSON) {
            meetingUrl = null;
        }

        VirtualSession session = VirtualSession.builder()
                .title(req.getTitle())
                .description(req.getDescription())
                .startTime(req.getStartTime())
                .endTime(req.getEndTime())
                .meetingUrl(meetingUrl)
                .createdBy(createdBy)
                .status(status)
                .visibility(visibility)
                .sessionType(sessionType)
                .meetingMode(meetingMode)
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();

        return repository.save(session);
    }

    public VirtualSession respondToReservation(Long sessionId, boolean accept) {
        VirtualSession session = getById(sessionId);

        if (accept) {
            session.setStatus(SessionStatus.SCHEDULED);
        } else {
            session.setStatus(SessionStatus.CANCELLED);
        }

        return repository.save(session);
    }

    private SessionVisibility resolveVisibility(SessionVisibility requestedVisibility, SessionType sessionType) {
        if (requestedVisibility != null) {
            return requestedVisibility;
        }
        return sessionType == SessionType.GROUP ? SessionVisibility.PUBLIC : SessionVisibility.PRIVATE;
    }

    private MeetingMode resolveMeetingMode(MeetingMode requestedMode, String meetingUrl) {
        if (requestedMode != null) {
            return requestedMode;
        }
        return normalizeMeetingUrl(meetingUrl) != null ? MeetingMode.ONLINE : MeetingMode.IN_PERSON;
    }

    private SessionStatus resolveStatus(String createdBy, SessionStatus requestedStatus) {
        if (GENERIC_USER_ID.equalsIgnoreCase(createdBy) && requestedStatus != null) {
            return requestedStatus;
        }
        return SessionStatus.DRAFT;
    }

    private String normalizeCreatedBy(String createdBy) {
        if (createdBy == null || createdBy.trim().isEmpty()) {
            return GENERIC_USER_ID;
        }
        return createdBy.trim();
    }

    private String normalizeMeetingUrl(String meetingUrl) {
        if (meetingUrl == null || meetingUrl.trim().isEmpty()) {
            return null;
        }
        return meetingUrl.trim();
    }
}
