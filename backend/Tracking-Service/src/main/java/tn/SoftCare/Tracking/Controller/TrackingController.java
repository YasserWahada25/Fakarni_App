package tn.SoftCare.Tracking.Controller;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import tn.SoftCare.Tracking.Entity.Position;
import tn.SoftCare.Tracking.Service.TrackingService;

@RestController
@RequestMapping("/api/tracking")
public class TrackingController {
    @Autowired private TrackingService service;

    @PostMapping("/add")
    public Position ajouterPosition(@RequestBody Position position) {
        return service.saveAndProcess(position);
    }
}
