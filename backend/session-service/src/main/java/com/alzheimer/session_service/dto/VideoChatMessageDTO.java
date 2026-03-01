package com.alzheimer.session_service.dto;

import com.alzheimer.session_service.entities.VideoChatMessage;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VideoChatMessageDTO {
    private Long id;
    private String roomId;
    private String fromUserId;
    private String text;
    private Instant sentAt;

    public static VideoChatMessageDTO from(VideoChatMessage message) {
        return VideoChatMessageDTO.builder()
                .id(message.getId())
                .roomId(message.getRoomId())
                .fromUserId(message.getFromUserId())
                .text(message.getText())
                .sentAt(message.getSentAt())
                .build();
    }
}
