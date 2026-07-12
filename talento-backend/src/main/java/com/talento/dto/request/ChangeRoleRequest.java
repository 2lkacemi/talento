package com.talento.dto.request;

import com.talento.model.User;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ChangeRoleRequest {

    @NotNull
    private User.Role role;
}
