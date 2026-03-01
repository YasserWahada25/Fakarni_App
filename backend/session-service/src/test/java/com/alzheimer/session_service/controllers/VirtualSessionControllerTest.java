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
    void updateMyParticipantPrefs_delegatesToService_withoutJwt() {
        UpdateParticipantPrefsRequest request = UpdateParticipantPrefsRequest.builder()
                .isFavorite(true)
                .build();

        VirtualSession session = buildSession(3L);

        when(service.updateParticipantPrefs(3L, request)).thenReturn(session);

        VirtualSession result = controller.updateMyParticipantPrefs(3L, request);

        assertSame(session, result);
        verify(service).updateParticipantPrefs(3L, request);
    }

    @Test
    void favorites_delegatesToService_withoutJwt() {
        VirtualSession session = buildSession(4L);
        when(service.listUserFavorites()).thenReturn(List.of(session));

        List<VirtualSession> result = controller.favorites();

        assertEquals(1, result.size());
        assertEquals(4L, result.get(0).getId());
        verify(service).listUserFavorites();
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
