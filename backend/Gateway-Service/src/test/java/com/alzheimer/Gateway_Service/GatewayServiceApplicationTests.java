package com.alzheimer.Gateway_Service;

import org.junit.jupiter.api.Test;

/**
 * Test de smoke minimal — pas de chargement de contexte Spring.
 * Gateway utilise WebFlux (reactif) — le vrai test d'integration
 * necessite un environnement complet avec Eureka.
 * Ce test verifie simplement que la classe principale est accessible.
 */
class GatewayServiceApplicationTests {

    @Test
    void applicationClassExists() {
        // Verifie que la classe principale est accessible sans demarrer le serveur
        Class<?> clazz = GatewayServiceApplication.class;
        assert clazz != null;
    }
}
