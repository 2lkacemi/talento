package com.talento.dto.request;

import com.talento.model.Application;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ApplicationStatusRequest {

    @NotNull(message = "Status is required")
    private Application.ApplicationStatus status;

    private String notes;
}
