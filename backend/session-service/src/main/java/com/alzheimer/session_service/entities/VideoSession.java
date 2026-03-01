package com.alzheimer.session_service.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.Instant;
import java.util.HashSet;
import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(
        name = "video_sessions",
        indexes = {
                @Index(name = "idx_video_room_id", columnList = "room_id", unique = true),
                @Index(name = "idx_video_virtual_session_id", columnList = "virtual_session_id", unique = true)
        }
)
public class VideoSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(name = "room_id", nullable = false, unique = true, length = 36)
    private String roomId;

    @NotNull
    @Column(name = "virtual_session_id", nullable = false, unique = true)
    private Long virtualSessionId;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "session_type", nullable = false)
    private SessionType sessionType;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "session_visibility", nullable = false)
    private SessionVisibility sessionVisibility;

    @NotBlank
    @Column(name = "host_user_id", nullable = false)
    private String hostUserId;

    @Min(2)
    @Column(name = "max_participants", nullable = false)
    private int maxParticipants;

    @Builder.Default
    @Column(name = "current_participants", nullable = false)
    private int currentParticipants = 0;

    /**
     * Participants effectivement connectés à la room (idempotence join/leave par userId).
     */
    @Builder.Default
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(
            name = "video_session_active_participants",
            joinColumns = @JoinColumn(name = "video_session_id")
    )
    @Column(name = "user_id", nullable = false)
    private Set<String> activeParticipantIds = new HashSet<>();

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private VideoSessionStatus status;

    @Column(name = "started_at", updatable = false)
    private Instant startedAt;

    @Column(name = "ended_at")
    private Instant endedAt;

    @PrePersist
    protected void onCreate() {
        if (this.status == null) {
            this.status = VideoSessionStatus.WAITING;
        }
        this.startedAt = Instant.now();
    }
}
