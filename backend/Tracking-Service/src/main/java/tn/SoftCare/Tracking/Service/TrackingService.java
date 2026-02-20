package tn.SoftCare.Tracking.Service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import tn.SoftCare.Tracking.Entity.Position;
import tn.SoftCare.Tracking.Repository.TrackingRepository;
import tn.SoftCare.Tracking.Client.GeofencingClient;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
public class TrackingService {
    @Autowired private TrackingRepository repository;
   @Autowired private GeofencingClient geofencingClient;

    public Position saveAndProcess(Position position) {
        // 1. Sauvegarde locale
        position.setTimestamp(LocalDateTime.now());
        Position saved = repository.save(position);

        // 2. Préparation des données pour le Service 2
        Map<String, Object> payload = new HashMap<>();
        payload.put("patientId", saved.getPatientId());
        payload.put("latitude", saved.getLatitude());
        payload.put("longitude", saved.getLongitude());

        // 3. Appel distant
        try {
            geofencingClient.envoyerPourAnalyse(payload);
            System.out.println(">> Données envoyées au Geofencing Service.");
        } catch (Exception e) {
            System.err.println("!! Erreur communication Geofencing : " + e.getMessage());
        }
        return saved;
   }
}
