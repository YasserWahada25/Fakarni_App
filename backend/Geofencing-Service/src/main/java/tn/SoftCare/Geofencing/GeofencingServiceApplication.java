package tn.SoftCare.Geofencing;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@EnableDiscoveryClient
@SpringBootApplication
public class GeofencingServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(GeofencingServiceApplication.class, args);
	}

}
