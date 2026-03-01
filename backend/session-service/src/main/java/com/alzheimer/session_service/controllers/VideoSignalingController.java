package com.alzheimer.session_service.controllers;

import com.alzheimer.session_service.dto.SignalMessageDTO;
import com.alzheimer.session_service.dto.VideoChatMessageDTO;
import com.alzheimer.session_service.services.VideoSessionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

import java.util.Map;

@Controller
@RequiredArgsConstructor
@Slf4j
public class VideoSignalingController {

    private final SimpMessagingTemplate messagingTemplate;
    private final VideoSessionService videoSessionService;
    private final ObjectMapper objectMapper;

    @MessageMapping("/signal/offer")
    public void relayOffer(@Valid @Payload SignalMessageDTO message) {
        broadcastToRoom(message);
    }

    @MessageMapping("/signal/answer")
    public void relayAnswer(@Valid @Payload SignalMessageDTO message) {
        broadcastToRoom(message);
    }

    @MessageMapping("/signal/ice-candidate")
    public void relayIceCandidate(@Valid @Payload SignalMessageDTO message) {
        broadcastToRoom(message);
    }

    @MessageMapping("/signal/join")
    public void onJoin(@Valid @Payload SignalMessageDTO message) {
        broadcastToRoom(message);
    }

    @MessageMapping("/signal/leave")
    public void onLeave(@Valid @Payload SignalMessageDTO message) {
        videoSessionService.onParticipantLeave(message.getRoomId(), message.getFromUserId());
        broadcastToRoom(message);
    }

    @MessageMapping("/signal/chat")
    public void onChat(@Valid @Payload SignalMessageDTO message) {
        String text = extractChatText(message.getPayload());
        if (text == null || text.isBlank()) {
            return;
        }

        VideoChatMessageDTO saved = videoSessionService.saveChatMessage(
                message.getRoomId(),
                message.getFromUserId(),
                text
        );

        SignalMessageDTO outbound = SignalMessageDTO.builder()
                .type("chat")
                .fromUserId(saved.getFromUserId())
                .roomId(saved.getRoomId())
                .payload(buildChatPayload(saved))
                .build();

        broadcastToRoom(outbound);
    }

    private String extractChatText(String payload) {
        if (payload == null || payload.trim().isEmpty()) {
            return null;
        }

        String trimmed = payload.trim();
        try {
            JsonNode node = objectMapper.readTree(trimmed);
            if (node.isObject() && node.hasNonNull("text")) {
                return node.get("text").asText().trim();
            }
            if (node.isTextual()) {
                return node.asText().trim();
            }
        } catch (Exception ignored) {
            // payload can be plain text; fallback below
        }
        return trimmed;
    }

    private String buildChatPayload(VideoChatMessageDTO message) {
        try {
            return objectMapper.writeValueAsString(Map.of(
                    "id", message.getId(),
                    "text", message.getText(),
                    "sentAt", message.getSentAt().toString()
            ));
        } catch (Exception e) {
            log.warn("Cannot serialize chat payload for room {}", message.getRoomId(), e);
            return "{\"text\":\"" + message.getText().replace("\"", "'") + "\"}";
        }
    }

    private void broadcastToRoom(SignalMessageDTO message) {
        messagingTemplate.convertAndSend("/topic/room/" + message.getRoomId(), message);
    }
}
