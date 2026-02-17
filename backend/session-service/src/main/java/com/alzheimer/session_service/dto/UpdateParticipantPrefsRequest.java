package com.alzheimer.session_service.dto;

import jakarta.validation.constraints.Min;
import lombok.*;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class UpdateParticipantPrefsRequest {
    private Boolean isFavorite;

    @Min(0)
    private Integer reminderMinutesBefore; // nullable

    public Boolean getFavorite() {
        return isFavorite;
    }

    public void setFavorite(Boolean favorite) {
        isFavorite = favorite;
    }

    public @Min(0) Integer getReminderMinutesBefore() {
        return reminderMinutesBefore;
    }

    public void setReminderMinutesBefore(@Min(0) Integer reminderMinutesBefore) {
        this.reminderMinutesBefore = reminderMinutesBefore;
    }
}
