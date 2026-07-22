package com.animehub.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import com.animehub.dto.ChangePasswordRequest;
import com.animehub.dto.UpdateProfileRequest;
import com.animehub.entity.User;
import com.animehub.exception.BadRequestException;
import com.animehub.repository.NotificationRepository;
import com.animehub.repository.UserRepository;

import jakarta.transaction.Transactional;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final NotificationRepository notificationRepository;

    public UserService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            NotificationRepository notificationRepository) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.notificationRepository = notificationRepository;
    }

    public void changePassword(
            String username,
            ChangePasswordRequest request) {

        User user = userRepository
                .findByEmail(username)
                .orElseThrow(() -> new BadRequestException("User not found"));

        if (!passwordEncoder.matches(
                request.currentPassword(),
                user.getPassword())) {

            throw new BadRequestException("Current password is incorrect");
        }

        user.setPassword(
                passwordEncoder.encode(request.newPassword()));

        userRepository.save(user);
    }

    public User updateProfile(
            String username,
            UpdateProfileRequest request) {

        User user = userRepository
                .findByEmail(username)
                .orElseThrow(() -> new BadRequestException("User not found"));

        user.setUsername(request.username());
        user.setPhone(request.phone());
        user.setGender(request.gender());
        user.setAddress(request.address());
        user.setDob(request.dob());

        return userRepository.save(user);
    }

    public User getCurrentUser() {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        String email = authentication.getName();

        return userRepository.findByEmail(email)
                .orElseThrow(() -> new BadRequestException("User not found"));
    }
    
    @Transactional
    public void deleteUser(Long id) {

        notificationRepository.deleteByUserId(id);

        userRepository.deleteById(id);
    }
}