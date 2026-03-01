package com.alzheimer.Event_Service.dto;

import java.time.LocalDateTime;

public class EventResponse {
    private Long id;
    private String title;
    private LocalDateTime startDateTime;
    private String location;
    private boolean remindEnabled;
    private Long userId;
    private LocalDateTime createdAt;

    // Constructeur pour initialiser l'objet
    public EventResponse(Long id, String title, LocalDateTime startDateTime, String location, boolean remindEnabled, Long userId, LocalDateTime createdAt) {
        this.id = id;
        this.title = title;
        this.startDateTime = startDateTime;
        this.location = location;
        this.remindEnabled = remindEnabled;
        this.userId = userId;
        this.createdAt = createdAt;
    }

    // Constructeur depuis l'entité Event
    public EventResponse(com.alzheimer.Event_Service.entities.Event e) {
        this.id = e.getId();
        this.title = e.getTitle();
        this.startDateTime = e.getStartDateTime();
        this.location = e.getLocation();
        this.remindEnabled = e.isRemindEnabled();
        this.userId = e.getUserId();
        this.createdAt = e.getCreatedAt();
    }

    // Getters et Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

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

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}