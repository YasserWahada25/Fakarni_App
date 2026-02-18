//package tn.SoftCare.Tracking.Client;
//
//import org.springframework.cloud.openfeign.FeignClient;
//import org.springframework.web.bind.annotation.PostMapping;
//import org.springframework.web.bind.annotation.RequestBody;
//import java.util.Map;
//
//@FeignClient(name = "geofencing-service", url = "${GEOFENCING_SERVICE_URL:http://localhost:9012}")
//public interface GeofencingClient {
//    @PostMapping("/api/geofencing/analyser")
//    void envoyerPourAnalyse(@RequestBody Map<String, Object> payload);
//}