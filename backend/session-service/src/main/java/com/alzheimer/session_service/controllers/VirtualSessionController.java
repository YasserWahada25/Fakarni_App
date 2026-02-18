package com.alzheimer.session_service.controllers;

import com.alzheimer.session_service.dto.*;
import com.alzheimer.session_service.entities.SessionParticipant;
import com.alzheimer.session_service.entities.SessionStatus;
import com.alzheimer.session_service.entities.VirtualSession;
import com.alzheimer.session_service.services.VirtualSessionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;

@RestController
@RequestMapping("/session")

public class VirtualSessionController {


    private final VirtualSessionService service;


    public VirtualSessionController(VirtualSessionService service) {
        this.service = service;
    }
    // ---- Sessions CRUD ----

    @PostMapping("/sessions")
    public VirtualSession create(@Valid @RequestBody CreateSessionRequest req) {
        return service.create(req);
    }

    @PutMapping("/sessions/{id}")
    public VirtualSession update(@PathVariable Long id, @Valid @RequestBody UpdateSessionRequest req) {
        return service.update(id, req);
    }

    @DeleteMapping("/sessions/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }

    @GetMapping("/sessions/{id}")
    public VirtualSession get(@PathVariable Long id) {
        return service.getById(id);
    }

    @GetMapping("/sessions")
    public List<VirtualSession> list(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant to,
            @RequestParam(required = false) SessionStatus status
    ) {
        return service.list(from, to, status);
    }

    // ---- Participants ----

    @PostMapping("/sessions/{id}/participants")
    public VirtualSession addParticipant(@PathVariable Long id, @Valid @RequestBody AddParticipantRequest req) {
        return service.addParticipant(id, req);
    }

    @PatchMapping("/sessions/{id}/participants/{userId}")
    public VirtualSession updateParticipantStatus(
            @PathVariable Long id,
            @PathVariable String userId,
            @Valid @RequestBody UpdateParticipantStatusRequest req
    ) {
        return service.updateParticipantStatus(id, userId, req);
    }

    @PatchMapping("/sessions/{id}/participants/{userId}/prefs")
    public VirtualSession updateParticipantPrefs(
            @PathVariable Long id,
            @PathVariable String userId,
            @Valid @RequestBody UpdateParticipantPrefsRequest req
    ) {
        return service.updateParticipantPrefs(id, userId, req);
    }

    @GetMapping("/sessions/{id}/participants")
    public List<SessionParticipant> listParticipants(@PathVariable Long id) {
        return service.listParticipants(id);
    }

    // ---- Views ----

    @GetMapping("/users/{userId}/favorites")
    public List<VirtualSession> favorites(@PathVariable String userId) {
        return service.listUserFavorites(userId);
    }

    @GetMapping("/users/{userId}/reminders")
    public List<VirtualSession> reminders(
            @PathVariable String userId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant to
    ) {
        return service.listUserReminders(userId, from, to);
    }
}
