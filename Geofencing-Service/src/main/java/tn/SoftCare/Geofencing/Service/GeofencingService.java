package tn.SoftCare.Geofencing.Service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import tn.SoftCare.Geofencing.Entity.Zone;
import tn.SoftCare.Geofencing.Repository.ZoneRepository;
import java.util.List;

@Service
public class GeofencingService {
    @Autowired private ZoneRepository repository;

    // --- CRUD ---
    public Zone addZone(Zone z) { return repository.save(z); }
    public List<Zone> getAll() { return repository.findAll(); }
    public void deleteZone(Long id) { repository.deleteById(id); }

    public Zone updateZone(Long id, Zone details) {
        return repository.findById(id).map(z -> {
            z.setNomZone(details.getNomZone());
            z.setCentreLat(details.getCentreLat());
            z.setCentreLon(details.getCentreLon());
            z.setRayon(details.getRayon());
            return repository.save(z);
        }).orElse(null);
    }

    // --- LOGIQUE METIER (Analyse) ---
    public void verifierPosition(String patientId, double lat, double lon) {
        repository.findByPatientId(patientId).ifPresentOrElse(zone -> {
            double distance = haversine(lat, lon, zone.getCentreLat(), zone.getCentreLon());

            if (distance > zone.getRayon()) {
                System.err.println("🚨 ALERTE : Patient " + patientId + " HORS ZONE (" + (int)distance + "m) !");
            } else {
                System.out.println("✅ SAFE : Patient " + patientId + " en zone (" + (int)distance + "m).");
            }
        }, () -> System.out.println("ℹ️ Pas de zone configurée pour " + patientId));
    }

    private double haversine(double lat1, double lon1, double lat2, double lon2) {
        double R = 6371000; // Rayon Terre en m
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) *
                        Math.sin(dLon/2) * Math.sin(dLon/2);
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    }
}