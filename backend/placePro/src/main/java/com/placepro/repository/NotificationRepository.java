package com.placepro.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.placepro.model.Notification;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findAllByOrderByCreatedAtDesc();
    List<Notification> findByTargetRoleIgnoreCaseOrderByCreatedAtDesc(String targetRole);
    List<Notification> findByTargetUserIdOrderByCreatedAtDesc(Long targetUserId);
}
