package com.alzheimer.meeting_insights_service;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
@EnableDiscoveryClient
public class MeetingInsightsServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(MeetingInsightsServiceApplication.class, args);
	}

}
