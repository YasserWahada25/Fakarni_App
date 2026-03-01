package com.alzheimer.session_service.dto;

import com.alzheimer.session_service.entities.JoinStatus;
import com.alzheimer.session_service.entities.ParticipantRole;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AddRoomParticipantRequest {

    @NotBlank(message = "L'identifiant de l'utilisateur demandeur est obligatoire.")
    private String requesterUserId;

    @NotBlank(message = "L'identifiant du participant a ajouter est obligatoire.")
    private String userId;

    @Builder.Default
    private ParticipantRole role = ParticipantRole.PARTICIPANT;

    @Builder.Default
    private JoinStatus joinStatus = JoinStatus.CONFIRMED;
}
