package com.alzheimer.session_service.services;

import com.alzheimer.session_service.dto.AddParticipantRequest;
import com.alzheimer.session_service.dto.CreateSessionRequest;
import com.alzheimer.session_service.dto.UpdateParticipantPrefsRequest;
import com.alzheimer.session_service.dto.UpdateParticipantStatusRequest;
import com.alzheimer.session_service.dto.UpdateSessionRequest;
import com.alzheimer.session_service.entities.JoinStatus;
import com.alzheimer.session_service.entities.ParticipantRole;
import com.alzheimer.session_service.entities.SessionParticipant;
import com.alzheimer.session_service.entities.SessionStatus;
import com.alzheimer.session_service.entities.VirtualSession;
import com.alzheimer.session_service.repositories.VirtualSessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class VirtualSessionService {

    private final VirtualSessionRepository repository;

    // =========================
    // Exceptions internes (pas de dossier separe)
    // =========================
    public static class NotFoundException extends RuntimeException {
        public NotFoundException(String message) { super(message); }
    }

    public static class BadRequestException extends RuntimeException {
        public BadRequestException(String message) { super(message); }
    }

    // -------- Sessions CRUD --------

    public VirtualSession create(CreateSessionRequest req, String userId) {
        if (req.getEndTime().isBefore(req.getStartTime()) || req.getEndTime().equals(req.getStartTime())) {
            throw new BadRequestException("endTime must be after startTime");
        }

        VirtualSession session = VirtualSession.builder()
                .title(req.getTitle())
                .description(req.getDescription())
                .startTime(req.getStartTime())
                .endTime(req.getEndTime())
                .meetingUrl(req.getMeetingUrl())
                .createdBy(userId)
                .status(req.getStatus())
                .visibility(req.getVisibility())
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();

        return repository.save(session);
    }

    public VirtualSession update(Long id, UpdateSessionRequest req, String userId) {
        VirtualSession session = getById(id);

        if (!userId.equals(session.getCreatedBy())) {
            throw new BadRequestException("You are not allowed to update this session");
        }

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

    public void delete(Long id, String userId) {
        VirtualSession session = getById(id);

        if (!userId.equals(session.getCreatedBy())) {
            throw new BadRequestException("You are not allowed to delete this session");
        }

        repository.deleteById(id);
    }

    public VirtualSession getById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new NotFoundException("Session not found: " + id));
    }

    public List<VirtualSession> list(Instant from, Instant to, SessionStatus status) {
        if (from == null || to == null) {
            return repository.findAll();
        }
        if (status == null) {
            return repository.findByStartTimeBetween(from, to);
        }
        return repository.findByStatusAndStartTimeBetween(status, from, to);
    }

    // -------- Participants --------

    public VirtualSession addParticipant(Long sessionId, AddParticipantRequest req, String userId) {
        String normalizedUserId = normalizeUserId(userId);
        VirtualSession session = getById(sessionId);

        boolean exists = session.getParticipants().stream()
                .anyMatch(p -> p.getUserId().equals(normalizedUserId));
        if (exists) {
            throw new BadRequestException("Participant already exists in this session");
        }

        session.getParticipants().add(SessionParticipant.builder()
                .userId(normalizedUserId)
                .role(req.getRole())
                .joinStatus(req.getJoinStatus())
                .joinedAt(null)
                .isFavorite(false)
                .reminderMinutesBefore(null)
                .build());

        session.setUpdatedAt(Instant.now());
        return repository.save(session);
    }

    public VirtualSession updateParticipantStatus(Long sessionId, String userId, UpdateParticipantStatusRequest req) {
        String normalizedUserId = normalizeUserId(userId);
        VirtualSession session = getById(sessionId);
        SessionParticipant participant = findParticipant(session, normalizedUserId);

        participant.setJoinStatus(req.getJoinStatus());
        if (req.isSetJoinedNow()) {
            participant.setJoinedAt(Instant.now());
        }

        session.setUpdatedAt(Instant.now());
        return repository.save(session);
    }

    public VirtualSession updateParticipantPrefs(Long sessionId, String userId, UpdateParticipantPrefsRequest req) {
        String normalizedUserId = normalizeUserId(userId);
        VirtualSession session = getById(sessionId);
        SessionParticipant participant = findOrCreateParticipant(session, normalizedUserId);

        if (req.getIsFavorite() != null) {
            participant.setFavorite(req.getIsFavorite());
        }
        participant.setReminderMinutesBefore(req.getReminderMinutesBefore());

        session.setUpdatedAt(Instant.now());
        return repository.save(session);
    }

    public VirtualSession setFavorite(Long sessionId, String userId, boolean favorite) {
        UpdateParticipantPrefsRequest req = UpdateParticipantPrefsRequest.builder()
                .isFavorite(favorite)
                .build();
        return updateParticipantPrefs(sessionId, userId, req);
    }

    public List<SessionParticipant> listParticipants(Long sessionId) {
        return getById(sessionId).getParticipants();
    }

    // -------- Views (favorites/reminders) --------

    public List<VirtualSession> listUserFavorites(String userId) {
        String normalizedUserId = normalizeUserId(userId);
        return repository.findByParticipantUserId(normalizedUserId).stream()
                .filter(session -> session.getParticipants().stream()
                        .anyMatch(p -> p.getUserId().equals(normalizedUserId) && p.isFavorite()))
                .toList();
    }

    public List<VirtualSession> listUserReminders(String userId, Instant from, Instant to) {
        String normalizedUserId = normalizeUserId(userId);
        return repository.findByParticipantUserId(normalizedUserId).stream()
                .filter(session -> {
                    if (from != null && session.getStartTime().isBefore(from)) return false;
                    if (to != null && session.getStartTime().isAfter(to)) return false;

                    return session.getParticipants().stream().anyMatch(p ->
                            p.getUserId().equals(normalizedUserId) && p.getReminderMinutesBefore() != null
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

    private String normalizeUserId(String userId) {
        if (userId == null) {
            throw new BadRequestException("userId is required");
        }
        String normalizedUserId = userId.trim();
        if (normalizedUserId.isEmpty()) {
            throw new BadRequestException("userId is required");
        }
        return normalizedUserId;
    }
}
