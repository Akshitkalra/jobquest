package com.jobportal.api.controller;

import com.jobportal.api.dto.response.ApiResponse;
import com.jobportal.api.dto.response.PagedResponse;
import com.jobportal.api.entity.User;
import com.jobportal.api.security.CustomUserDetails;
import com.jobportal.api.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public ResponseEntity<ApiResponse<PagedResponse<NotificationService.NotificationResponse>>> getNotifications(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        User currentUser = getCurrentUser();
        Pageable pageable = PageRequest.of(page, size);
        PagedResponse<NotificationService.NotificationResponse> notifications =
                notificationService.getNotifications(currentUser.getId(), pageable);
        return ResponseEntity.ok(ApiResponse.success(notifications));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<ApiResponse<Void>> markAsRead(@PathVariable UUID id) {
        User currentUser = getCurrentUser();
        notificationService.markAsRead(currentUser.getId(), id);
        return ResponseEntity.ok(ApiResponse.success(null, "Notification marked as read"));
    }

    @PutMapping("/read-all")
    public ResponseEntity<ApiResponse<Void>> markAllAsRead() {
        User currentUser = getCurrentUser();
        notificationService.markAllAsRead(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success(null, "All notifications marked as read"));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<ApiResponse<Long>> getUnreadCount() {
        User currentUser = getCurrentUser();
        long count = notificationService.getUnreadCount(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success(count));
    }

    private User getCurrentUser() {
        CustomUserDetails userDetails = (CustomUserDetails) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();
        return userDetails.getUser();
    }
}
