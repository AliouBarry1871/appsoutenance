package com.example.starter.service;

import com.example.starter.domain.Notification;
import com.example.starter.domain.User;
import com.example.starter.exception.ResourceNotFoundException;
import com.example.starter.repository.NotificationRepository;
import com.example.starter.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<Notification> getUserNotifications(String email) {
        if (email == null || email.isBlank()) {
            return List.of();
        }
        return userRepository.findByEmailIgnoreCase(email.trim())
                .map(user -> notificationRepository.findByUserIdOrderByCreatedAtDesc(user.getId()))
                .orElse(List.of());
    }

    @Transactional(readOnly = true)
    public long getUnreadCount(String email) {
        if (email == null || email.isBlank()) {
            return 0L;
        }
        return userRepository.findByEmailIgnoreCase(email.trim())
                .map(user -> notificationRepository.countByUserIdAndReadStatusFalse(user.getId()))
                .orElse(0L);
    }

    @Transactional
    public void markAsRead(Long id, String email) {
        if (id == null || email == null) return;
        notificationRepository.findById(id).ifPresent(notif -> {
            if (notif.getUser() != null && notif.getUser().getEmail().equalsIgnoreCase(email.trim())) {
                notif.setReadStatus(true);
                notificationRepository.save(notif);
            }
        });
    }

    @Transactional
    public void markAllAsRead(String email) {
        if (email == null || email.isBlank()) return;
        userRepository.findByEmailIgnoreCase(email.trim()).ifPresent(user -> {
            List<Notification> notifs = notificationRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
            notifs.forEach(n -> n.setReadStatus(true));
            notificationRepository.saveAll(notifs);
        });
    }

    @Transactional
    public Notification createNotification(User user, String title, String message, String type) {
        Notification notification = Notification.builder()
                .title(title)
                .message(message)
                .type(type != null ? type : "INFO")
                .readStatus(false)
                .user(user)
                .build();
        return notificationRepository.save(notification);
    }
}
