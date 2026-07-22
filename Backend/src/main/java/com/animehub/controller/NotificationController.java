package com.animehub.controller;

import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.animehub.dto.NotificationRequest;
import com.animehub.dto.NotificationResponse;
import com.animehub.exception.BadRequestException;
import com.animehub.service.NotificationService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService service;

    public NotificationController(NotificationService service) {
        this.service = service;
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public String sendNotification(
            @Valid @RequestBody NotificationRequest request) {

        if ("all".equalsIgnoreCase(request.sendType())) {

            service.sendToAllUsers(request);

            return "Notification sent to all users";
        }

        if ("single".equalsIgnoreCase(request.sendType())) {

            service.sendToUser(
                    request.userId(),
                    request
            );

            return "Notification sent successfully";
        }

        throw new BadRequestException("Invalid notification type");
    }

    @GetMapping
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public List<NotificationResponse> getMyNotifications() {

        return service.getMyNotifications();
    }

    @PutMapping("/{id}/read")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public String markAsRead(@PathVariable Long id) {

        service.markAsRead(id);

        return "Notification marked as read";
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public String deleteNotification(@PathVariable Long id) {

        service.delete(id);

        return "Notification deleted successfully";
    }

    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public List<NotificationResponse> getAllNotifications() {

        return service.getAllNotifications();
    }

}