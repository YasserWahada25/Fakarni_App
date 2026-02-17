package com.alzheimer.session_service.dto;

import com.alzheimer.session_service.entities.JoinStatus;
import com.alzheimer.session_service.entities.ParticipantRole;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class AddParticipantRequest {
    @NotBlank
    private String userId;

    @NotNull
    private ParticipantRole role;

    @NotNull
    private JoinStatus joinStatus;

    public @NotBlank String getUserId() {
        return userId;
    }

    public void setUserId(@NotBlank String userId) {
        this.userId = userId;
    }

    public @NotNull ParticipantRole getRole() {
        return role;
    }

    public void setRole(@NotNull ParticipantRole role) {
        this.role = role;
    }

    public @NotNull JoinStatus getJoinStatus() {
        return joinStatus;
    }

    public void setJoinStatus(@NotNull JoinStatus joinStatus) {
        this.joinStatus = joinStatus;
    }
}
