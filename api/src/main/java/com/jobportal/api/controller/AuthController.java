package com.jobportal.api.controller;

import com.jobportal.api.dto.request.CandidateRegisterRequest;
import com.jobportal.api.dto.request.CompanyRegisterRequest;
import com.jobportal.api.dto.request.LoginRequest;
import com.jobportal.api.dto.response.ApiResponse;
import com.jobportal.api.dto.response.AuthResponse;
import com.jobportal.api.dto.response.UserResponse;
import com.jobportal.api.security.CustomUserDetails;
import com.jobportal.api.security.JwtTokenProvider;
import com.jobportal.api.service.AuthService;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final JwtTokenProvider jwtTokenProvider;

    @PostMapping("/register/candidate")
    public ResponseEntity<ApiResponse<AuthResponse>> registerCandidate(
            @Valid @RequestBody CandidateRegisterRequest request,
            HttpServletResponse response) {

        AuthResponse authResponse = authService.registerCandidate(request);
        response.addCookie(jwtTokenProvider.createRefreshTokenCookie(authResponse.getRefreshToken()));

        return ResponseEntity.ok(ApiResponse.success(authResponse, "Registration successful"));
    }

    @PostMapping("/register/company")
    public ResponseEntity<ApiResponse<AuthResponse>> registerCompany(
            @Valid @RequestBody CompanyRegisterRequest request,
            HttpServletResponse response) {

        AuthResponse authResponse = authService.registerCompany(request);
        response.addCookie(jwtTokenProvider.createRefreshTokenCookie(authResponse.getRefreshToken()));

        return ResponseEntity.ok(ApiResponse.success(authResponse, "Registration successful"));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletResponse response) {

        AuthResponse authResponse = authService.login(request);
        response.addCookie(jwtTokenProvider.createRefreshTokenCookie(authResponse.getRefreshToken()));

        return ResponseEntity.ok(ApiResponse.success(authResponse, "Login successful"));
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<AuthResponse>> refreshToken(
            @CookieValue(name = "refreshToken") String refreshToken,
            HttpServletResponse response) {

        AuthResponse authResponse = authService.refreshToken(refreshToken);
        response.addCookie(jwtTokenProvider.createRefreshTokenCookie(authResponse.getRefreshToken()));

        return ResponseEntity.ok(ApiResponse.success(authResponse));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(HttpServletResponse response) {
        response.addCookie(jwtTokenProvider.createDeleteRefreshTokenCookie());
        return ResponseEntity.ok(ApiResponse.success(null, "Logged out successfully"));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();

        UserResponse userResponse = authService.getCurrentUser(userDetails.getUser().getId());
        return ResponseEntity.ok(ApiResponse.success(userResponse));
    }
}
