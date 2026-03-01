package com.alzheimer.session_service.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.socket.EnableWebSocketSecurity;
import org.springframework.security.web.SecurityFilterChain;

/**
 * Configuration de sécurité Spring Security.
 *
 * <p>Autorise :</p>
 * <ul>
 *   <li>Toutes les requêtes HTTP (REST) sans authentification — comportement existant conservé.</li>
 *   <li>Le endpoint WebSocket {@code /ws/**} et le chemin SockJS {@code /ws/info} utilisés
 *       par la signalisation vidéo.</li>
 * </ul>
 *
 * <p><b>Note :</b> la sécurisation des WebSocket (authentification par token JWT dans le
 * header STOMP CONNECT) peut être ajoutée en implémentant un
 * {@code ChannelInterceptor} sur {@code clientInboundChannel()}.</p>
 */
@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        return http
                .csrf(csrf -> csrf
                        .disable()
                )
                .authorizeHttpRequests(auth -> auth
                        // Endpoints WebSocket SockJS + signalisation
                        .requestMatchers("/ws/**").permitAll()
                        // Swagger UI / OpenAPI
                        .requestMatchers("/swagger-ui/**", "/v3/api-docs/**").permitAll()
                        // Tous les endpoints REST (comportement existant préservé)
                        .anyRequest().permitAll()
                )
                .build();
    }
}
