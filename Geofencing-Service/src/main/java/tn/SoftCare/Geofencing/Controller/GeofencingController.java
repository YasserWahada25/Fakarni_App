package tn.SoftCare.Geofencing.Controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import tn.SoftCare.Geofencing.Entity.Zone;
import tn.SoftCare.Geofencing.Service.GeofencingService;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/geofencing")
public class GeofencingController {
    @Autowired private GeofencingService service;

    // Endpoint 1 : Créer une zone
    @PostMapping("/zone")
    public Zone create(@RequestBody Zone z) { return service.addZone(z); }

    // Endpoint 2 : Lister les zones
    @GetMapping("/zones")
    public List<Zone> list() { return service.getAll(); }

    // Endpoint 3 : Modifier une zone
    @PutMapping("/zone/{id}")
    public Zone update(@PathVariable Long id, @RequestBody Zone z) { return service.updateZone(id, z); }

    // Endpoint 4 : Supprimer une zone
    @DeleteMapping("/zone/{id}")
    public void delete(@PathVariable Long id) { service.deleteZone(id); }

    // Endpoint 5 : ANALYSE (Appelé par Tracking-Service)
    @PostMapping("/analyser")
    public void analyser(@RequestBody Map<String, Object> payload) {
        service.verifierPosition(
                payload.get("patientId").toString(),
                Double.parseDouble(payload.get("latitude").toString()),
                Double.parseDouble(payload.get("longitude").toString())
        );
    }
}