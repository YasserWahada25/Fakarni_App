package com.alzheimer.session_service.controllers;

import com.alzheimer.session_service.dto.AddParticipantRequest;
import com.alzheimer.session_service.dto.CreateSessionRequest;
import com.alzheimer.session_service.dto.UpdateParticipantPrefsRequest;
import com.alzheimer.session_service.dto.UpdateParticipantStatusRequest;
import com.alzheimer.session_service.dto.UpdateSessionRequest;
import com.alzheimer.session_service.entities.SessionParticipant;
import com.alzheimer.session_service.entities.SessionStatus;
import com.alzheimer.session_service.entities.VirtualSession;
import com.alzheimer.session_service.services.VirtualSessionService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.List;

@RestController
@RequestMapping("/session")
public class VirtualSessionController {

    private final VirtualSessionService service;

    public VirtualSessionController(VirtualSessionService service) {
        this.service = service;
    }

    @PostMapping("/sessions")
    public VirtualSession createSession(@Valid @RequestBody CreateSessionRequest req) {
        return service.createReservation(req);
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

    @PostMapping("/sessions/{id}/participants")
    public VirtualSession addParticipant(@PathVariable Long id, @Valid @RequestBody AddParticipantRequest req) {
        return service.addParticipant(id, req);
    }

    @PatchMapping("/sessions/{id}/participants/me")
    public VirtualSession updateMyParticipantStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateParticipantStatusRequest req
    ) {
        return service.updateParticipantStatus(id, req);
    }

    @PatchMapping("/sessions/{id}/participants/me/prefs")
    public VirtualSession updateMyParticipantPrefs(
            @PathVariable Long id,
            @Valid @RequestBody UpdateParticipantPrefsRequest req
    ) {
        return service.updateParticipantPrefs(id, req);
    }

    @GetMapping("/sessions/{id}/participants")
    public List<SessionParticipant> listParticipants(@PathVariable Long id) {
        return service.listParticipants(id);
    }

    @GetMapping("/me/favorites")
    public List<VirtualSession> favorites() {
        return service.listUserFavorites();
    }

    @GetMapping("/me/reminders")
    public List<VirtualSession> reminders(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant to
    ) {
        return service.listUserReminders(from, to);
    }

    @PatchMapping("/sessions/{id}/response")
    public VirtualSession respondToSession(@PathVariable Long id, @RequestParam boolean accept) {
        try {
            return service.respondToReservation(id, accept);
        } catch (VirtualSessionService.BadRequestException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage(), e);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Erreur serveur interne", e);
        }
    }
}
