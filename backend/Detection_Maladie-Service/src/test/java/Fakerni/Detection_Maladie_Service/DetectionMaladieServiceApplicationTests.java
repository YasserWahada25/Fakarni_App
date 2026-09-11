package Fakerni.Detection_Maladie_Service;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import SoftCare.Detection_Maladie_Service.DetectionMaladieServiceApplication;

/**
 * Test de demarrage minimal — verifie que le contexte Spring se charge
 * en utilisant la config de test (H2 + Eureka desactive).
 */
@SpringBootTest(
    classes = DetectionMaladieServiceApplication.class,
    webEnvironment = SpringBootTest.WebEnvironment.NONE
)
@ActiveProfiles("test")
class DetectionMaladieServiceApplicationTests {

    @Test
    void contextLoads() {
        // Verifie simplement que le contexte Spring demarre sans erreur
    }
}
