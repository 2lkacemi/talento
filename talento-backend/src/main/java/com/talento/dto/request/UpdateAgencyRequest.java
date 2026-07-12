package com.talento.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UpdateAgencyRequest {

    @NotBlank
    private String name;
}
