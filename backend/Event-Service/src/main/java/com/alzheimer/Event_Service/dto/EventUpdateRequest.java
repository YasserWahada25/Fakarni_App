package com.alzheimer.Event_Service.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

public class EventUpdateRequest {

    @NotBlank
    private String title;

    @NotNull
    private LocalDateTime startDateTime;

    private String location;

    private boolean remindEnabled;

    @NotNull
    private Long userId;

    // Constructeur pour initialiser l'objet
    public EventUpdateRequest(String title, LocalDateTime startDateTime, String location, boolean remindEnabled, Long userId) {
        this.title = title;
        this.startDateTime = startDateTime;
        this.location = location;
        this.remindEnabled = remindEnabled;
        this.userId = userId;
    }

    // Getters et Setters
    public String getTitle() {
        return title;
    }
    public void setTitle(String title) {
        this.title = title;
    }

    public LocalDateTime getStartDateTime() {
        return startDateTime;
    }

    public void setStartDateTime(LocalDateTime startDateTime) {
        this.startDateTime = startDateTime;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public boolean isRemindEnabled() {
        return remindEnabled;
    }

    public void setRemindEnabled(boolean remindEnabled) {
        this.remindEnabled = remindEnabled;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }
}