package tn.SoftCare.Geofencing.Service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import tn.SoftCare.Geofencing.Entity.Zone;
import tn.SoftCare.Geofencing.Repository.ZoneRepository;
import java.util.List;

@Service
public class GeofencingService {

    @Autowired private ZoneRepository zoneRepository;
    @Autowired private AlertService alertService;

    public Zone addZone(Zone z) { return zoneRepository.save(z); }
    public List<Zone> getAll() { return zoneRepository.findAll(); }
    public void deleteZone(Long id) { zoneRepository.deleteById(id); }

    public Zone updateZone(Long id, Zone details) {
        return zoneRepository.findById(id).map(z -> {
            z.setNomZone(details.getNomZone());
            z.setCentreLat(details.getCentreLat());
            z.setCentreLon(details.getCentreLon());
            z.setRayon(details.getRayon());
            z.setType(details.getType());
            return zoneRepository.save(z);
        }).orElse(null);
    }

    /**
     * Analyse la position reçue et compare avec la zone configurée
     */
    public void verifierPosition(String patientId, double lat, double lon) {
        zoneRepository.findByPatientId(patientId).ifPresentOrElse(zone -> {
            double distance = haversine(lat, lon, zone.getCentreLat(), zone.getCentreLon());
            boolean enAlerte = false;
            double depassement = 0;
            String typeAlerte = "";

            // LOGIQUE SAFE : Alerte si on SORT du cercle (distance > rayon)
            if ("SAFE".equals(zone.getType().name())) {
                if (distance > zone.getRayon()) {
                    enAlerte = true;
                    depassement = distance - zone.getRayon();
                    typeAlerte = "SORTIE_ZONE_SAFE";
                }
            }
            // LOGIQUE DANGER : Alerte si on ENTRE dans le cercle (distance < rayon)
            else if ("DANGER".equals(zone.getType().name())) {
                if (distance < zone.getRayon()) {
                    enAlerte = true;
                    depassement = zone.getRayon() - distance;
                    typeAlerte = "ENTREE_ZONE_DANGER";
                }
            }

            if (enAlerte) {
                alertService.createAlert(patientId, depassement, typeAlerte);
            } else {
                System.out.println("✅ Patient " + patientId + " est en règle (Distance: " + Math.round(distance) + "m)");
            }
        }, () -> System.err.println("ℹ️ Aucune zone pour le patient: " + patientId));
    }

    private double haversine(double lat1, double lon1, double lat2, double lon2) {
        double R = 6371000; // Rayon de la Terre en mètres
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) *
                        Math.sin(dLon/2) * Math.sin(dLon/2);
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    }
}