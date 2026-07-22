package com.animehub.controller;

import java.io.IOException; 
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.animehub.entity.User;
import com.animehub.repository.UserRepository;
import com.animehub.service.S3StorageService;
import com.animehub.service.UserService;
import com.animehub.config.JwtUtil;
import com.animehub.dto.ChangePasswordRequest;
import com.animehub.dto.UpdateProfileRequest;
import com.animehub.dto.UserResponse;
import com.animehub.exception.BadRequestException;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/users")
public class UserController {

	private final UserRepository userRepository;
	private final S3StorageService s3Service;
	private final JwtUtil jwtUtil;
	private final UserService userService;

	public UserController(
	        UserRepository userRepository,
	        S3StorageService s3Service,
	        JwtUtil jwtUtil,
	        UserService userService) {

	    this.userRepository = userRepository;
	    this.s3Service = s3Service;
	    this.jwtUtil = jwtUtil;
	    this.userService = userService;
	}

	@GetMapping
	@PreAuthorize("hasRole('ADMIN')")
	public List<UserResponse> getAllUsers() {
	    return userRepository.findAll()
	            .stream()
	            .map(UserResponse::from)
	            .toList();
	}

	@PostMapping("/upload-profile")
	public String uploadProfileImage(
	        @RequestHeader("Authorization") String authHeader,
	        @RequestParam("file") MultipartFile file) throws IOException {

	    String token = authHeader.substring(7);

	    String email = jwtUtil.extractUsername(token);

	    User user = userRepository.findByEmail(email)
	            .orElseThrow(() -> new BadRequestException("User not found"));

	    String imageUrl = s3Service.uploadImage(
	            file,
	            "profile-images",
	            user.getUsername()
	    );

	    user.setProfileImage(imageUrl);

	    userRepository.save(user);

	    return imageUrl;
	}

	@GetMapping("/me")
	public UserResponse getCurrentUser(
	        @RequestHeader("Authorization") String authHeader) {

	    String token = authHeader.substring(7);

	    String email = jwtUtil.extractUsername(token);

	    User user = userRepository.findByEmail(email)
	            .orElseThrow(() -> new BadRequestException("User not found"));

	    return UserResponse.from(user);
	}

	@PutMapping("/profile")
	public ResponseEntity<UserResponse> updateProfile(
	        @Valid @RequestBody UpdateProfileRequest request,
	        Authentication authentication) {

	    User user = userService.updateProfile(
	            authentication.getName(),
	            request);

	    return ResponseEntity.ok(UserResponse.from(user));
	}

	@PostMapping("/change-password")
    public ResponseEntity<String> changePassword(
            @Valid @RequestBody ChangePasswordRequest request,
            Authentication authentication) {

        userService.changePassword(
                authentication.getName(),
                request);

        return ResponseEntity.ok("Password changed successfully");
    }

	@DeleteMapping("/{id}")
	@PreAuthorize("hasRole('ADMIN')")
	public ResponseEntity<String> deleteUser(@PathVariable Long id) {
		
		
		userService.deleteUser(id);

	    return ResponseEntity.ok("User deleted successfully");
	}
}