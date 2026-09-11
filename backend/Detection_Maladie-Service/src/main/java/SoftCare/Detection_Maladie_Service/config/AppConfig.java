package SoftCare.Detection_Maladie_Service.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

@Configuration
public class AppConfig {

    @Value("${ia.flask.url:http://localhost:5000}")
    private String flaskUrl;

    /**
     * RestClient dédié à l'appel du service Flask Python (IA - prédiction IRM).
     * L'URL est configurée via la propriété ia.flask.url.
     * La communication avec Dossier_Medical-service se fait via Feign (voir DossierMedicalFeignClient).
     */
    @Bean("flaskRestClient")
    public RestClient flaskRestClient() {
        return RestClient.builder().baseUrl(flaskUrl).build();
    }
}
