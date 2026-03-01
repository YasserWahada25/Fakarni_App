package com.alzheimer.Gateway_Service;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.beans.factory.annotation.Value;

@SpringBootApplication
@EnableDiscoveryClient

public class GatewayServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(GatewayServiceApplication.class, args);
	}

	@Bean
	public RouteLocator gatewayRoutes(
			RouteLocatorBuilder builder,
			@Value("${gateway.routes.user-auth.uri:lb://USER-SERVICE}") String userAuthUri,
			@Value("${gateway.routes.session.uri:http://localhost:8085}") String sessionUri,
			@Value("${gateway.routes.event.uri:lb://EVENT-SERVICE}") String eventUri,
			@Value("${gateway.routes.user.uri:lb://USER-SERVICE}") String userUri
	) {
		return builder.routes()
				.route("User-Auth", r -> r.path("/auth/**")
						.uri(userAuthUri))
				.route("session_service", r -> r.path("/session/**")
						.uri(sessionUri))
				.route("session_ws", r -> r.path("/ws/**")
						.uri(sessionUri))
				.route("Event-Service", r -> r.path("/api/events/**")
						.uri(eventUri))
				.route("User-Service", r -> r.path("/api/users/**")
						.uri(userUri))
				.build();
	}

}
