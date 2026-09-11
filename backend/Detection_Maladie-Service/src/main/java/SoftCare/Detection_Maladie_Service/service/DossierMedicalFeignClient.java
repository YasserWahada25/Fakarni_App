package SoftCare.Detection_Maladie_Service.service;

import SoftCare.Detection_Maladie_Service.dto.AjouterAnalyseRequest;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

/**
 * Client Feign pour communiquer avec le Dossier_Medical-service via Eureka.
 * Le nom correspond exactement à spring.application.name du service cible.
 * Spring Cloud LoadBalancer résout automatiquement l'adresse via Eureka.
 */
@FeignClient(name = "Dossier_Medical-service")
public interface DossierMedicalFeignClient {

    @PostMapping("/api/dossiers/ajouter-analyse")
    void ajouterAnalyse(@RequestBody AjouterAnalyseRequest request);
}
