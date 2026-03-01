package com.alzheimer.session_service.controllers;

import com.alzheimer.session_service.dto.JoinVideoSessionRequest;
import com.alzheimer.session_service.dto.StartVideoSessionRequest;
import com.alzheimer.session_service.dto.VideoSessionDTO;
import com.alzheimer.session_service.entities.SessionType;
import com.alzheimer.session_service.entities.SessionVisibility;
import com.alzheimer.session_service.entities.VideoSessionStatus;
import com.alzheimer.session_service.services.VideoSessionService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import tools.jackson.databind.ObjectMapper;

import java.time.Instant;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class VideoSessionControllerTest {

    @Mock
    private VideoSessionService videoSessionService;

    @Mock
    private SimpMessagingTemplate messagingTemplate;

    @Mock
    private ObjectMapper objectMapper;

    @InjectMocks
    private VideoSessionController controller;

    private VideoSessionDTO buildDTO(VideoSessionStatus status) {
        return VideoSessionDTO.builder()
                .id(1L)
                .roomId("room-uuid-123")
                .virtualSessionId(10L)
                .hostUserId("alice")
                .sessionType(SessionType.GROUP)
                .sessionVisibility(SessionVisibility.PRIVATE)
                .status(status)
                .maxParticipants(8)
                .currentParticipants(0)
                .startedAt(Instant.now())
                .build();
    }

    @Test
    void startVideoSession_delegatesToService() {
        StartVideoSessionRequest req = StartVideoSessionRequest.builder()
                .virtualSessionId(10L)
                .hostUserId("alice")
                .maxParticipants(8)
                .build();
        VideoSessionDTO expected = buildDTO(VideoSessionStatus.WAITING);

        when(videoSessionService.startVideoSession(req)).thenReturn(expected);

        VideoSessionDTO result = controller.startVideoSession(req);

        assertSame(expected, result);
        verify(videoSessionService).startVideoSession(req);
    }

    @Test
    void joinVideoSession_delegatesToService() {
        JoinVideoSessionRequest req = JoinVideoSessionRequest.builder()
                .roomId("room-uuid-123")
                .userId("bob")
                .build();
        VideoSessionDTO expected = buildDTO(VideoSessionStatus.ACTIVE);

        when(videoSessionService.joinVideoSession(req)).thenReturn(expected);

        VideoSessionDTO result = controller.joinVideoSession(req);

        assertSame(expected, result);
        assertEquals(VideoSessionStatus.ACTIVE, result.getStatus());
        verify(videoSessionService).joinVideoSession(req);
    }

    @Test
    void getVideoSession_delegatesToService() {
        VideoSessionDTO expected = buildDTO(VideoSessionStatus.ACTIVE);

        when(videoSessionService.getVideoSession(1L)).thenReturn(expected);

        VideoSessionDTO result = controller.getVideoSession(1L);

        assertSame(expected, result);
        verify(videoSessionService).getVideoSession(1L);
    }

    @Test
    void endVideoSession_delegatesToService() {
        VideoSessionDTO expected = VideoSessionDTO.builder()
                .id(1L)
                .roomId("room-uuid-123")
                .virtualSessionId(10L)
                .hostUserId("alice")
                .sessionType(SessionType.GROUP)
                .sessionVisibility(SessionVisibility.PRIVATE)
                .status(VideoSessionStatus.ENDED)
                .maxParticipants(8)
                .currentParticipants(1)
                .startedAt(Instant.now().minusSeconds(600))
                .endedAt(Instant.now())
                .build();

        when(videoSessionService.endVideoSession(1L, "alice")).thenReturn(expected);

        VideoSessionDTO result = controller.endVideoSession(1L, "alice");

        assertSame(expected, result);
        assertEquals(VideoSessionStatus.ENDED, result.getStatus());
        assertNotNull(result.getEndedAt());
        verify(videoSessionService).endVideoSession(1L, "alice");
    }
}
