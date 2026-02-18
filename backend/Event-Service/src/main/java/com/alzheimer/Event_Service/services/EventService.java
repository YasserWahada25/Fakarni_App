package com.alzheimer.Event_Service.services;


import com.alzheimer.Event_Service.dto.EventCreateRequest;
import com.alzheimer.Event_Service.dto.EventResponse;
import com.alzheimer.Event_Service.dto.EventUpdateRequest;
import com.alzheimer.Event_Service.entities.Event;
import com.alzheimer.Event_Service.repositories.EventRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EventService {

    private final EventRepository eventRepository;

    public EventService(EventRepository eventRepository) {
        this.eventRepository = eventRepository;
    }

    public EventResponse create(EventCreateRequest request) {
        Event event = new Event();
        event.setTitle(request.getTitle());
        event.setStartDateTime(request.getStartDateTime());
        event.setLocation(request.getLocation());
        event.setRemindEnabled(request.isRemindEnabled());
        event.setUserId(request.getUserId());

        return toResponse(eventRepository.save(event));
    }

    public EventResponse update(Long id, EventUpdateRequest request) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found: " + id));

        event.setTitle(request.getTitle());
        event.setStartDateTime(request.getStartDateTime());
        event.setLocation(request.getLocation());
        event.setRemindEnabled(request.isRemindEnabled());
        event.setUserId(request.getUserId());

        return toResponse(eventRepository.save(event));
    }

    public EventResponse getById(Long id) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found: " + id));
        return toResponse(event);
    }

    public List<EventResponse> getAll() {
        return eventRepository.findAll().stream().map(this::toResponse).toList();
    }

    public List<EventResponse> getByUserId(Long userId) {
        return eventRepository.findByUserId(userId).stream().map(this::toResponse).toList();
    }

    public void delete(Long id) {
        if (!eventRepository.existsById(id)) {
            throw new RuntimeException("Event not found: " + id);
        }
        eventRepository.deleteById(id);
    }

    private EventResponse toResponse(Event event) {
        EventResponse r = new EventResponse();
        r.setId(event.getId());
        r.setTitle(event.getTitle());
        r.setStartDateTime(event.getStartDateTime());
        r.setLocation(event.getLocation());
        r.setRemindEnabled(event.isRemindEnabled());
        r.setUserId(event.getUserId());
        r.setCreatedAt(event.getCreatedAt());
        return r;
    }
}
