package com.alzheimer.session_service.controllers;

import com.alzheimer.session_service.services.VirtualSessionService.BadRequestException;
import com.alzheimer.session_service.services.VirtualSessionService.NotFoundException;
import jakarta.validation.ConstraintViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

@RestControllerAdvice
public class ApiExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleMethodArgumentNotValid(MethodArgumentNotValidException ex) {
        Map<String, String> fieldErrors = new LinkedHashMap<>();
        for (FieldError fieldError : ex.getBindingResult().getFieldErrors()) {
            String field = fieldError.getField();
            String message = fieldError.getDefaultMessage();
            fieldErrors.putIfAbsent(field, (message == null || message.isBlank()) ? "Champ invalide." : message);
        }

        return buildResponse(HttpStatus.BAD_REQUEST, "Veuillez corriger les champs invalides.", fieldErrors);
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<Map<String, Object>> handleConstraintViolation(ConstraintViolationException ex) {
        return buildResponse(HttpStatus.BAD_REQUEST, "Requete invalide.", Map.of());
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<Map<String, Object>> handleMessageNotReadable(HttpMessageNotReadableException ex) {
        String rawMessage = ex.getMostSpecificCause() != null
                ? ex.getMostSpecificCause().getMessage()
                : ex.getMessage();
        return buildResponse(HttpStatus.BAD_REQUEST, normalizeMessage(rawMessage), Map.of());
    }

    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<Map<String, Object>> handleBadRequest(BadRequestException ex) {
        return buildResponse(HttpStatus.BAD_REQUEST, normalizeMessage(ex.getMessage()), Map.of());
    }

    @ExceptionHandler(NotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleNotFound(NotFoundException ex) {
        return buildResponse(HttpStatus.NOT_FOUND, ex.getMessage(), Map.of());
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGeneric(Exception ex) {
        return buildResponse(HttpStatus.INTERNAL_SERVER_ERROR, "Erreur serveur interne.", Map.of());
    }

    private ResponseEntity<Map<String, Object>> buildResponse(
            HttpStatus status,
            String message,
            Map<String, String> fieldErrors
    ) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", Instant.now().toString());
        body.put("status", status.value());
        body.put("message", message);
        body.put("fieldErrors", fieldErrors);
        return ResponseEntity.status(status).body(body);
    }

    private String normalizeMessage(String message) {
        if (message == null || message.isBlank()) {
            return "Requete invalide.";
        }

        String normalized = message.toLowerCase();
        if (normalized.contains("sessionstatus")) {
            return "Le statut fourni est invalide.";
        }
        if (normalized.contains("sessionvisibility")) {
            return "La visibilite fournie est invalide.";
        }
        if (normalized.contains("endtime must be after starttime")) {
            return "L'heure de fin doit etre apres l'heure de debut.";
        }

        return message;
    }
}
