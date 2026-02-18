package SoftCare.Detection_Maladie_Service.controller;

import SoftCare.Detection_Maladie_Service.dto.AnalyseIRMResponse;
import SoftCare.Detection_Maladie_Service.service.DetectionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/detection")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class DetectionController {

    private final DetectionService service;

    /**
     * POST /api/detection/analyser
     * Envoie l'image IRM à Flask IA et sauvegarde le résultat en base
     */
    @PostMapping("/analyser")
    public ResponseEntity<AnalyseIRMResponse> analyser(
            @RequestParam("image") MultipartFile image) {
        try {
            return ResponseEntity.ok(service.analyserIRM(image));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * GET /api/detection/{id}
     * Récupère une analyse par son ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<AnalyseIRMResponse> getById(
            @PathVariable Long id) {
        return ResponseEntity.ok(service.getAnalyseById(id));
    }
}