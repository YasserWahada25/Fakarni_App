package com.alzheimer.session_service.controllers;

import com.alzheimer.session_service.dto.*;
import com.alzheimer.session_service.entities.SessionParticipant;
import com.alzheimer.session_service.entities.SessionStatus;
import com.alzheimer.session_service.entities.VirtualSession;
import com.alzheimer.session_service.services.VirtualSessionService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
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
    public VirtualSession create(@AuthenticationPrincipal Jwt jwt,
                                 @Valid @RequestBody CreateSessionRequest req) {
        String userId = jwt.getSubject();
        return service.create(req, userId);
    }

    @PutMapping("/sessions/{id}")
    public VirtualSession update(@AuthenticationPrincipal Jwt jwt,
                                 @PathVariable Long id,
                                 @Valid @RequestBody UpdateSessionRequest req) {
        String userId = jwt.getSubject();
        return service.update(id, req, userId);
    }

    @DeleteMapping("/sessions/{id}")
    public void delete(@AuthenticationPrincipal Jwt jwt, @PathVariable Long id) {
        String userId = jwt.getSubject();
        service.delete(id, userId);
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
    public VirtualSession addParticipant(@AuthenticationPrincipal Jwt jwt,
                                         @PathVariable Long id,
                                         @Valid @RequestBody AddParticipantRequest req) {
        String userId = jwt.getSubject();
        return service.addParticipant(id, req, userId);
    }

    @PatchMapping("/sessions/{id}/participants/me")
    public VirtualSession updateMyParticipantStatus(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable Long id,
            @Valid @RequestBody UpdateParticipantStatusRequest req
    ) {
        String userId = jwt.getSubject();
        return service.updateParticipantStatus(id, userId, req);
    }

    @PatchMapping("/sessions/{id}/participants/me/prefs")
    public VirtualSession updateMyParticipantPrefs(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable Long id,
            @Valid @RequestBody UpdateParticipantPrefsRequest req
    ) {
        String userId = jwt.getSubject();
        return service.updateParticipantPrefs(id, userId, req);
    }

    @GetMapping("/sessions/{id}/participants")
    public List<SessionParticipant> listParticipants(@PathVariable Long id) {
        return service.listParticipants(id);
    }

    // ---- Views ----

    @GetMapping("/me/favorites")
    public List<VirtualSession> favorites(@AuthenticationPrincipal Jwt jwt) {
        String userId = jwt.getSubject();
        return service.listUserFavorites(userId);
    }

    @GetMapping("/me/reminders")
    public List<VirtualSession> reminders(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant to
    ) {
        String userId = jwt.getSubject();
        return service.listUserReminders(userId, from, to);
    }
}