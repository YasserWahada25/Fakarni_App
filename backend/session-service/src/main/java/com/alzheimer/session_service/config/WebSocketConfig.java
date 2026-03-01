package com.alzheimer.session_service.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

/**
 * Configuration WebSocket STOMP pour la signalisation WebRTC.
 *
 * <h3>Architecture de la signalisation</h3>
 * <pre>
 *   Client (Angular/JS)
 *       │
 *       │  ws://host:8085/ws  (ou SockJS fallback)
 *       ▼
 *   WebSocket Endpoint (/ws)
 *       │
 *       │  STOMP frame
 *       ▼
 *   Message Broker (in-memory)
 *       ├── /app/signal/offer        → VideoSignalingController.relayOffer()
 *       ├── /app/signal/answer       → VideoSignalingController.relayAnswer()
 *       ├── /app/signal/ice-candidate→ VideoSignalingController.relayIceCandidate()
 *       ├── /app/signal/join         → VideoSignalingController.onJoin()
 *       └── /app/signal/leave        → VideoSignalingController.onLeave()
 *
 *   Retour vers les clients via :
 *       /topic/room/{roomId}         → broadcast à tous les abonnés de la room
 *       /queue/errors                → erreurs privées par session
 * </pre>
 *
 * <h3>Utilisation côté client (JavaScript)</h3>
 * <pre>
 *   const client = new StompJs.Client({ brokerURL: 'ws://localhost:8085/ws' });
 *   client.onConnect = () => {
 *     client.subscribe('/topic/room/' + roomId, (frame) => {
 *       const msg = JSON.parse(frame.body); // SignalMessageDTO
 *       // traiter offer / answer / ice-candidate / join / leave
 *     });
 *     client.publish({
 *       destination: '/app/signal/join',
 *       body: JSON.stringify({ type: 'join', fromUserId: 'alice', roomId: roomId, payload: '{}' })
 *     });
 *   };
 *   client.activate();
 * </pre>
 */
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    /**
     * Configure le broker de messages en mémoire.
     *
     * <ul>
     *   <li>{@code /topic} : canal de broadcast (tous les abonnés d'une room reçoivent le message).</li>
     *   <li>{@code /queue} : canal point-à-point (erreurs privées par connexion).</li>
     *   <li>{@code /app}   : préfixe de routage vers les {@code @MessageMapping}.</li>
     * </ul>
     */
    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        registry.enableSimpleBroker("/topic", "/queue");
        registry.setApplicationDestinationPrefixes("/app");
    }

    /**
     * Enregistre le endpoint WebSocket exposé aux clients.
     *
     * <ul>
     *   <li>Endpoint : {@code /ws}</li>
     *   <li>SockJS : activé pour les navigateurs qui ne supportent pas les WebSockets natifs.</li>
     *   <li>Origines autorisées : {@code *} (adapter selon la politique CORS du projet).</li>
     * </ul>
     */
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*")
                .withSockJS();
    }
}
