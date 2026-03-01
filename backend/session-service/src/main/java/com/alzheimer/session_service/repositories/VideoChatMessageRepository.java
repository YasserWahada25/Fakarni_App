package com.alzheimer.session_service.repositories;

import com.alzheimer.session_service.entities.VideoChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface VideoChatMessageRepository extends JpaRepository<VideoChatMessage, Long> {
    List<VideoChatMessage> findByRoomIdOrderBySentAtAsc(String roomId);
}
