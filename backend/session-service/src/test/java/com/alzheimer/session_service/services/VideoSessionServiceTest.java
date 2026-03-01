package com.alzheimer.session_service.services;

import com.alzheimer.session_service.dto.JoinVideoSessionRequest;
import com.alzheimer.session_service.dto.StartVideoSessionRequest;
import com.alzheimer.session_service.dto.VideoSessionDTO;
import com.alzheimer.session_service.entities.*;
import com.alzheimer.session_service.repositories.VideoChatMessageRepository;
import com.alzheimer.session_service.repositories.VideoSessionRepository;
import com.alzheimer.session_service.repositories.VirtualSessionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class VideoSessionServiceTest {

    @Mock
    private VideoSessionRepository videoSessionRepository;

    @Mock
    private VirtualSessionRepository virtualSessionRepository;

    @Mock
    private VideoChatMessageRepository videoChatMessageRepository;

    @InjectMocks
    private VideoSessionService videoSessionService;

    private VirtualSession scheduledOnlineSession;
    private VideoSession existingVideoSession;

    @BeforeEach
    void setUp() {
        List<SessionParticipant> participants = new ArrayList<>();
        participants.add(SessionParticipant.builder()
                .userId("alice")
                .role(ParticipantRole.HOST)
                .joinStatus(JoinStatus.CONFIRMED)
                .isFavorite(false)
                .build());
        participants.add(SessionParticipant.builder()
                .userId("bob")
                .role(ParticipantRole.PARTICIPANT)
                .joinStatus(JoinStatus.CONFIRMED)
                .isFavorite(false)
                .build());

        scheduledOnlineSession = VirtualSession.builder()
                .id(1L)
                .title("Séance mémoire")
                .startTime(Instant.parse("2026-03-10T10:00:00Z"))
                .endTime(Instant.parse("2026-03-10T11:00:00Z"))
                .createdBy("alice")
                .status(SessionStatus.SCHEDULED)
                .visibility(SessionVisibility.PRIVATE)
                .sessionType(SessionType.GROUP)
                .meetingMode(MeetingMode.ONLINE)
                .meetingUrl("https://meet.example.com/abc")
                .participants(participants)
                .build();

        existingVideoSession = VideoSession.builder()
                .id(10L)
                .roomId("test-room-uuid")
                .virtualSessionId(1L)
                .sessionType(SessionType.GROUP)
                .sessionVisibility(SessionVisibility.PRIVATE)
                .hostUserId("alice")
                .maxParticipants(10)
                .currentParticipants(1)
                .activeParticipantIds(new HashSet<>(Set.of("alice")))
                .status(VideoSessionStatus.ACTIVE)
                .startedAt(Instant.now())
                .build();
    }

    // ─── startVideoSession ────────────────────────────────────────────────────────

    @Test
    void startVideoSession_success_returnsVideoSessionDTO() {
        StartVideoSessionRequest req = StartVideoSessionRequest.builder()
                .virtualSessionId(1L)
                .hostUserId("alice")
                .maxParticipants(8)
                .build();

        when(virtualSessionRepository.findById(1L)).thenReturn(Optional.of(scheduledOnlineSession));
        when(videoSessionRepository.findByVirtualSessionId(1L)).thenReturn(Optional.empty());
        when(videoSessionRepository.save(any(VideoSession.class))).thenAnswer(inv -> {
            VideoSession saved = inv.getArgument(0);
            saved = VideoSession.builder()
                    .id(99L)
                    .roomId(saved.getRoomId())
                    .virtualSessionId(saved.getVirtualSessionId())
                    .sessionType(saved.getSessionType())
                    .sessionVisibility(saved.getSessionVisibility())
                    .hostUserId(saved.getHostUserId())
                    .maxParticipants(saved.getMaxParticipants())
                    .currentParticipants(0)
                    .status(VideoSessionStatus.WAITING)
                    .startedAt(Instant.now())
                    .build();
            return saved;
        });

        VideoSessionDTO result = videoSessionService.startVideoSession(req);

        assertNotNull(result);
        assertNotNull(result.getRoomId());
        assertEquals(VideoSessionStatus.WAITING, result.getStatus());
        assertEquals("alice", result.getHostUserId());
        assertEquals(8, result.getMaxParticipants());
        verify(videoSessionRepository).save(any(VideoSession.class));
    }

    @Test
    void startVideoSession_privateSession_forcesMaxParticipantsTo2() {
        scheduledOnlineSession.setSessionType(SessionType.PRIVATE);
        StartVideoSessionRequest req = StartVideoSessionRequest.builder()
                .virtualSessionId(1L)
                .hostUserId("alice")
                .maxParticipants(10) // ignoré pour PRIVATE
                .build();

        when(virtualSessionRepository.findById(1L)).thenReturn(Optional.of(scheduledOnlineSession));
        when(videoSessionRepository.findByVirtualSessionId(1L)).thenReturn(Optional.empty());
        when(videoSessionRepository.save(any(VideoSession.class))).thenAnswer(inv -> inv.getArgument(0));

        VideoSessionDTO result = videoSessionService.startVideoSession(req);

        assertEquals(2, result.getMaxParticipants());
    }

    @Test
    void startVideoSession_inPersonMode_throwsBadRequest() {
        scheduledOnlineSession.setMeetingMode(MeetingMode.IN_PERSON);
        StartVideoSessionRequest req = StartVideoSessionRequest.builder()
                .virtualSessionId(1L)
                .hostUserId("alice")
                .build();

        when(virtualSessionRepository.findById(1L)).thenReturn(Optional.of(scheduledOnlineSession));

        assertThrows(VirtualSessionService.BadRequestException.class,
                () -> videoSessionService.startVideoSession(req));
        verify(videoSessionRepository, never()).save(any());
    }

    @Test
    void startVideoSession_notScheduled_throwsBadRequest() {
        scheduledOnlineSession.setStatus(SessionStatus.DRAFT);
        StartVideoSessionRequest req = StartVideoSessionRequest.builder()
                .virtualSessionId(1L)
                .hostUserId("alice")
                .build();

        when(virtualSessionRepository.findById(1L)).thenReturn(Optional.of(scheduledOnlineSession));

        assertThrows(VirtualSessionService.BadRequestException.class,
                () -> videoSessionService.startVideoSession(req));
    }

    @Test
    void startVideoSession_unauthorizedUser_throwsUnauthorized() {
        StartVideoSessionRequest req = StartVideoSessionRequest.builder()
                .virtualSessionId(1L)
                .hostUserId("charlie") // pas dans la liste
                .build();

        when(virtualSessionRepository.findById(1L)).thenReturn(Optional.of(scheduledOnlineSession));

        assertThrows(VideoSessionService.UnauthorizedException.class,
                () -> videoSessionService.startVideoSession(req));
    }

    @Test
    void startVideoSession_activeRoomAlreadyExists_throwsConflict() {
        StartVideoSessionRequest req = StartVideoSessionRequest.builder()
                .virtualSessionId(1L)
                .hostUserId("alice")
                .build();

        when(virtualSessionRepository.findById(1L)).thenReturn(Optional.of(scheduledOnlineSession));
        when(videoSessionRepository.findByVirtualSessionId(1L)).thenReturn(Optional.of(existingVideoSession));

        assertThrows(VideoSessionService.VideoSessionAlreadyExistsException.class,
                () -> videoSessionService.startVideoSession(req));
    }

    // ─── joinVideoSession ─────────────────────────────────────────────────────────

    @Test
    void joinVideoSession_success_incrementsParticipants() {
        existingVideoSession.setStatus(VideoSessionStatus.WAITING);
        existingVideoSession.setCurrentParticipants(0);
        existingVideoSession.setActiveParticipantIds(new HashSet<>());

        JoinVideoSessionRequest req = JoinVideoSessionRequest.builder()
                .roomId("test-room-uuid")
                .userId("bob")
                .build();

        when(videoSessionRepository.findByRoomId("test-room-uuid")).thenReturn(Optional.of(existingVideoSession));
        when(virtualSessionRepository.findById(1L)).thenReturn(Optional.of(scheduledOnlineSession));
        when(videoSessionRepository.save(any(VideoSession.class))).thenAnswer(inv -> inv.getArgument(0));

        VideoSessionDTO result = videoSessionService.joinVideoSession(req);

        assertEquals(1, result.getCurrentParticipants());
        assertEquals(VideoSessionStatus.ACTIVE, result.getStatus()); // WAITING → ACTIVE
    }

    @Test
    void joinVideoSession_idempotent_sameUserDoesNotIncrementTwice() {
        existingVideoSession.setStatus(VideoSessionStatus.WAITING);
        existingVideoSession.setCurrentParticipants(0);
        existingVideoSession.setActiveParticipantIds(new HashSet<>());

        JoinVideoSessionRequest req = JoinVideoSessionRequest.builder()
                .roomId("test-room-uuid")
                .userId("bob")
                .build();

        when(videoSessionRepository.findByRoomId("test-room-uuid")).thenReturn(Optional.of(existingVideoSession));
        when(virtualSessionRepository.findById(1L)).thenReturn(Optional.of(scheduledOnlineSession));
        when(videoSessionRepository.save(any(VideoSession.class))).thenAnswer(inv -> inv.getArgument(0));

        videoSessionService.joinVideoSession(req);
        VideoSessionDTO second = videoSessionService.joinVideoSession(req);

        assertEquals(1, second.getCurrentParticipants());
        verify(videoSessionRepository, times(1)).save(any(VideoSession.class));
    }

    @Test
    void joinVideoSession_sessionFull_throwsConflict() {
        existingVideoSession.setMaxParticipants(2);
        existingVideoSession.setCurrentParticipants(2);
        existingVideoSession.setActiveParticipantIds(new HashSet<>(Set.of("alice", "charlie")));

        JoinVideoSessionRequest req = JoinVideoSessionRequest.builder()
                .roomId("test-room-uuid")
                .userId("bob")
                .build();

        when(videoSessionRepository.findByRoomId("test-room-uuid")).thenReturn(Optional.of(existingVideoSession));
        when(virtualSessionRepository.findById(1L)).thenReturn(Optional.of(scheduledOnlineSession));

        assertThrows(VideoSessionService.VideoSessionFullException.class,
                () -> videoSessionService.joinVideoSession(req));
    }

    @Test
    void joinVideoSession_legacyInvalidCapacity_isNormalizedAndAllowsJoin() {
        existingVideoSession.setSessionVisibility(SessionVisibility.PUBLIC);
        existingVideoSession.setMaxParticipants(1); // legacy invalid state
        existingVideoSession.setCurrentParticipants(1);
        existingVideoSession.setActiveParticipantIds(new HashSet<>()); // legacy missing active rows
        existingVideoSession.setStatus(VideoSessionStatus.ACTIVE);

        JoinVideoSessionRequest req = JoinVideoSessionRequest.builder()
                .roomId("test-room-uuid")
                .userId("bob")
                .build();

        when(videoSessionRepository.findByRoomId("test-room-uuid")).thenReturn(Optional.of(existingVideoSession));
        when(virtualSessionRepository.findById(1L)).thenReturn(Optional.of(scheduledOnlineSession));
        when(videoSessionRepository.save(any(VideoSession.class))).thenAnswer(inv -> inv.getArgument(0));

        VideoSessionDTO result = videoSessionService.joinVideoSession(req);

        assertEquals(2, result.getCurrentParticipants());
        assertTrue(result.getMaxParticipants() >= 2);
        assertEquals(VideoSessionStatus.ACTIVE, result.getStatus());
    }

    @Test
    void joinVideoSession_hostCanJoinPrivateRoom_evenIfNotInParticipants() {
        existingVideoSession.setStatus(VideoSessionStatus.WAITING);
        existingVideoSession.setCurrentParticipants(0);
        existingVideoSession.setActiveParticipantIds(new HashSet<>());
        scheduledOnlineSession.getParticipants().removeIf(p -> p.getUserId().equals("alice"));

        JoinVideoSessionRequest req = JoinVideoSessionRequest.builder()
                .roomId("test-room-uuid")
                .userId("alice")
                .build();

        when(videoSessionRepository.findByRoomId("test-room-uuid")).thenReturn(Optional.of(existingVideoSession));
        when(videoSessionRepository.save(any(VideoSession.class))).thenAnswer(inv -> inv.getArgument(0));

        VideoSessionDTO result = videoSessionService.joinVideoSession(req);

        assertEquals(1, result.getCurrentParticipants());
        assertEquals(VideoSessionStatus.ACTIVE, result.getStatus());
        verify(virtualSessionRepository, never()).findById(any());
    }

    @Test
    void joinVideoSession_userNotConfirmed_throwsUnauthorized() {
        // bob a JoinStatus.INVITED (non confirmé)
        scheduledOnlineSession.getParticipants().stream()
                .filter(p -> p.getUserId().equals("bob"))
                .findFirst()
                .ifPresent(p -> p.setJoinStatus(JoinStatus.INVITED));

        JoinVideoSessionRequest req = JoinVideoSessionRequest.builder()
                .roomId("test-room-uuid")
                .userId("bob")
                .build();

        when(videoSessionRepository.findByRoomId("test-room-uuid")).thenReturn(Optional.of(existingVideoSession));
        when(virtualSessionRepository.findById(1L)).thenReturn(Optional.of(scheduledOnlineSession));

        assertThrows(VideoSessionService.UnauthorizedException.class,
                () -> videoSessionService.joinVideoSession(req));
    }

    @Test
    void joinVideoSession_endedSession_throwsBadRequest() {
        existingVideoSession.setStatus(VideoSessionStatus.ENDED);

        JoinVideoSessionRequest req = JoinVideoSessionRequest.builder()
                .roomId("test-room-uuid")
                .userId("bob")
                .build();

        when(videoSessionRepository.findByRoomId("test-room-uuid")).thenReturn(Optional.of(existingVideoSession));

        assertThrows(VirtualSessionService.BadRequestException.class,
                () -> videoSessionService.joinVideoSession(req));
    }

    // ─── endVideoSession ──────────────────────────────────────────────────────────

    @Test
    void endVideoSession_byHost_succeeds() {
        when(videoSessionRepository.findById(10L)).thenReturn(Optional.of(existingVideoSession));
        when(videoSessionRepository.save(any(VideoSession.class))).thenAnswer(inv -> inv.getArgument(0));
        when(virtualSessionRepository.findById(1L)).thenReturn(Optional.of(scheduledOnlineSession));
        when(virtualSessionRepository.save(any(VirtualSession.class))).thenAnswer(inv -> inv.getArgument(0));

        VideoSessionDTO result = videoSessionService.endVideoSession(10L, "alice");

        assertEquals(VideoSessionStatus.ENDED, result.getStatus());
        assertNotNull(result.getEndedAt());
        // VirtualSession doit être passée à DONE
        verify(virtualSessionRepository).save(argThat(vs -> vs.getStatus() == SessionStatus.DONE));
    }

    @Test
    void endVideoSession_byNonHost_throwsUnauthorized() {
        when(videoSessionRepository.findById(10L)).thenReturn(Optional.of(existingVideoSession));

        assertThrows(VideoSessionService.UnauthorizedException.class,
                () -> videoSessionService.endVideoSession(10L, "bob"));
        verify(videoSessionRepository, never()).save(any());
    }

    @Test
    void endVideoSession_alreadyEnded_throwsBadRequest() {
        existingVideoSession.setStatus(VideoSessionStatus.ENDED);
        when(videoSessionRepository.findById(10L)).thenReturn(Optional.of(existingVideoSession));

        assertThrows(VirtualSessionService.BadRequestException.class,
                () -> videoSessionService.endVideoSession(10L, "alice"));
    }

    // ─── onParticipantLeave ───────────────────────────────────────────────────────

    @Test
    void onParticipantLeave_backToWaiting_whenZeroParticipants() {
        existingVideoSession.setCurrentParticipants(1);
        existingVideoSession.setStatus(VideoSessionStatus.ACTIVE);
        existingVideoSession.setActiveParticipantIds(new HashSet<>(Set.of("alice")));

        when(videoSessionRepository.findByRoomId("test-room-uuid")).thenReturn(Optional.of(existingVideoSession));
        when(videoSessionRepository.save(any(VideoSession.class))).thenAnswer(inv -> inv.getArgument(0));

        videoSessionService.onParticipantLeave("test-room-uuid", "alice");

        assertEquals(0, existingVideoSession.getCurrentParticipants());
        assertEquals(VideoSessionStatus.WAITING, existingVideoSession.getStatus());
    }
}
