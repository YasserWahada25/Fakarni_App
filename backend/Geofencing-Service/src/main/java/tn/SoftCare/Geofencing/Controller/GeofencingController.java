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

    @Autowired private GeofencingService geofencingService;

    @PostMapping("/zone")
    public Zone create(@RequestBody Zone z) {
        return geofencingService.addZone(z);
    }

    @GetMapping("/zones")
    public List<Zone> list() {
        return geofencingService.getAll();
    }

    @PutMapping("/zone/{id}")
    public Zone update(@PathVariable Long id, @RequestBody Zone z) {
        return geofencingService.updateZone(id, z);
    }

    @DeleteMapping("/zone/{id}")
    public void delete(@PathVariable Long id) {
        geofencingService.deleteZone(id);
    }

    // Endpoint d'analyse appelé par le Tracking-Service via Feign
    @PostMapping("/analyser")
    public void analyser(@RequestBody Map<String, Object> payload) {
        geofencingService.verifierPosition(
                payload.get("patientId").toString(),
                Double.parseDouble(payload.get("latitude").toString()),
                Double.parseDouble(payload.get("longitude").toString())
        );
    }
}