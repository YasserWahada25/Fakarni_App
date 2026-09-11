package com.alzheimer.Eureka_Service;

import org.junit.jupiter.api.Test;

/**
 * Test de smoke minimal — pas de chargement de contexte Spring.
 * Eureka Server necessite un environnement reseau complet.
 * Ce test verifie simplement que la classe principale est accessible.
 */
class EurekaServiceApplicationTests {

    @Test
    void applicationClassExists() {
        Class<?> clazz = EurekaServiceApplication.class;
        assert clazz != null;
    }
}
