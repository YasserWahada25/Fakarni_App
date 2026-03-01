package com.alzheimer.session_service.services;

import com.alzheimer.session_service.dto.UpdateParticipantPrefsRequest;
import com.alzheimer.session_service.entities.JoinStatus;
import com.alzheimer.session_service.entities.ParticipantRole;
import com.alzheimer.session_service.entities.SessionParticipant;
import com.alzheimer.session_service.entities.SessionStatus;
import com.alzheimer.session_service.entities.SessionType;
import com.alzheimer.session_service.entities.SessionVisibility;
import com.alzheimer.session_service.entities.VirtualSession;
import com.alzheimer.session_service.repositories.VirtualSessionRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class VirtualSessionServiceTest {

    @Mock
    private VirtualSessionRepository repository;

    @InjectMocks
    private VirtualSessionService service;

    @Test
    void updateParticipantPrefs_createsParticipantWhenMissing() {
        VirtualSession session = buildSession(1L);
        UpdateParticipantPrefsRequest request = UpdateParticipantPrefsRequest.builder()
                .isFavorite(true)
                .build();

        when(repository.findById(1L)).thenReturn(Optional.of(session));
        when(repository.save(any(VirtualSession.class))).thenAnswer(invocation -> invocation.getArgument(0));

        VirtualSession updated = service.updateParticipantPrefs(1L, request);

        assertNotNull(updated);
        assertEquals(1, updated.getParticipants().size());
        SessionParticipant participant = updated.getParticipants().get(0);
        assertEquals("admin", participant.getUserId());
        assertEquals(ParticipantRole.PARTICIPANT, participant.getRole());
        assertEquals(JoinStatus.INVITED, participant.getJoinStatus());
        assertTrue(participant.isFavorite());
        verify(repository).save(session);
    }

    @Test
    void setFavorite_updatesExistingParticipantFavoriteState() {
        VirtualSession session = buildSession(2L);
        session.getParticipants().add(
                SessionParticipant.builder()
                        .userId("admin")
                        .role(ParticipantRole.PARTICIPANT)
                        .joinStatus(JoinStatus.CONFIRMED)
                        .isFavorite(true)
                        .build()
        );

        when(repository.findById(2L)).thenReturn(Optional.of(session));
        when(repository.save(any(VirtualSession.class))).thenAnswer(invocation -> invocation.getArgument(0));

        VirtualSession updated = service.setFavorite(2L, false);

        assertNotNull(updated);
        assertFalse(updated.getParticipants().get(0).isFavorite());
        verify(repository).save(session);
    }

    @Test
    void listUserFavorites_returnsOnlyFavoriteSessions() {
        VirtualSession favoriteSession = buildSession(10L);
        favoriteSession.getParticipants().add(
                SessionParticipant.builder()
                        .userId("admin")
                        .role(ParticipantRole.PARTICIPANT)
                        .joinStatus(JoinStatus.CONFIRMED)
                        .isFavorite(true)
                        .build()
        );

        VirtualSession nonFavoriteSession = buildSession(11L);
        nonFavoriteSession.getParticipants().add(
                SessionParticipant.builder()
                        .userId("admin")
                        .role(ParticipantRole.PARTICIPANT)
                        .joinStatus(JoinStatus.CONFIRMED)
                        .isFavorite(false)
                        .build()
        );

        when(repository.findByParticipantUserId("admin"))
                .thenReturn(List.of(favoriteSession, nonFavoriteSession));

        List<VirtualSession> favorites = service.listUserFavorites();

        assertEquals(1, favorites.size());
        assertEquals(10L, favorites.get(0).getId());
    }

    @Test
    void list_withOnlyStatus_filtersByStatus() {
        VirtualSession pending = buildSession(20L);
        pending.setStatus(SessionStatus.DRAFT);

        when(repository.findByStatus(SessionStatus.DRAFT)).thenReturn(List.of(pending));

        List<VirtualSession> result = service.list(null, null, SessionStatus.DRAFT);

        assertEquals(1, result.size());
        assertEquals(SessionStatus.DRAFT, result.get(0).getStatus());
        verify(repository).findByStatus(SessionStatus.DRAFT);
    }

    private VirtualSession buildSession(Long id) {
        return VirtualSession.builder()
                .id(id)
                .title("Session test")
                .description("description")
                .startTime(Instant.parse("2026-02-21T09:00:00Z"))
                .endTime(Instant.parse("2026-02-21T10:00:00Z"))
                .createdBy("admin")
                .status(SessionStatus.SCHEDULED)
                .visibility(SessionVisibility.PUBLIC)
                .sessionType(SessionType.GROUP)
                .build();
    }
}
