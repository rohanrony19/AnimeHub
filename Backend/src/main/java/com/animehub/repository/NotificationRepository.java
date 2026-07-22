package com.animehub.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.animehub.entity.Notification;

@Repository
public interface NotificationRepository
        extends JpaRepository<Notification, Long> {

    List<Notification> findByUserIdOrderByCreatedAtDesc(Long userId);
    
    void deleteByUserId(Long userId);
    
    @Query("""
    		SELECT n
    		FROM Notification n
    		WHERE n.id IN (
    		    SELECT MIN(n2.id)
    		    FROM Notification n2
    		    GROUP BY n2.title, n2.message, n2.createdAt
    		)
    		ORDER BY n.createdAt DESC
    		""")
    		List<Notification> findNotificationHistory();
}