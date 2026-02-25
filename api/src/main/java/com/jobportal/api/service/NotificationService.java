package com.jobportal.api.service;

import com.jobportal.api.dto.response.PagedResponse;
import com.jobportal.api.entity.Notification;
import com.jobportal.api.entity.User;
import com.jobportal.api.exception.ForbiddenException;
import com.jobportal.api.exception.ResourceNotFoundException;
import com.jobportal.api.repository.NotificationRepository;
import com.jobportal.api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public void createNotification(UUID userId, String title, String message,
                                    String type, String refType, UUID refId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        Notification notification = Notification.builder()
                .user(user)
                .title(title)
                .message(message)
                .type(type)
                .referenceType(refType)
                .referenceId(refId)
                .isRead(false)
                .build();

        notificationRepository.save(notification);
    }

    @Transactional(readOnly = true)
    public PagedResponse<NotificationResponse> getNotifications(UUID userId, Pageable pageable) {
        Page<Notification> notificationsPage = notificationRepository.findByUserIdOrderByCreatedAtDesc(
                userId, pageable);

        Page<NotificationResponse> responsePage = notificationsPage.map(notification ->
                NotificationResponse.builder()
                        .id(notification.getId())
                        .title(notification.getTitle())
                        .message(notification.getMessage())
                        .type(notification.getType())
                        .referenceType(notification.getReferenceType())
                        .referenceId(notification.getReferenceId())
                        .isRead(notification.getIsRead())
                        .createdAt(notification.getCreatedAt())
                        .build()
        );

        return PagedResponse.fromPage(responsePage);
    }

    public void markAsRead(UUID userId, UUID notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification", "id", notificationId));

        if (!notification.getUser().getId().equals(userId)) {
            throw new ForbiddenException("You are not authorized to modify this notification");
        }

        notification.setIsRead(true);
        notificationRepository.save(notification);
    }

    public void markAllAsRead(UUID userId) {
        Page<Notification> notifications = notificationRepository.findByUserIdOrderByCreatedAtDesc(
                userId, Pageable.unpaged());

        notifications.getContent().forEach(notification -> {
            if (!Boolean.TRUE.equals(notification.getIsRead())) {
                notification.setIsRead(true);
                notificationRepository.save(notification);
            }
        });
    }

    @Transactional(readOnly = true)
    public long getUnreadCount(UUID userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    public static class NotificationResponse {
        private UUID id;
        private String title;
        private String message;
        private String type;
        private String referenceType;
        private UUID referenceId;
        private Boolean isRead;
        private java.time.LocalDateTime createdAt;
    }
}
