package com.placepro.controller;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.placepro.model.Admin;
import com.placepro.model.Notification;
import com.placepro.repository.AdminRepository;
import com.placepro.repository.NotificationRepository;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin("*")
public class NotificationController {

    private final AdminRepository adminRepository;
    private final NotificationRepository notificationRepository;

    public NotificationController(AdminRepository adminRepository, NotificationRepository notificationRepository) {
        this.adminRepository = adminRepository;
        this.notificationRepository = notificationRepository;
    }

    @GetMapping
    public List<Notification> getNotifications(
        @RequestParam(required = false) String role,
        @RequestParam(required = false) Long userId
    ) {
        if (userId != null) {
            return notificationRepository.findByTargetUserIdOrderByCreatedAtDesc(userId);
        }

        if (role != null && !role.isBlank()) {
            return notificationRepository.findByTargetRoleIgnoreCaseOrderByCreatedAtDesc(role.trim());
        }

        return notificationRepository.findAllByOrderByCreatedAtDesc();
    }

    @GetMapping("/{notificationId}")
    public Notification getNotification(@PathVariable Long notificationId) {
        return notificationRepository.findById(notificationId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Notification not found"));
    }

    @PostMapping
    public ResponseEntity<?> sendNotification(@RequestBody Notification notification) {
        validateNotification(notification);
        verifyAdmin(notification.getSentByAdminId());

        Notification savedNotification = notificationRepository.save(notification);
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("message", "Notification sent successfully");
        response.put("notification", savedNotification);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{notificationId}/read")
    public Notification markAsRead(@PathVariable Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Notification not found"));

        notification.setRead(true);
        return notificationRepository.save(notification);
    }

    private void validateNotification(Notification notification) {
        if (notification.getTitle() == null || notification.getTitle().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Notification title is required");
        }
        if (notification.getMessage() == null || notification.getMessage().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Notification message is required");
        }
        if (notification.getSentByAdminId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "sentByAdminId is required");
        }
        if (notification.getTargetUserId() == null &&
            (notification.getTargetRole() == null || notification.getTargetRole().isBlank())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Either targetUserId or targetRole is required");
        }
    }

    private void verifyAdmin(Long adminId) {
        Admin admin = adminRepository.findById(adminId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "sentByAdminId must belong to an admin"));
    }
}
