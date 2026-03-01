package com.alzheimer.Event_Service.dto;

import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;

public class EventCreateRequest {

    @NotBlank
    private String title;

    @NotBlank
    private String description;  // Assure-toi que ce champ existe dans ta classe

    private LocalDateTime startDateTime;

    private String location;

    private boolean remindEnabled;

    private Long userId;

    // Getters et Setters
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }  // Ajoute ce getter pour description
    public void setDescription(String description) { this.description = description; }

    public LocalDateTime getStartDateTime() { return startDateTime; }
    public void setStartDateTime(LocalDateTime startDateTime) { this.startDateTime = startDateTime; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public boolean isRemindEnabled() { return remindEnabled; }
    public void setRemindEnabled(boolean remindEnabled) { this.remindEnabled = remindEnabled; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
}