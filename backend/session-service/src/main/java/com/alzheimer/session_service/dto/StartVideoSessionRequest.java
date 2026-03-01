package com.alzheimer.session_service.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Requête pour démarrer une nouvelle session vidéo.
 *
 * <p>La {@link com.alzheimer.session_service.entities.VirtualSession} référencée doit être :</p>
 * <ul>
 *   <li>En statut {@code SCHEDULED}</li>
 *   <li>En mode {@code ONLINE}</li>
 *   <li>Sans {@code VideoSession} déjà active</li>
 * </ul>
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StartVideoSessionRequest {

    /** ID de la {@link com.alzheimer.session_service.entities.VirtualSession} parente. */
    @NotNull(message = "L'identifiant de la session virtuelle est obligatoire.")
    private Long virtualSessionId;

    /**
     * Identifiant de l'hôte.
     * Doit correspondre au {@code createdBy} de la VirtualSession ou à un participant HOST.
     */
    @NotBlank(message = "L'identifiant de l'hôte est obligatoire.")
    private String hostUserId;

    /**
     * Nombre maximum de participants.
     * Ignoré pour les sessions de type {@code PRIVATE} (forcé à 2).
     * Minimum 2, défaut appliqué par le service si null.
     */
    @Min(value = 2, message = "Le nombre maximum de participants doit être au moins 2.")
    private Integer maxParticipants;
}
