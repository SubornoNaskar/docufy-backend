package com.docufy.dto;

public record LoginRequest(
        String username,
        String password
) {
}
