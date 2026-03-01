package com.alzheimer.session_service.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Requête pour rejoindre une session vidéo existante.
 *
 * <p>Contrôles effectués par {@code VideoSessionService.joinVideoSession()} :</p>
 * <ol>
 *   <li>La room identifiée par {@code roomId} existe et est {@code WAITING} ou {@code ACTIVE}.</li>
 *   <li>{@code userId} figure dans la liste {@code SessionParticipant} de la VirtualSession parente.</li>
 *   <li>Le {@code JoinStatus} du participant est {@code CONFIRMED} ou {@code ATTENDED}.</li>
 *   <li>{@code currentParticipants < maxParticipants}.</li>
 * </ol>
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JoinVideoSessionRequest {

    /** UUID de la room à rejoindre (retourné par {@code POST /start}). */
    @NotBlank(message = "L'identifiant de la room est obligatoire.")
    private String roomId;

    /** Identifiant de l'utilisateur qui souhaite rejoindre la session vidéo. */
    @NotBlank(message = "L'identifiant de l'utilisateur est obligatoire.")
    private String userId;
}
