package com.jobportal.api.exception;

import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleResourceNotFound(
            ResourceNotFoundException ex, HttpServletRequest request) {
        return buildErrorResponse(HttpStatus.NOT_FOUND, "Not Found", ex.getMessage(), request);
    }

    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<Map<String, Object>> handleBadRequest(
            BadRequestException ex, HttpServletRequest request) {
        return buildErrorResponse(HttpStatus.BAD_REQUEST, "Bad Request", ex.getMessage(), request);
    }

    @ExceptionHandler(UnauthorizedException.class)
    public ResponseEntity<Map<String, Object>> handleUnauthorized(
            UnauthorizedException ex, HttpServletRequest request) {
        return buildErrorResponse(HttpStatus.UNAUTHORIZED, "Unauthorized", ex.getMessage(), request);
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<Map<String, Object>> handleBadCredentials(
            BadCredentialsException ex, HttpServletRequest request) {
        return buildErrorResponse(HttpStatus.UNAUTHORIZED, "Unauthorized",
                "Invalid email or password", request);
    }

    @ExceptionHandler(ForbiddenException.class)
    public ResponseEntity<Map<String, Object>> handleForbidden(
            ForbiddenException ex, HttpServletRequest request) {
        return buildErrorResponse(HttpStatus.FORBIDDEN, "Forbidden", ex.getMessage(), request);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<Map<String, Object>> handleAccessDenied(
            AccessDeniedException ex, HttpServletRequest request) {
        return buildErrorResponse(HttpStatus.FORBIDDEN, "Forbidden",
                "You do not have permission to access this resource", request);
    }

    @ExceptionHandler(DuplicateResourceException.class)
    public ResponseEntity<Map<String, Object>> handleDuplicateResource(
            DuplicateResourceException ex, HttpServletRequest request) {
        return buildErrorResponse(HttpStatus.CONFLICT, "Conflict", ex.getMessage(), request);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidationErrors(
            MethodArgumentNotValidException ex, HttpServletRequest request) {

        Map<String, String> fieldErrors = ex.getBindingResult().getFieldErrors().stream()
                .collect(Collectors.toMap(
                        FieldError::getField,
                        fieldError -> fieldError.getDefaultMessage() != null
                                ? fieldError.getDefaultMessage()
                                : "Invalid value",
                        (first, second) -> first
                ));

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("status", HttpStatus.BAD_REQUEST.value());
        body.put("error", "Bad Request");
        body.put("message", "Validation failed");
        body.put("fieldErrors", fieldErrors);
        body.put("timestamp", LocalDateTime.now().toString());
        body.put("path", request.getRequestURI());

        return new ResponseEntity<>(body, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(FileUploadException.class)
    public ResponseEntity<Map<String, Object>> handleFileUpload(
            FileUploadException ex, HttpServletRequest request) {
        return buildErrorResponse(HttpStatus.BAD_REQUEST, "Bad Request", ex.getMessage(), request);
    }

    @ExceptionHandler(MlServiceException.class)
    public ResponseEntity<Map<String, Object>> handleMlService(
            MlServiceException ex, HttpServletRequest request) {
        logger.error("ML service error: {}", ex.getMessage(), ex);
        return buildErrorResponse(HttpStatus.BAD_GATEWAY, "Bad Gateway", ex.getMessage(), request);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGenericException(
            Exception ex, HttpServletRequest request) {
        logger.error("Unexpected error: {}", ex.getMessage(), ex);
        return buildErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR, "Internal Server Error",
                "An unexpected error occurred", request);
    }

    private ResponseEntity<Map<String, Object>> buildErrorResponse(
            HttpStatus status, String error, String message, HttpServletRequest request) {

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("status", status.value());
        body.put("error", error);
        body.put("message", message);
        body.put("timestamp", LocalDateTime.now().toString());
        body.put("path", request.getRequestURI());

        return new ResponseEntity<>(body, status);
    }
}
