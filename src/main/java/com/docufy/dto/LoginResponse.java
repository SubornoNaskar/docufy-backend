package com.docufy.dto;

public record LoginResponse(
        String accessToken,
        UserDto user
) {
}
