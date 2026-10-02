package com.example.starter.controller;

import com.example.starter.domain.Notification;
import com.example.starter.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping({"/api/v1/notifications", "/api/notifications"})
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public ResponseEntity<List<Notification>> getUserNotifications(Authentication authentication) {
        try {
            if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
                return ResponseEntity.ok(List.of());
            }
            return ResponseEntity.ok(notificationService.getUserNotifications(authentication.getName()));
        } catch (Exception e) {
            return ResponseEntity.ok(List.of());
        }
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(Authentication authentication) {
        try {
            if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
                return ResponseEntity.ok(Map.of("unreadCount", 0L));
            }
            long count = notificationService.getUnreadCount(authentication.getName());
            return ResponseEntity.ok(Map.of("unreadCount", count));
        } catch (Exception e) {
            return ResponseEntity.ok(Map.of("unreadCount", 0L));
        }
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable Long id, Authentication authentication) {
        if (authentication != null && authentication.isAuthenticated() && !"anonymousUser".equals(authentication.getPrincipal())) {
            notificationService.markAsRead(id, authentication.getName());
        }
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead(Authentication authentication) {
        if (authentication != null && authentication.isAuthenticated() && !"anonymousUser".equals(authentication.getPrincipal())) {
            notificationService.markAllAsRead(authentication.getName());
        }
        return ResponseEntity.noContent().build();
    }
}
