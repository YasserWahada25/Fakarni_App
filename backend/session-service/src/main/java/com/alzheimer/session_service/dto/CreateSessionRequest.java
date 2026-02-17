package com.alzheimer.session_service.dto;

import com.alzheimer.session_service.entities.SessionStatus;
import com.alzheimer.session_service.entities.SessionVisibility;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.Instant;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class CreateSessionRequest {
    @NotBlank
    private String title;

    private String description;

    @NotNull
    private Instant startTime;

    @NotNull
    private Instant endTime;

    private String meetingUrl;

    @NotBlank
    private String createdBy;

    @NotNull
    private SessionStatus status;

    @NotNull
    private SessionVisibility visibility;

    public @NotBlank String getTitle() {
        return title;
    }

    public void setTitle(@NotBlank String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public @NotNull Instant getStartTime() {
        return startTime;
    }

    public void setStartTime(@NotNull Instant startTime) {
        this.startTime = startTime;
    }

    public @NotNull Instant getEndTime() {
        return endTime;
    }

    public void setEndTime(@NotNull Instant endTime) {
        this.endTime = endTime;
    }

    public String getMeetingUrl() {
        return meetingUrl;
    }

    public void setMeetingUrl(String meetingUrl) {
        this.meetingUrl = meetingUrl;
    }

    public @NotNull SessionVisibility getVisibility() {
        return visibility;
    }

    public void setVisibility(@NotNull SessionVisibility visibility) {
        this.visibility = visibility;
    }

    public @NotBlank String getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(@NotBlank String createdBy) {
        this.createdBy = createdBy;
    }

    public @NotNull SessionStatus getStatus() {
        return status;
    }

    public void setStatus(@NotNull SessionStatus status) {
        this.status = status;
    }
}
