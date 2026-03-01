package com.alzheimer.session_service.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Message de signalisation WebRTC échangé via STOMP/WebSocket.
 *
 * <p>Les clients envoient ce message sur {@code /app/signal/{type}} et le serveur
 * le relaye sur {@code /topic/room/{roomId}} pour tous les abonnés de la room.</p>
 *
 * <h3>Types supportés</h3>
 * <ul>
 *   <li>{@code offer}         – Offre SDP envoyée par l'initiateur de la connexion P2P.</li>
 *   <li>{@code answer}        – Réponse SDP envoyée par le destinataire de l'offre.</li>
 *   <li>{@code ice-candidate} – Candidat ICE pour la traversée NAT/firewall.</li>
 *   <li>{@code join}          – Annonce qu'un utilisateur a rejoint la room.</li>
 *   <li>{@code leave}         – Annonce qu'un utilisateur a quitté la room.</li>
 * </ul>
 *
 * <h3>Flux WebRTC simplifié</h3>
 * <pre>
 *   Alice  ──[join]──▶ /topic/room/{roomId} ──▶ Bob
 *   Alice  ──[offer]─▶ /topic/room/{roomId} ──▶ Bob
 *   Bob  ──[answer]──▶ /topic/room/{roomId} ──▶ Alice
 *   Alice ──[ice]────▶ /topic/room/{roomId} ──▶ Bob
 *   Bob   ──[ice]────▶ /topic/room/{roomId} ──▶ Alice
 * </pre>
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SignalMessageDTO {

    /**
     * Type du message de signalisation.
     * Valeurs possibles : {@code offer}, {@code answer}, {@code ice-candidate},
     * {@code join}, {@code leave}.
     */
    @NotBlank(message = "Le type du message de signalisation est obligatoire.")
    private String type;

    /** Identifiant de l'émetteur du message. */
    @NotBlank(message = "L'identifiant de l'émetteur est obligatoire.")
    private String fromUserId;

    /**
     * Identifiant du destinataire cible.
     * Peut être {@code null} pour les messages broadcast ({@code join}, {@code leave}).
     */
    private String toUserId;

    /** UUID de la room WebRTC concernée. */
    @NotBlank(message = "L'identifiant de la room est obligatoire.")
    private String roomId;

    /**
     * Charge utile du signal (JSON sérialisé en String).
     * <ul>
     *   <li>Pour {@code offer}/{@code answer} : SDP (Session Description Protocol).</li>
     *   <li>Pour {@code ice-candidate} : objet RTCIceCandidate sérialisé.</li>
     *   <li>Pour {@code join}/{@code leave} : peut être {@code null} ou contenir des métadonnées.</li>
     * </ul>
     */
    @NotNull(message = "La charge utile du signal est obligatoire.")
    private String payload;
}
