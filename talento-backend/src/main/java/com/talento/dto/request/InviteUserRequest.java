package com.talento.dto.request;

import com.talento.model.User;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class InviteUserRequest {

    @Email
    @NotBlank
    private String email;

    @NotNull
    private User.Role role;
}
