package tn.SoftCare.Tracking.Controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import tn.SoftCare.Tracking.Entity.Position;
import tn.SoftCare.Tracking.Service.TrackingService;

import java.util.List;

@RestController
@RequestMapping("/api/tracking")

public class TrackingController {

    @Autowired
    private TrackingService service;

    /** Ajouter une position (Postman / simulateur) */
    @PostMapping("/add")
    public Position ajouterPosition(@RequestBody Position position) {
        return service.saveAndProcess(position);
    }

    /** Dernière position de TOUS les patients (un par patientId) */
    @GetMapping("/last")
    public List<Position> getAllLastPositions() {
        return service.getAllLastPositions();
    }

    /** Dernière position d'UN patient */
    @GetMapping("/last/{patientId}")
    public Position getLastPosition(@PathVariable String patientId) {
        return service.getLastPosition(patientId);
    }
}