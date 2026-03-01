package com.alzheimer.session_service.controllers;

import com.alzheimer.session_service.dto.AddRoomParticipantRequest;
import com.alzheimer.session_service.dto.JoinVideoSessionRequest;
import com.alzheimer.session_service.dto.SignalMessageDTO;
import com.alzheimer.session_service.dto.StartVideoSessionRequest;
import com.alzheimer.session_service.dto.VideoChatMessageDTO;
import com.alzheimer.session_service.dto.VideoSessionDTO;
import com.alzheimer.session_service.entities.JoinStatus;
import com.alzheimer.session_service.entities.ParticipantRole;
import com.alzheimer.session_service.entities.SessionParticipant;
import com.alzheimer.session_service.services.VideoSessionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import tools.jackson.databind.ObjectMapper;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/session/sessions/video")
@RequiredArgsConstructor
public class VideoSessionController {

    private final VideoSessionService videoSessionService;
    private final SimpMessagingTemplate messagingTemplate;
    private final ObjectMapper objectMapper;

    @PostMapping("/start")
    @ResponseStatus(HttpStatus.CREATED)
    public VideoSessionDTO startVideoSession(@Valid @RequestBody StartVideoSessionRequest req) {
        return videoSessionService.startVideoSession(req);
    }

    @PostMapping("/join")
    public VideoSessionDTO joinVideoSession(@Valid @RequestBody JoinVideoSessionRequest req) {
        return videoSessionService.joinVideoSession(req);
    }

    @GetMapping("/{id}")
    public VideoSessionDTO getVideoSession(@PathVariable Long id) {
        return videoSessionService.getVideoSession(id);
    }

    @PostMapping("/{id}/end")
    public VideoSessionDTO endVideoSession(@PathVariable Long id, @RequestParam String userId) {
        return videoSessionService.endVideoSession(id, userId);
    }

    @GetMapping("/by-virtual-session/{virtualSessionId}")
    public VideoSessionDTO getByVirtualSession(@PathVariable Long virtualSessionId) {
        return videoSessionService.getVideoSessionByVirtualSessionId(virtualSessionId);
    }

    @GetMapping("/rooms/{roomId}/messages")
    public List<VideoChatMessageDTO> getRoomMessages(
            @PathVariable String roomId,
            @RequestParam String userId
    ) {
        return videoSessionService.listRoomMessages(roomId, userId);
    }

    @PostMapping("/rooms/{roomId}/participants")
    public List<SessionParticipant> addParticipantToRoom(
            @PathVariable String roomId,
            @Valid @RequestBody AddRoomParticipantRequest req
    ) {
        List<SessionParticipant> participants = videoSessionService.addParticipantToRoom(roomId, req);
        broadcastParticipantAdded(roomId, req);
        return participants;
    }

    private void broadcastParticipantAdded(String roomId, AddRoomParticipantRequest req) {
        ParticipantRole role = req.getRole() != null ? req.getRole() : ParticipantRole.PARTICIPANT;
        JoinStatus joinStatus = req.getJoinStatus() != null ? req.getJoinStatus() : JoinStatus.CONFIRMED;

        String payload;
        try {
            payload = objectMapper.writeValueAsString(Map.of(
                    "userId", req.getUserId(),
                    "role", role.name(),
                    "joinStatus", joinStatus.name()
            ));
        } catch (Exception ignored) {
            payload = "{\"userId\":\"" + req.getUserId() + "\"}";
        }

        SignalMessageDTO event = SignalMessageDTO.builder()
                .type("participant-added")
                .fromUserId(req.getRequesterUserId())
                .roomId(roomId)
                .payload(payload)
                .build();

        messagingTemplate.convertAndSend("/topic/room/" + roomId, event);
    }
}
