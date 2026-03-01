package com.alzheimer.session_service.entities;

/**
 * Statut du cycle de vie d'une {@link VideoSession}.
 *
 * <p>Correspond et se synchronise avec {@link SessionStatus} de la {@link VirtualSession} parente :</p>
 *
 * <table border="1" summary="correspondance des statuts">
 *   <tr><th>VideoSessionStatus</th><th>SessionStatus (VirtualSession)</th><th>Description</th></tr>
 *   <tr><td>WAITING</td><td>SCHEDULED</td><td>Room créée, en attente du 1er participant</td></tr>
 *   <tr><td>ACTIVE</td><td>SCHEDULED</td><td>Conférence en cours (≥ 1 participant connecté)</td></tr>
 *   <tr><td>ENDED</td><td>DONE</td><td>Session terminée — VirtualSession passée en DONE</td></tr>
 * </table>
 *
 * <p><b>Note :</b> si la {@link VirtualSession} parente passe à {@code CANCELLED},
 * toute {@code VideoSession} associée doit également passer à {@code ENDED}.</p>
 */
public enum VideoSessionStatus {

    /**
     * La room vidéo a été créée ({@code POST /session/sessions/video/start}).
     * Aucun participant n'a encore rejoint.
     * La {@link VirtualSession} parente est en {@code SessionStatus.SCHEDULED}.
     */
    WAITING,

    /**
     * Au moins un participant a rejoint la room ({@code POST /session/sessions/video/join}).
     * La conférence WebRTC est en cours.
     * La {@link VirtualSession} parente reste en {@code SessionStatus.SCHEDULED}.
     */
    ACTIVE,

    /**
     * La session vidéo est terminée ({@code POST /session/sessions/video/{id}/end}).
     * Peut être déclenchée par l'hôte (rôle {@code ParticipantRole.HOST}) ou automatiquement
     * quand tous les participants quittent la room.
     * La {@link VirtualSession} parente passe automatiquement à {@code SessionStatus.DONE}.
     */
    ENDED
}
