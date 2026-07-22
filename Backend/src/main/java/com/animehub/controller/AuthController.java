package com.animehub.controller;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.animehub.config.JwtUtil;
import com.animehub.dto.LoginRequest;
import com.animehub.dto.LoginResponse;
import com.animehub.dto.RegisterRequest;
import com.animehub.dto.RegisterResponse;
import com.animehub.entity.User;
import com.animehub.exception.BadRequestException;
import com.animehub.repository.UserRepository;
import com.animehub.service.UserService;

import java.time.LocalDateTime;
import java.util.Random;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;

import com.animehub.dto.ForgotPasswordRequest;
import com.animehub.dto.ForgotPasswordResponse;
import com.animehub.dto.VerifyOtpRequest;
import com.animehub.dto.VerifyOtpResponse;
import com.animehub.dto.ResetPasswordRequest;
import com.animehub.dto.ResetPasswordResponse;
import com.animehub.entity.Notification;
import com.animehub.repository.NotificationRepository;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

	private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final JavaMailSender mailSender;
    private final NotificationRepository notificationRepository;

    public AuthController(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtUtil jwtUtil,
            JavaMailSender mailSender,
            UserService userService,
            NotificationRepository notificationRepository) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.mailSender = mailSender;
        this.notificationRepository = notificationRepository;
    }

    @PostMapping("/register")
    public RegisterResponse  register(@Valid @RequestBody RegisterRequest request) {

        if (userRepository.findByEmail(request.email()).isPresent()) {
            throw new BadRequestException("An account with this email already exists");
        }

        User user = new User();
        user.setUsername(request.username());
        user.setEmail(request.email());
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setRole("ROLE_USER");
        user.setOtpAttempts(0);

        User savedUser = userRepository.save(user);

        Notification notification = new Notification();

        notification.setUser(savedUser);
        notification.setTitle("Welcome to AnimeHub 🎉");
        notification.setMessage("Your account has been created successfully.");
        notification.setReadStatus(false);

        notificationRepository.save(notification);

        return new RegisterResponse("User registered successfully",user.getEmail());
    }

    @PostMapping("/login")
    public LoginResponse login(@Valid @RequestBody LoginRequest loginRequest) {

        User dbUser = userRepository.findByEmail(loginRequest.getEmail())
                .orElseThrow(() -> new BadRequestException("Invalid email or password"));

        if (!passwordEncoder.matches(
                loginRequest.getPassword(),
                dbUser.getPassword()
        )) {

            throw new BadRequestException("Invalid email or password");
        }

        String token = jwtUtil.generateToken(dbUser.getEmail());

        return new LoginResponse(
                token,
                dbUser.getRole(),
                dbUser.getEmail()
        );
    }

    @PostMapping("/forgot-password")
    public ForgotPasswordResponse forgotPassword(
            @Valid @RequestBody ForgotPasswordRequest request) {

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadRequestException("No account found for this email"));

        String otp = String.valueOf(
                100000 + new Random().nextInt(900000));

        user.setOtp(otp);
        user.setOtpExpiry(LocalDateTime.now().plusMinutes(5));
        user.setOtpAttempts(0);

        userRepository.save(user);

        SimpleMailMessage message = new SimpleMailMessage();

        message.setTo(user.getEmail());
        message.setSubject("AnimeHub Password Reset OTP");
        message.setText("Your OTP is: " + otp);

        mailSender.send(message);

        return new ForgotPasswordResponse("OTP sent successfully",user.getEmail());
    }

    @PostMapping("/verify-otp")
    public VerifyOtpResponse verifyOtp(
            @Valid @RequestBody VerifyOtpRequest request) {

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadRequestException("No account found for this email"));

        if (user.getOtpAttempts() >= 3) {
            throw new BadRequestException("Maximum attempts exceeded. Request new OTP.");
        }

        if (user.getOtpExpiry() == null || LocalDateTime.now().isAfter(user.getOtpExpiry())) {
            throw new BadRequestException("OTP expired");
        }

        if (!user.getOtp().equals(request.getOtp())) {

            user.setOtpAttempts(user.getOtpAttempts() + 1);
            userRepository.save(user);

            throw new BadRequestException("Invalid OTP");
        }

        user.setOtpAttempts(0);
        userRepository.save(user);

        return new VerifyOtpResponse("OTP verified successfully");
    }

    @PostMapping("/reset-password")
    public ResetPasswordResponse resetPassword(
            @Valid @RequestBody ResetPasswordRequest request) {

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadRequestException("No account found for this email"));

        if (passwordEncoder.matches(
                request.getNewPassword(),
                user.getPassword())) {

            throw new BadRequestException(
                "New password cannot be the same as the current password");
        }

        user.setPassword(
                passwordEncoder.encode(request.getNewPassword()));

        user.setOtp(null);
        user.setOtpExpiry(null);
        user.setOtpAttempts(0);

        userRepository.save(user);

        return new ResetPasswordResponse("Password reset successful");
    }

}