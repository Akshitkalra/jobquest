package com.jobportal.api.service;

import com.jobportal.api.dto.request.CandidateRegisterRequest;
import com.jobportal.api.dto.request.CompanyRegisterRequest;
import com.jobportal.api.dto.request.LoginRequest;
import com.jobportal.api.dto.response.AuthResponse;
import com.jobportal.api.dto.response.UserResponse;
import com.jobportal.api.entity.CandidateProfile;
import com.jobportal.api.entity.Company;
import com.jobportal.api.entity.Role;
import com.jobportal.api.entity.User;
import com.jobportal.api.entity.enums.UserType;
import com.jobportal.api.exception.DuplicateResourceException;
import com.jobportal.api.exception.ResourceNotFoundException;
import com.jobportal.api.exception.UnauthorizedException;
import com.jobportal.api.repository.CandidateProfileRepository;
import com.jobportal.api.repository.CompanyRepository;
import com.jobportal.api.repository.RoleRepository;
import com.jobportal.api.repository.UserRepository;
import com.jobportal.api.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;
import java.util.concurrent.ThreadLocalRandom;

@Service
@RequiredArgsConstructor
@Transactional
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final CompanyRepository companyRepository;
    private final CandidateProfileRepository candidateProfileRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    public AuthResponse registerCandidate(CandidateRegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("User", "email", request.getEmail());
        }

        User user = User.builder()
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .userType(UserType.CANDIDATE)
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .phone(request.getPhone())
                .isActive(true)
                .isVerified(false)
                .build();

        Role candidateRole = roleRepository.findByName("CANDIDATE")
                .orElseThrow(() -> new ResourceNotFoundException("Role", "name", "CANDIDATE"));
        user.getRoles().add(candidateRole);

        user = userRepository.save(user);

        CandidateProfile profile = CandidateProfile.builder()
                .user(user)
                .build();
        candidateProfileRepository.save(profile);

        return buildAuthResponse(user);
    }

    public AuthResponse registerCompany(CompanyRegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("User", "email", request.getEmail());
        }

        User user = User.builder()
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .userType(UserType.COMPANY)
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .isActive(true)
                .isVerified(false)
                .build();

        Role companyOwnerRole = roleRepository.findByName("COMPANY_OWNER")
                .orElseThrow(() -> new ResourceNotFoundException("Role", "name", "COMPANY_OWNER"));
        user.getRoles().add(companyOwnerRole);

        user = userRepository.save(user);

        String slug = generateSlug(request.getCompanyName());

        Company company = Company.builder()
                .user(user)
                .name(request.getCompanyName())
                .slug(slug)
                .industry(request.getIndustry())
                .companySize(request.getCompanySize())
                .isActive(true)
                .isVerified(false)
                .build();
        companyRepository.save(company);

        return buildAuthResponse(user);
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UnauthorizedException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new UnauthorizedException("Invalid email or password");
        }

        if (!Boolean.TRUE.equals(user.getIsActive())) {
            throw new UnauthorizedException("Account is deactivated");
        }

        user.setLastLoginAt(LocalDateTime.now());
        userRepository.save(user);

        return buildAuthResponse(user);
    }

    @Transactional(readOnly = true)
    public AuthResponse refreshToken(String refreshToken) {
        if (!jwtTokenProvider.validateToken(refreshToken)) {
            throw new UnauthorizedException("Invalid or expired refresh token");
        }

        UUID userId = jwtTokenProvider.getUserIdFromToken(refreshToken);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UnauthorizedException("User not found"));

        if (!Boolean.TRUE.equals(user.getIsActive())) {
            throw new UnauthorizedException("Account is deactivated");
        }

        String accessToken = jwtTokenProvider.generateAccessToken(user);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .tokenType("Bearer")
                .expiresIn(jwtTokenProvider.getAccessExpiration())
                .user(UserResponse.fromEntity(user))
                .refreshToken(refreshToken)
                .build();
    }

    @Transactional(readOnly = true)
    public UserResponse getCurrentUser(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        return UserResponse.fromEntity(user);
    }

    private AuthResponse buildAuthResponse(User user) {
        String accessToken = jwtTokenProvider.generateAccessToken(user);
        String refreshToken = jwtTokenProvider.generateRefreshToken(user);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .tokenType("Bearer")
                .expiresIn(jwtTokenProvider.getAccessExpiration())
                .user(UserResponse.fromEntity(user))
                .refreshToken(refreshToken)
                .build();
    }

    private String generateSlug(String name) {
        String slug = name.toLowerCase()
                .trim()
                .replaceAll("[^a-z0-9\\s-]", "")
                .replaceAll("[\\s]+", "-")
                .replaceAll("-+", "-")
                .replaceAll("^-|-$", "");

        if (companyRepository.existsBySlug(slug)) {
            int suffix = ThreadLocalRandom.current().nextInt(1000, 9999);
            slug = slug + "-" + suffix;
        }

        return slug;
    }
}
