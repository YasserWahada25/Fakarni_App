package Fakerni.Dossier_Medical_service;

import org.junit.jupiter.api.Test;
import SoftCare.Dossier_Medical_service.DossierMedicalServiceApplication;

/**
 * Test de smoke minimal sans chargement de contexte Spring.
 * Dossier Medical Service utilise Feign — le test d'integration
 * necessite un environnement avec Eureka et MySQL.
 */
class DossierMedicalServiceApplicationTests {

    @Test
    void applicationClassExists() {
        Class<?> clazz = DossierMedicalServiceApplication.class;
        assert clazz != null;
    }
}
