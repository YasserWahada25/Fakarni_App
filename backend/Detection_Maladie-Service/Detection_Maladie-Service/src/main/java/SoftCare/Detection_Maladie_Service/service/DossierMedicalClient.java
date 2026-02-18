package SoftCare.Detection_Maladie_Service.service;

import SoftCare.Detection_Maladie_Service.dto.AjouterAnalyseRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

@Service
@Slf4j
public class DossierMedicalClient {

    private final RestClient dossierMedicalRestClient;

    public DossierMedicalClient(
            @Qualifier("dossierMedicalRestClient") RestClient dossierMedicalRestClient) {
        this.dossierMedicalRestClient = dossierMedicalRestClient;
    }

    public void envoyerAnalyseAuDossier(AjouterAnalyseRequest request) {
        try {
            log.info("📨 Envoi au Dossier_Medical-Service pour patient {}",
                    request.getPatientId());

            dossierMedicalRestClient.post()
                    .uri("/api/dossiers/ajouter-analyse")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(request)
                    .retrieve()
                    .toBodilessEntity();

            log.info("✅ Dossier médical mis à jour !");

        } catch (Exception e) {
            log.error("❌ Erreur dossier médical: {}", e.getMessage());
        }
    }
}