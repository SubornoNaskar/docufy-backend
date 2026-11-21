package com.docufy.dto;



public record RegisterUserRequest(
        String username,
        String email,
        String password
) {
}
