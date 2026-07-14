package com.talento.dto.request;

import com.talento.model.JobOffer;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
public class JobOfferRequest {

    @NotBlank(message = "Title is required")
    private String title;

    private String description;

    @NotNull(message = "Client ID is required")
    private UUID clientId;

    private List<String> requiredSkills;

    private List<String> requiredLanguages;

    private int requiredExperienceYears;

    private String location;

    private Double salary;

    private int openPositions = 1;

    private JobOffer.JobOfferStatus status = JobOffer.JobOfferStatus.OPEN;
}
