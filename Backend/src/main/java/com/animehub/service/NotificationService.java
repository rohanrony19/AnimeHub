package com.animehub.service;

import java.util.List; 

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.animehub.dto.NotificationRequest;
import com.animehub.dto.NotificationResponse;
import com.animehub.entity.Notification;
import com.animehub.entity.User;
import com.animehub.repository.NotificationRepository;
import com.animehub.repository.UserRepository;

@Service
@Transactional
public class NotificationService {

	private final NotificationRepository repository;
	private final UserRepository userRepository;

	public NotificationService(
	        NotificationRepository repository,
	        UserRepository userRepository) {

	    this.repository = repository;
	    this.userRepository = userRepository;
	}

    private NotificationResponse map(Notification notification) {

        return new NotificationResponse(
                notification.getId(),
                notification.getTitle(),
                notification.getMessage(),
                notification.isReadStatus(),
                notification.getCreatedAt()
        );
    }

    public NotificationResponse create(NotificationRequest request) {

    	Authentication authentication =
    	        SecurityContextHolder.getContext().getAuthentication();

    	String username = authentication.getName();

    	User user = userRepository
    	        .findByEmail(username)
    	        .orElseThrow();

        Notification notification = new Notification();

        notification.setTitle(request.title());
        notification.setMessage(request.message());
        notification.setUser(user);

        return map(repository.save(notification));
    }

    public List<NotificationResponse> getMyNotifications() {

    	Authentication authentication =
    	        SecurityContextHolder.getContext().getAuthentication();

    	String username = authentication.getName();

    	User user = userRepository
    	        .findByEmail(username)
    	        .orElseThrow();

        return repository
                .findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(this::map)
                .toList();
    }

    public void markAsRead(Long id) {

        Notification notification =
                repository.findById(id)
                .orElseThrow();

        notification.setReadStatus(true);

        repository.save(notification);
    }
    
    public void sendToAllUsers(NotificationRequest request) {

        List<User> users = userRepository.findAll();

        for (User user : users) {

            Notification notification = new Notification();

            notification.setUser(user);
            notification.setTitle(request.title());
            notification.setMessage(request.message());
            notification.setReadStatus(false);

            repository.save(notification);
        }
    }
    
    public void sendToUser(Long userId, NotificationRequest request) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Notification notification = new Notification();

        notification.setUser(user);
        notification.setTitle(request.title());
        notification.setMessage(request.message());
        notification.setReadStatus(false);

        repository.save(notification);
    }

    public void delete(Long id) {

        repository.deleteById(id);
    }
    
    public List<NotificationResponse> getAllNotifications() {

        return repository.findNotificationHistory()
                .stream()
                .map(this::map)
                .toList();
    }
}