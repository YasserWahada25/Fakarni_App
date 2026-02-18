package SoftCare.Detection_Maladie_Service.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

@Configuration
public class AppConfig {

    @Value("${ia.flask.url:http://localhost:5000}")
    private String flaskUrl;

    @Value("${dossier.medical.url:http://localhost:8059}")  // ← AJOUTÉ
    private String dossierMedicalUrl;

    @Bean("flaskRestClient")
    public RestClient flaskRestClient() {
        return RestClient.builder().baseUrl(flaskUrl).build();
    }

    @Bean("dossierMedicalRestClient")
    public RestClient dossierMedicalRestClient() {
        return RestClient.builder().baseUrl(dossierMedicalUrl).build();
    }
}