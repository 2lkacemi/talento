package com.talento.dto.response;

import com.talento.model.User;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class UserResponse {
    private UUID id;
    private String email;
    private String fullName;
    private String role;
    private boolean enabled;
    private LocalDateTime createdAt;

    public static UserResponse from(User user) {
        UserResponse r = new UserResponse();
        r.setId(user.getId());
        r.setEmail(user.getEmail());
        r.setFullName(user.getFullName());
        r.setRole(user.getRole().name());
        r.setEnabled(user.isEnabled());
        r.setCreatedAt(user.getCreatedAt());
        return r;
    }
}
