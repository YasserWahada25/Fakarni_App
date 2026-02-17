package com.alzheimer.session_service.dto;

import com.alzheimer.session_service.entities.JoinStatus;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class UpdateParticipantStatusRequest {
    @NotNull
    private JoinStatus joinStatus;

    private boolean setJoinedNow; // si true => joinedAt=now

    public @NotNull JoinStatus getJoinStatus() {
        return joinStatus;
    }

    public void setJoinStatus(@NotNull JoinStatus joinStatus) {
        this.joinStatus = joinStatus;
    }

    public boolean isSetJoinedNow() {
        return setJoinedNow;
    }

    public void setSetJoinedNow(boolean setJoinedNow) {
        this.setJoinedNow = setJoinedNow;
    }
}
