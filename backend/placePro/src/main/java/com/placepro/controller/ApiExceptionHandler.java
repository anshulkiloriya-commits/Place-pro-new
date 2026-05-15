package com.placepro.controller;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

@RestControllerAdvice
public class ApiExceptionHandler {

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<Map<String, Object>> handleResponseStatusException(ResponseStatusException exception) {
        HttpStatus status = HttpStatus.valueOf(exception.getStatusCode().value());
        return buildResponse(status, exception.getReason() != null ? exception.getReason() : status.getReasonPhrase());
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, Object>> handleDataIntegrityViolation(DataIntegrityViolationException exception) {
        return buildResponse(HttpStatus.BAD_REQUEST, resolveDataIntegrityMessage(exception));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleUnexpectedException(Exception exception) {
        return buildResponse(HttpStatus.INTERNAL_SERVER_ERROR, "Unexpected server error");
    }

    private ResponseEntity<Map<String, Object>> buildResponse(HttpStatus status, String message) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", Instant.now().toString());
        body.put("status", status.value());
        body.put("error", status.getReasonPhrase());
        body.put("message", message);
        return ResponseEntity.status(status).body(body);
    }

    private String resolveDataIntegrityMessage(DataIntegrityViolationException exception) {
        String detail = exception.getMostSpecificCause() != null
            ? exception.getMostSpecificCause().getMessage()
            : exception.getMessage();

        if (detail == null || detail.isBlank()) {
            return "The submitted data violates a database rule";
        }

        String normalized = detail.toLowerCase();
        if (normalized.contains("student_documents_size_check")) {
            return "Document size must be 1MB or less";
        }
        if (normalized.contains("value too long for type character varying")) {
            return "The uploaded content is too large for the current field";
        }
        if (normalized.contains("duplicate key value")) {
            return "This record already exists";
        }

        return "The submitted data violates a database rule";
    }
}
