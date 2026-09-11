package com.alzheimer.Event_Service.services;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.Map;

/**
 * Client Feign vers le User-Service via Eureka (Spring Cloud LoadBalancer).
 * Le nom "User-Service" correspond exactement au spring.application.name du service cible.
 * L'URL est résolue dynamiquement via Eureka — plus de dépendance hardcodée sur la Gateway.
 */
@FeignClient(name = "User-Service")
public interface UserClient {

    @GetMapping("/api/users/{id}")
    Map<String, Object> getUserById(@PathVariable("id") String id);
}
