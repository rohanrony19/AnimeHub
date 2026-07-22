package com.animehub.dto;

import com.animehub.entity.User;

public record UserResponse(

        Long id,
        String username,
        String email,
        String role,
        String profileImage,
        String phone,
        String gender,
        String address,
        String dob

) {
    public static UserResponse from(User user) {
        return new UserResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getRole(),
                user.getProfileImage(),
                user.getPhone(),
                user.getGender(),
                user.getAddress(),
                user.getDob()
        );
    }
}