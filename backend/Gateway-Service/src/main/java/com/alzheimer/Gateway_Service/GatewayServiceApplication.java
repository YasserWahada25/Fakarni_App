package com.alzheimer.Gateway_Service;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;

import static org.springframework.web.reactive.function.server.RouterFunctions.route;

@SpringBootApplication
@EnableDiscoveryClient
public class GatewayServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(GatewayServiceApplication.class, args);
	}

		@Bean
		public RouteLocator gatewayRoutes(RouteLocatorBuilder builder) {
			return builder.routes()
					.route("tracking_route", r -> r.path("/api/tracking/**")
							.uri("lb://TRACKING-SERVICE"))
					.route("geofencing_route", r -> r.path("/api/geofencing/**")
							.uri("lb://GEOFENCING-SERVICE"))
					.build(); // On ne met le build qu'à la toute fin !
		}

	}
