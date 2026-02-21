package com.alzheimer.Event_Service.controllers;


import com.alzheimer.Event_Service.dto.EventCreateRequest;
import com.alzheimer.Event_Service.dto.EventResponse;
import com.alzheimer.Event_Service.dto.EventUpdateRequest;
import com.alzheimer.Event_Service.services.EventService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/events")
public class EventController {

    private final EventService eventService;

    public EventController(EventService eventService) {
        this.eventService = eventService;
    }

    @PostMapping
    public EventResponse create(@Valid @RequestBody EventCreateRequest request) {
        return eventService.create(request);
    }

    @PutMapping("/{id}")
    public EventResponse update(@PathVariable Long id, @Valid @RequestBody EventUpdateRequest request) {
        return eventService.update(id, request);
    }

    @GetMapping("/{id}")
    public EventResponse getById(@PathVariable Long id) {
        return eventService.getById(id);
    }

    @GetMapping
    public List<EventResponse> getAll() {
        return eventService.getAll();
    }

    @GetMapping("/user/{userId}")
    public List<EventResponse> getByUserId(@PathVariable Long userId) {
        return eventService.getByUserId(userId);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        eventService.delete(id);
    }
}
