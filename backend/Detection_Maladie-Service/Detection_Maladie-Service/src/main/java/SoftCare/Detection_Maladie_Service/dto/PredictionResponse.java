package SoftCare.Detection_Maladie_Service.dto;

import lombok.Data;
import java.util.List;
import java.util.Map;

@Data
public class PredictionResponse {

    private String prediction;
    private Double confidence;
    private RiskInfo risk;
    private Map<String, Double> probabilities;

    @Data
    public static class RiskInfo {
        private Integer level;
        private String label;
        private String color;
        private String description;
        private List<String> recommendations;
    }
}