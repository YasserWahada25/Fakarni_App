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
import org.springframework.security.oauth2.jwt.Jwt;

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
    void updateMyParticipantPrefs_delegatesToService_withUserFromJwt() {
        Jwt jwt = buildJwt("user-3");

        UpdateParticipantPrefsRequest request = UpdateParticipantPrefsRequest.builder()
                .isFavorite(true)
                .build();

        VirtualSession session = buildSession(3L);

        when(service.updateParticipantPrefs(3L, "user-3", request)).thenReturn(session);

        VirtualSession result = controller.updateMyParticipantPrefs(jwt, 3L, request);

        assertSame(session, result);
        verify(service).updateParticipantPrefs(3L, "user-3", request);
    }

    @Test
    void favorites_delegatesToService_withUserFromJwt() {
        Jwt jwt = buildJwt("user-4");

        VirtualSession session = buildSession(4L);
        when(service.listUserFavorites("user-4")).thenReturn(List.of(session));

        List<VirtualSession> result = controller.favorites(jwt);

        assertEquals(1, result.size());
        assertEquals(4L, result.get(0).getId());
        verify(service).listUserFavorites("user-4");
    }

    // -------- Helpers --------

    private Jwt buildJwt(String userId) {
        return Jwt.withTokenValue("dummy-token")
                .header("alg", "HS256")
                .subject(userId)                 // ✅ jwt.getSubject() == userId
                .claim("role", "PATIENT_PROFILE")
                .build();
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