package com.alzheimer.session_service.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.time.Instant;


@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
@Entity
@Table(name = "session_participants")
public class SessionParticipant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(name = "user_id", nullable = false)
    private String userId;

    @NonNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ParticipantRole role;

    @NonNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private JoinStatus joinStatus;

    private Instant joinedAt;

    private boolean isFavorite;

    @Min(0)
    private Integer reminderMinutesBefore;
}
