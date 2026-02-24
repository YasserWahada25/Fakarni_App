package tn.SoftCare.Geofencing.Controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import tn.SoftCare.Geofencing.Entity.Alert;
import tn.SoftCare.Geofencing.Service.AlertService;
import java.util.List;

@RestController
@RequestMapping("/api/geofencing/alerts") // Reste sous le "parapluie" geofencing pour la Gateway
public class AlertController {

    @Autowired
    private AlertService alertService;

    // Endpoint : Lister les alertes pour Angular
    @GetMapping
    public List<Alert> getAlerts() {
        return alertService.getAllAlerts();
    }

    // Endpoint : Marquer une alerte comme résolue
    @PutMapping("/{id}/resolve")
    public Alert resolveAlert(@PathVariable Long id) {
        return alertService.resolveAlert(id);
    }
}