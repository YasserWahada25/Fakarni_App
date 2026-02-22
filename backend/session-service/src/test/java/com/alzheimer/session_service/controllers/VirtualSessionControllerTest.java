package com.alzheimer.session_service.controllers;

import com.alzheimer.session_service.dto.UpdateParticipantPrefsRequest;
import com.alzheimer.session_service.entities.SessionStatus;
import com.alzheimer.session_service.entities.SessionVisibility;
import com.alzheimer.session_service.entities.VirtualSession;
import com.alzheimer.session_service.services.VirtualSessionService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class VirtualSessionControllerTest {

    @Mock
    private VirtualSessionService service;

    @InjectMocks
    private VirtualSessionController controller;

    @Test
    void addFavorite_delegatesToServiceWithTrueState() {
        VirtualSession session = buildSession(1L);
        when(service.setFavorite(1L, "user-1", true)).thenReturn(session);

        VirtualSession result = controller.addFavorite(1L, "user-1");

        assertSame(session, result);
        verify(service).setFavorite(1L, "user-1", true);
    }

    @Test
    void removeFavorite_delegatesToServiceWithFalseState() {
        VirtualSession session = buildSession(2L);
        when(service.setFavorite(2L, "user-2", false)).thenReturn(session);

        VirtualSession result = controller.removeFavorite(2L, "user-2");

        assertSame(session, result);
        verify(service).setFavorite(2L, "user-2", false);
    }

    @Test
    void updateParticipantPrefs_delegatesToService() {
        UpdateParticipantPrefsRequest request = UpdateParticipantPrefsRequest.builder()
                .isFavorite(true)
                .build();
        VirtualSession session = buildSession(3L);
        when(service.updateParticipantPrefs(3L, "user-3", request)).thenReturn(session);

        VirtualSession result = controller.updateParticipantPrefs(3L, "user-3", request);

        assertSame(session, result);
        verify(service).updateParticipantPrefs(3L, "user-3", request);
    }

    @Test
    void favorites_delegatesToService() {
        VirtualSession session = buildSession(4L);
        when(service.listUserFavorites("user-4")).thenReturn(List.of(session));

        List<VirtualSession> result = controller.favorites("user-4");

        assertEquals(1, result.size());
        assertEquals(4L, result.get(0).getId());
        verify(service).listUserFavorites("user-4");
    }

    private VirtualSession buildSession(Long id) {
        return VirtualSession.builder()
                .id(id)
                .title("Session")
                .startTime(Instant.parse("2026-02-21T12:00:00Z"))
                .endTime(Instant.parse("2026-02-21T13:00:00Z"))
                .createdBy("admin")
                .status(SessionStatus.SCHEDULED)
                .visibility(SessionVisibility.PUBLIC)
                .build();
    }
}
