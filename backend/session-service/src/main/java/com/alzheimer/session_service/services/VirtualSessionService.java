package com.alzheimer.session_service.services;

import com.alzheimer.session_service.dto.*;
import com.alzheimer.session_service.entities.*;
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
    // Exceptions internes (pas de dossier séparé)
    // =========================
    public static class NotFoundException extends RuntimeException {
        public NotFoundException(String message) { super(message); }
    }

    public static class BadRequestException extends RuntimeException {
        public BadRequestException(String message) { super(message); }
    }

    // -------- Sessions CRUD --------

    public VirtualSession create(CreateSessionRequest req) {
        if (req.getEndTime().isBefore(req.getStartTime()) || req.getEndTime().equals(req.getStartTime())) {
            throw new BadRequestException("endTime must be after startTime");
        }

        VirtualSession session = VirtualSession.builder()
                .title(req.getTitle())
                .description(req.getDescription())
                .startTime(req.getStartTime())
                .endTime(req.getEndTime())
                .meetingUrl(req.getMeetingUrl())
                .createdBy(req.getCreatedBy())
                .status(req.getStatus())
                .visibility(req.getVisibility())
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();

        return repository.save(session);
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
        if (!repository.existsById(id)) {
            throw new NotFoundException("Session not found: " + id);
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
        if (status == null) return repository.findByStartTimeBetween(from, to);
        return repository.findByStatusAndStartTimeBetween(status, from, to);
    }

    // -------- Participants --------

    public VirtualSession addParticipant(Long sessionId, AddParticipantRequest req) {
        VirtualSession session = getById(sessionId);

        boolean exists = session.getParticipants().stream()
                .anyMatch(p -> p.getUserId().equals(req.getUserId()));
        if (exists) throw new BadRequestException("Participant already exists in this session");

        session.getParticipants().add(SessionParticipant.builder()
                .userId(req.getUserId())
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
        VirtualSession session = getById(sessionId);
        SessionParticipant p = findParticipant(session, userId);

        p.setJoinStatus(req.getJoinStatus());

        // si ton DTO a boolean -> utilise req.isSetJoinedNow()
        // si ton DTO a Boolean -> utilise Boolean.TRUE.equals(req.getSetJoinedNow())
        if (req.isSetJoinedNow()) {
            p.setJoinedAt(Instant.now());
        }

        session.setUpdatedAt(Instant.now());
        return repository.save(session);
    }

    public VirtualSession updateParticipantPrefs(Long sessionId, String userId, UpdateParticipantPrefsRequest req) {
        VirtualSession session = getById(sessionId);
        SessionParticipant p = findParticipant(session, userId);

        if (req.getIsFavorite() != null) p.setFavorite(req.getIsFavorite()); // Lombok: setFavorite(...)
        p.setReminderMinutesBefore(req.getReminderMinutesBefore()); // null => disable

        session.setUpdatedAt(Instant.now());
        return repository.save(session);
    }

    public List<SessionParticipant> listParticipants(Long sessionId) {
        return getById(sessionId).getParticipants();
    }

    // -------- Views (favorites/reminders) --------

    public List<VirtualSession> listUserFavorites(String userId) {
        return repository.findByParticipantUserId(userId).stream()
                .filter(s -> s.getParticipants().stream()
                        .anyMatch(p -> p.getUserId().equals(userId) && p.isFavorite()))
                .toList();
    }

    public List<VirtualSession> listUserReminders(String userId, Instant from, Instant to) {
        return repository.findByParticipantUserId(userId).stream()
                .filter(s -> {
                    if (from != null && s.getStartTime().isBefore(from)) return false;
                    if (to != null && s.getStartTime().isAfter(to)) return false;

                    return s.getParticipants().stream().anyMatch(p ->
                            p.getUserId().equals(userId) && p.getReminderMinutesBefore() != null
                    );
                })
                .toList();
    }

    private SessionParticipant findParticipant(VirtualSession session, String userId) {
        return session.getParticipants().stream()
                .filter(p -> p.getUserId().equals(userId))
                .findFirst()
                .orElseThrow(() -> new NotFoundException("Participant not found for userId=" + userId));
    }
}
