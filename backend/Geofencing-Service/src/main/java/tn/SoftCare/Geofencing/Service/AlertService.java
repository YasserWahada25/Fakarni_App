package tn.SoftCare.Geofencing.Service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import tn.SoftCare.Geofencing.Entity.Alert;
import tn.SoftCare.Geofencing.Repository.AlertRepository;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class AlertService {

    @Autowired
    private AlertRepository alertRepository;

    /**
     * Crée une alerte seulement si aucune alerte active n'existe déjà pour ce patient
     */
    public void createAlert(String patientId, double distance, String typeAlerte) {
        // Vérification des alertes déjà existantes et "Active"
        boolean dejaEnAlerte = alertRepository.findAll().stream()
                .anyMatch(a -> a.getPatientId().equals(patientId) && "Active".equals(a.getStatus()));

        if (!dejaEnAlerte) {
            Alert alerte = new Alert();
            alerte.setPatientId(patientId);
            alerte.setPatientName("Patient " + patientId);
            alerte.setType(typeAlerte);
            alerte.setTimestamp(LocalDateTime.now());
            alerte.setStatus("Active");
            alerte.setSeverity("High");
            alerte.setDistanceHorsZone(distance);

            alertRepository.save(alerte);
            System.out.println("🚨 NOUVELLE ALERTE : " + typeAlerte + " pour " + patientId);
        }
    }

    public List<Alert> getAllAlerts() {
        return alertRepository.findAll();
    }

    public Alert resolveAlert(Long alertId) {
        return alertRepository.findById(alertId).map(alert -> {
            alert.setStatus("Resolved");
            return alertRepository.save(alert);
        }).orElse(null);
    }
}