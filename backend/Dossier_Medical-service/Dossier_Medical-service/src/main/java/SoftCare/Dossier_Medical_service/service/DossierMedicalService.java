package SoftCare.Dossier_Medical_service.service;

import SoftCare.Dossier_Medical_service.dto.AjouterAnalyseRequest;
import SoftCare.Dossier_Medical_service.dto.DossierMedicalResponse;
import SoftCare.Dossier_Medical_service.dto.UpdateDescriptionRequest;
import SoftCare.Dossier_Medical_service.entity.AnalyseIRMDossier;
import SoftCare.Dossier_Medical_service.entity.DossierMedical;
import SoftCare.Dossier_Medical_service.repository.AnalyseIRMDossierRepository;
import SoftCare.Dossier_Medical_service.repository.DossierMedicalRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class DossierMedicalService {

    private final DossierMedicalRepository dossierRepository;
    private final AnalyseIRMDossierRepository analyseRepository;

    // ══════════════════════════════════════════════════
    //   AJOUTER ANALYSE (INCHANGÉ)
    // ══════════════════════════════════════════════════
    @Transactional
    public DossierMedicalResponse ajouterAnalyse(AjouterAnalyseRequest request) {

        log.info("Traitement analyse IRM pour patient ID: {}", request.getPatientId());

        DossierMedical dossier = dossierRepository
                .findByPatientId(request.getPatientId())
                .orElseGet(() -> {
                    log.info("Aucun dossier trouvé pour patient {} → création", request.getPatientId());
                    return DossierMedical.builder()
                            .patientId(request.getPatientId())
                            .dateCreation(LocalDateTime.now())
                            .nombreAnalyses(0)
                            .build();
                });

        AnalyseIRMDossier analyse = AnalyseIRMDossier.builder()
                .dossierMedical(dossier)
                .analyseIrmId(request.getAnalyseIrmId())
                .nomFichier(request.getNomFichier())
                .prediction(request.getPrediction())
                .confidence(request.getConfidence())
                .niveauRisque(request.getNiveauRisque())
                .couleurRisque(request.getCouleurRisque())
                .descriptionRisque(request.getDescriptionRisque())
                .probMildDemented(request.getProbMildDemented())
                .probModerateDemented(request.getProbModerateDemented())
                .probNonDemented(request.getProbNonDemented())
                .probVeryMildDemented(request.getProbVeryMildDemented())
                .dateAnalyse(request.getDateAnalyse() != null ? request.getDateAnalyse() : LocalDateTime.now())
                .build();

        dossier.getAnalyses().add(analyse);
        dossier.setDernierePrediction(request.getPrediction());
        dossier.setDernierNiveauRisque(request.getNiveauRisque());
        dossier.setDerniereCouleurRisque(request.getCouleurRisque());
        dossier.setDateDerniereMaj(LocalDateTime.now());
        dossier.setNombreAnalyses(dossier.getAnalyses().size());

        DossierMedical saved = dossierRepository.save(dossier);

        log.info("Dossier {} mis à jour — {} analyse(s)", saved.getId(), saved.getNombreAnalyses());

        return mapToResponse(saved);
    }

    // ══════════════════════════════════════════════════
    //   ✅ UPDATE DESCRIPTION & CONSEIL MÉDECIN
    // ══════════════════════════════════════════════════
    @Transactional
    public DossierMedicalResponse updateDescription(UpdateDescriptionRequest request) {

        log.info("📝 Mise à jour description pour analyse ID: {}", request.getAnalyseId());

        AnalyseIRMDossier analyse = analyseRepository
                .findById(request.getAnalyseId())
                .orElseThrow(() -> new RuntimeException("Analyse non trouvée ID: " + request.getAnalyseId()));

        // Mettre à jour les champs modifiables
        if (request.getDescriptionRisque() != null) {
            analyse.setDescriptionRisque(request.getDescriptionRisque());
        }
        if (request.getConseilMedecin() != null) {
            analyse.setConseilMedecin(request.getConseilMedecin());
        }
        if (request.getNotesCliniques() != null) {
            analyse.setNotesCliniques(request.getNotesCliniques());
        }

        analyse.setDateModification(LocalDateTime.now());

        analyseRepository.save(analyse);

        // Mettre à jour la date du dossier
        DossierMedical dossier = analyse.getDossierMedical();
        dossier.setDateDerniereMaj(LocalDateTime.now());
        dossierRepository.save(dossier);

        log.info("✅ Description mise à jour pour analyse {}", request.getAnalyseId());

        return mapToResponse(dossier);
    }

    // ══════════════════════════════════════════════════
    //   ✅ SUPPRIMER UNE ANALYSE D'UN DOSSIER
    // ══════════════════════════════════════════════════
    @Transactional
    public DossierMedicalResponse supprimerAnalyse(Long analyseId) {

        log.info("🗑️ Suppression analyse ID: {}", analyseId);

        AnalyseIRMDossier analyse = analyseRepository
                .findById(analyseId)
                .orElseThrow(() -> new RuntimeException("Analyse non trouvée ID: " + analyseId));

        DossierMedical dossier = analyse.getDossierMedical();

        // Retirer l'analyse du dossier
        dossier.getAnalyses().remove(analyse);
        dossier.setNombreAnalyses(dossier.getAnalyses().size());
        dossier.setDateDerniereMaj(LocalDateTime.now());

        // Si c'était la dernière analyse, mettre à jour les infos de synthèse
        if (!dossier.getAnalyses().isEmpty()) {
            AnalyseIRMDossier derniere = dossier.getAnalyses().get(dossier.getAnalyses().size() - 1);
            dossier.setDernierePrediction(derniere.getPrediction());
            dossier.setDernierNiveauRisque(derniere.getNiveauRisque());
            dossier.setDerniereCouleurRisque(derniere.getCouleurRisque());
        } else {
            dossier.setDernierePrediction(null);
            dossier.setDernierNiveauRisque(null);
            dossier.setDerniereCouleurRisque(null);
        }

        // Supprimer l'analyse de la base
        analyseRepository.delete(analyse);

        DossierMedical saved = dossierRepository.save(dossier);

        log.info("✅ Analyse {} supprimée — reste {} analyse(s)", analyseId, saved.getNombreAnalyses());

        return mapToResponse(saved);
    }

    // ══════════════════════════════════════════════════
    //   GET DOSSIER (INCHANGÉ)
    // ══════════════════════════════════════════════════
    @Transactional(readOnly = true)
    public DossierMedicalResponse getDossierByPatientId(Long patientId) {
        DossierMedical dossier = dossierRepository
                .findByPatientId(patientId)
                .orElseThrow(() -> new RuntimeException("Aucun dossier pour patient ID: " + patientId));
        return mapToResponse(dossier);
    }

    @Transactional(readOnly = true)
    public DossierMedicalResponse getDossierById(Long id) {
        DossierMedical dossier = dossierRepository
                .findById(id)
                .orElseThrow(() -> new RuntimeException("Dossier non trouvé, ID: " + id));
        return mapToResponse(dossier);
    }

    // ══════════════════════════════════════════════════
    //   ✅ GET UNE SEULE ANALYSE
    // ══════════════════════════════════════════════════
    @Transactional(readOnly = true)
    public DossierMedicalResponse.AnalyseIRMDossierResponse getAnalyseById(Long analyseId) {
        AnalyseIRMDossier analyse = analyseRepository
                .findById(analyseId)
                .orElseThrow(() -> new RuntimeException("Analyse non trouvée ID: " + analyseId));

        return DossierMedicalResponse.AnalyseIRMDossierResponse.builder()
                .id(analyse.getId())
                .analyseIrmId(analyse.getAnalyseIrmId())
                .nomFichier(analyse.getNomFichier())
                .prediction(analyse.getPrediction())
                .confidence(analyse.getConfidence())
                .niveauRisque(analyse.getNiveauRisque())
                .couleurRisque(analyse.getCouleurRisque())
                .descriptionRisque(analyse.getDescriptionRisque())
                .conseilMedecin(analyse.getConseilMedecin())
                .notesCliniques(analyse.getNotesCliniques())
                .probMildDemented(analyse.getProbMildDemented())
                .probModerateDemented(analyse.getProbModerateDemented())
                .probNonDemented(analyse.getProbNonDemented())
                .probVeryMildDemented(analyse.getProbVeryMildDemented())
                .dateAnalyse(analyse.getDateAnalyse())
                .dateModification(analyse.getDateModification())
                .build();
    }

    // ══════════════════════════════════════════════════
    //   MAPPING
    // ══════════════════════════════════════════════════
    private DossierMedicalResponse mapToResponse(DossierMedical dossier) {
        List<DossierMedicalResponse.AnalyseIRMDossierResponse> analysesResponse = dossier.getAnalyses()
                .stream()
                .map(a -> DossierMedicalResponse.AnalyseIRMDossierResponse.builder()
                        .id(a.getId())
                        .analyseIrmId(a.getAnalyseIrmId())
                        .nomFichier(a.getNomFichier())
                        .prediction(a.getPrediction())
                        .confidence(a.getConfidence())
                        .niveauRisque(a.getNiveauRisque())
                        .couleurRisque(a.getCouleurRisque())
                        .descriptionRisque(a.getDescriptionRisque())
                        .conseilMedecin(a.getConseilMedecin())         // ✅ NOUVEAU
                        .notesCliniques(a.getNotesCliniques())         // ✅ NOUVEAU
                        .probMildDemented(a.getProbMildDemented())
                        .probModerateDemented(a.getProbModerateDemented())
                        .probNonDemented(a.getProbNonDemented())
                        .probVeryMildDemented(a.getProbVeryMildDemented())
                        .dateAnalyse(a.getDateAnalyse())
                        .dateModification(a.getDateModification())     // ✅ NOUVEAU
                        .build())
                .collect(Collectors.toList());

        return DossierMedicalResponse.builder()
                .id(dossier.getId())
                .patientId(dossier.getPatientId())
                .dateCreation(dossier.getDateCreation())
                .dateDerniereMaj(dossier.getDateDerniereMaj())
                .dernierePrediction(dossier.getDernierePrediction())
                .dernierNiveauRisque(dossier.getDernierNiveauRisque())
                .derniereCouleurRisque(dossier.getDerniereCouleurRisque())
                .nombreAnalyses(dossier.getNombreAnalyses())
                .analyses(analysesResponse)
                .build();
    }
}