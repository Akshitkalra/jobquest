package com.jobportal.api.dto.response;

import com.jobportal.api.entity.Permission;
import com.jobportal.api.entity.Role;
import com.jobportal.api.entity.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {

    private UUID id;
    private String email;
    private String userType;
    private String firstName;
    private String lastName;
    private String phone;
    private String avatarUrl;
    private List<String> roles;
    private List<String> permissions;
    private LocalDateTime createdAt;

    public static UserResponse fromEntity(User user) {
        List<String> roleNames = user.getRoles().stream()
                .map(Role::getName)
                .toList();

        List<String> permissionNames = user.getRoles().stream()
                .flatMap(role -> role.getPermissions().stream())
                .map(Permission::getName)
                .distinct()
                .toList();

        return UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .userType(user.getUserType().name())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .phone(user.getPhone())
                .avatarUrl(user.getAvatarUrl())
                .roles(roleNames)
                .permissions(permissionNames)
                .createdAt(user.getCreatedAt())
                .build();
    }
}
