package com.alzheimer.session_service.dto;

import com.alzheimer.session_service.entities.MeetingMode;
import com.alzheimer.session_service.entities.SessionStatus;
import com.alzheimer.session_service.entities.SessionType;
import com.alzheimer.session_service.entities.SessionVisibility;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
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

    private String createdBy;

    private SessionStatus status;

    private SessionVisibility visibility;

    private SessionType sessionType;

    private MeetingMode meetingMode;
}
