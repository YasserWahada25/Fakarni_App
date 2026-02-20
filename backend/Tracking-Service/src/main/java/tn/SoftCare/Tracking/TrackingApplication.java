package tn.SoftCare.Tracking;


import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.openfeign.EnableFeignClients;
//import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication
@EnableDiscoveryClient
@EnableFeignClients(basePackages = "tn.SoftCare.Tracking.Client")
public class TrackingApplication {
	public static void main(String[] args) {
		SpringApplication.run(TrackingApplication.class, args);
	}
}

