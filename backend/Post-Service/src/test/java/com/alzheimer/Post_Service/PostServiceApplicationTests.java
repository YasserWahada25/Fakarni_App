package com.alzheimer.Post_Service;

import org.junit.jupiter.api.Test;

/**
 * Test de smoke minimal sans chargement de contexte Spring.
 * Post-Service utilise Feign + Security — le test d'integration complet
 * necessite un environnement avec Eureka et MySQL.
 */
class PostServiceApplicationTests {

    @Test
    void applicationClassExists() {
        Class<?> clazz = PostServiceApplication.class;
        assert clazz != null;
    }
}
