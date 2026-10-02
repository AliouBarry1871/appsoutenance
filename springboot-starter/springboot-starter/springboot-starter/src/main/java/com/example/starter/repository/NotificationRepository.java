package com.example.starter.repository;

import com.example.starter.domain.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    @Query("SELECT n FROM Notification n WHERE n.user.id = :userId ORDER BY n.createdAt DESC")
    List<Notification> findByUserIdOrderByCreatedAtDesc(@Param("userId") Long userId);

    @Query("SELECT COUNT(n) FROM Notification n WHERE n.user.id = :userId AND n.readStatus = false")
    long countByUserIdAndReadStatusFalse(@Param("userId") Long userId);
}
