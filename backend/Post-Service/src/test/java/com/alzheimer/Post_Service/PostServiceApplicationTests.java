package com.alzheimer.Post_Service;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

/**
 * Test de demarrage minimal — verifie que le contexte Spring se charge
 * avec H2 en memoire et Eureka desactive.
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.NONE)
@ActiveProfiles("test")
class PostServiceApplicationTests {

    @Test
    void contextLoads() {
        // Verifie simplement que le contexte Spring demarre sans erreur
    }
}
