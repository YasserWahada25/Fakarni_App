package SoftCare.Detection_Maladie_Service.service;

import SoftCare.Detection_Maladie_Service.dto.AnalyseIRMResponse;
import SoftCare.Detection_Maladie_Service.dto.AjouterAnalyseRequest;  // ← NOUVEAU
import SoftCare.Detection_Maladie_Service.dto.PredictionResponse;
import SoftCare.Detection_Maladie_Service.entity.AnalyseIRM;
import SoftCare.Detection_Maladie_Service.repository.AnalyseIRMRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;

@Service
@Slf4j
public class DetectionService {  // ← SUPPRIMÉ @RequiredArgsConstructor

    private final AnalyseIRMRepository repository;
    private final RestClient flaskRestClient;
    private final DossierMedicalClient dossierMedicalClient;  // ← NOUVEAU

    // ← NOUVEAU constructeur (remplace @RequiredArgsConstructor)
    public DetectionService(AnalyseIRMRepository repository,
                            @Qualifier("flaskRestClient") RestClient flaskRestClient,
                            DossierMedicalClient dossierMedicalClient) {
        this.repository = repository;
        this.flaskRestClient = flaskRestClient;
        this.dossierMedicalClient = dossierMedicalClient;
    }

    public AnalyseIRMResponse analyserIRM(MultipartFile image) throws Exception {

        log.info("📤 Envoi image '{}' vers Flask IA...", image.getOriginalFilename());

        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("image", new ByteArrayResource(image.getBytes()) {
            @Override
            public String getFilename() {
                return image.getOriginalFilename();
            }
        });

        PredictionResponse prediction = flaskRestClient.post()
                .uri("/api/v1/predict")
                .contentType(MediaType.MULTIPART_FORM_DATA)
                .body(body)
                .retrieve()
                .body(PredictionResponse.class);

        if (prediction == null) {
            throw new RuntimeException("Réponse vide de l'API Flask IA");
        }

        log.info("✅ IA → {} | Confiance : {}%",
                prediction.getPrediction(), prediction.getConfidence());

        AnalyseIRM analyse = AnalyseIRM.builder()
                .nomFichier(image.getOriginalFilename())
                .prediction(prediction.getPrediction())
                .confidence(prediction.getConfidence())
                .niveauRisque(prediction.getRisk().getLabel())
                .couleurRisque(prediction.getRisk().getColor())
                .descriptionRisque(prediction.getRisk().getDescription())
                .probMildDemented(prediction.getProbabilities().get("Mild_Demented"))
                .probModerateDemented(prediction.getProbabilities().get("Moderate_Demented"))
                .probNonDemented(prediction.getProbabilities().get("Non_Demented"))
                .probVeryMildDemented(prediction.getProbabilities().get("Very_Mild_Demented"))
                .dateAnalyse(LocalDateTime.now())
                .patientId(1L)
                .build();

        AnalyseIRM saved = repository.save(analyse);
        log.info("💾 Sauvegardé en base → ID = {}", saved.getId());

        // ── 4. ✅ NOUVEAU — Notifier Dossier_Medical-Service ──
        AjouterAnalyseRequest dossierRequest = AjouterAnalyseRequest.builder()
                .analyseIrmId(saved.getId())
                .patientId(saved.getPatientId())
                .nomFichier(saved.getNomFichier())
                .prediction(saved.getPrediction())
                .confidence(saved.getConfidence())
                .niveauRisque(saved.getNiveauRisque())
                .couleurRisque(saved.getCouleurRisque())
                .descriptionRisque(saved.getDescriptionRisque())
                .probMildDemented(saved.getProbMildDemented())
                .probModerateDemented(saved.getProbModerateDemented())
                .probNonDemented(saved.getProbNonDemented())
                .probVeryMildDemented(saved.getProbVeryMildDemented())
                .dateAnalyse(saved.getDateAnalyse())
                .build();

        dossierMedicalClient.envoyerAnalyseAuDossier(dossierRequest);  // ← NOUVEAU

        return mapToResponse(saved);
    }

    public AnalyseIRMResponse getAnalyseById(Long id) {
        return repository.findById(id)
                .map(this::mapToResponse)
                .orElseThrow(() -> new RuntimeException("Analyse non trouvée : " + id));
    }

    private AnalyseIRMResponse mapToResponse(AnalyseIRM a) {
        AnalyseIRMResponse r = new AnalyseIRMResponse();
        r.setId(a.getId());
        r.setNomFichier(a.getNomFichier());
        r.setPrediction(a.getPrediction());
        r.setConfidence(a.getConfidence());
        r.setNiveauRisque(a.getNiveauRisque());
        r.setCouleurRisque(a.getCouleurRisque());
        r.setDescriptionRisque(a.getDescriptionRisque());
        r.setProbMildDemented(a.getProbMildDemented());
        r.setProbModerateDemented(a.getProbModerateDemented());
        r.setProbNonDemented(a.getProbNonDemented());
        r.setProbVeryMildDemented(a.getProbVeryMildDemented());
        r.setDateAnalyse(a.getDateAnalyse());
        r.setPatientId(a.getPatientId());
        return r;
    }
}