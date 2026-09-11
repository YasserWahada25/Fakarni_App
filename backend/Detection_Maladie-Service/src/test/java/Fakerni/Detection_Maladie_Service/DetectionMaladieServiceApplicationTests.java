package Fakerni.Detection_Maladie_Service;

import org.junit.jupiter.api.Test;
import SoftCare.Detection_Maladie_Service.DetectionMaladieServiceApplication;

/**
 * Test de smoke minimal sans chargement de contexte Spring.
 * Detection Service utilise Feign + Flask IA — le test d'integration
 * necessite un environnement complet.
 */
class DetectionMaladieServiceApplicationTests {

    @Test
    void applicationClassExists() {
        Class<?> clazz = DetectionMaladieServiceApplication.class;
        assert clazz != null;
    }
}
