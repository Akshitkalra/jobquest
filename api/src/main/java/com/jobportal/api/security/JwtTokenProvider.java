package com.jobportal.api.security;

import com.jobportal.api.entity.Permission;
import com.jobportal.api.entity.Role;
import com.jobportal.api.entity.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.http.Cookie;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.List;
import java.util.UUID;

@Component
public class JwtTokenProvider {

    private static final Logger logger = LoggerFactory.getLogger(JwtTokenProvider.class);

    private final SecretKey signingKey;
    private final long accessExpiration;
    private final long refreshExpiration;
    private final boolean secureCookie;

    public JwtTokenProvider(
            @Value("${jwt.secret}") String secret,
            @Value("${jwt.access-expiration}") long accessExpiration,
            @Value("${jwt.refresh-expiration}") long refreshExpiration,
            @Value("${jwt.cookie-secure:false}") boolean secureCookie) {
        this.signingKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.accessExpiration = accessExpiration;
        this.refreshExpiration = refreshExpiration;
        this.secureCookie = secureCookie;
    }

    public String generateAccessToken(User user) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + accessExpiration);

        List<String> roles = user.getRoles().stream()
                .map(Role::getName)
                .toList();

        List<String> permissions = user.getRoles().stream()
                .flatMap(role -> role.getPermissions().stream())
                .map(Permission::getName)
                .distinct()
                .toList();

        return Jwts.builder()
                .subject(user.getId().toString())
                .claim("email", user.getEmail())
                .claim("userType", user.getUserType().name())
                .claim("roles", roles)
                .claim("permissions", permissions)
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(signingKey)
                .compact();
    }

    public String generateRefreshToken(User user) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + refreshExpiration);

        return Jwts.builder()
                .subject(user.getId().toString())
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(signingKey)
                .compact();
    }

    public UUID getUserIdFromToken(String token) {
        Claims claims = Jwts.parser()
                .verifyWith(signingKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();

        return UUID.fromString(claims.getSubject());
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parser()
                    .verifyWith(signingKey)
                    .build()
                    .parseSignedClaims(token);
            return true;
        } catch (ExpiredJwtException ex) {
            logger.warn("JWT token is expired: {}", ex.getMessage());
        } catch (JwtException ex) {
            logger.warn("Invalid JWT token: {}", ex.getMessage());
        } catch (IllegalArgumentException ex) {
            logger.warn("JWT claims string is empty: {}", ex.getMessage());
        }
        return false;
    }

    public Cookie createRefreshTokenCookie(String refreshToken) {
        Cookie cookie = new Cookie("refreshToken", refreshToken);
        cookie.setHttpOnly(true);
        cookie.setSecure(secureCookie);
        cookie.setPath("/api/v1/auth");
        cookie.setMaxAge((int) (refreshExpiration / 1000));
        cookie.setAttribute("SameSite", "Lax");
        return cookie;
    }

    public long getAccessExpiration() {
        return accessExpiration;
    }

    public Cookie createDeleteRefreshTokenCookie() {
        Cookie cookie = new Cookie("refreshToken", "");
        cookie.setHttpOnly(true);
        cookie.setSecure(secureCookie);
        cookie.setPath("/api/v1/auth");
        cookie.setMaxAge(0);
        cookie.setAttribute("SameSite", "Lax");
        return cookie;
    }
}
