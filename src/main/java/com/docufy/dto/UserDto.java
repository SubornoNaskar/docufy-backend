package com.docufy.dto;


import com.docufy.entity.Role;

public record UserDto(
        Long id,
        String username,
        String email,
        Role role
) {
}
