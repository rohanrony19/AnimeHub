package com.animehub.dto;

public record LoginResponse (
		String token,
        String role,
        String email
		) {
}


