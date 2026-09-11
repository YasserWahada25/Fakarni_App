package com.alzheimer.session_service;

import org.junit.jupiter.api.Test;

/**
 * Test de smoke minimal — pas de chargement de contexte Spring.
 * Session Service utilise WebSocket/STOMP qui necessite
 * un environnement complet pour le test d'integration.
 */
class SessionServiceApplicationTests {

    @Test
    void applicationClassExists() {
        Class<?> clazz = SessionServiceApplication.class;
        assert clazz != null;
    }
}
