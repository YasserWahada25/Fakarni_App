package Fakerni.Dossier_Medical_service;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import SoftCare.Dossier_Medical_service.DossierMedicalServiceApplication;

@SpringBootTest(
    classes = DossierMedicalServiceApplication.class,
    webEnvironment = SpringBootTest.WebEnvironment.NONE
)
@ActiveProfiles("test")
class DossierMedicalServiceApplicationTests {
    @Test
    void contextLoads() {
    }
}
