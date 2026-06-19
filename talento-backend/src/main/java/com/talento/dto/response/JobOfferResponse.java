package com.talento.dto.response;

import com.talento.model.JobOffer;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
public class JobOfferResponse {
    private UUID id;
    private String title;
    private String description;
    private UUID clientId;
    private String clientName;
    private String clientCompanyName;
    private List<String> requiredSkills;
    private int requiredExperienceYears;
    private String location;
    private JobOffer.JobOfferStatus status;
    private LocalDateTime createdAt;
    private int applicationsCount;

    public static JobOfferResponse from(JobOffer offer) {
        JobOfferResponse r = new JobOfferResponse();
        r.setId(offer.getId());
        r.setTitle(offer.getTitle());
        r.setDescription(offer.getDescription());
        r.setClientId(offer.getClient().getId());
        r.setClientName(offer.getClient().getName());
        r.setClientCompanyName(offer.getClient().getCompanyName());
        r.setRequiredSkills(offer.getRequiredSkills());
        r.setRequiredExperienceYears(offer.getRequiredExperienceYears());
        r.setLocation(offer.getLocation());
        r.setStatus(offer.getStatus());
        r.setCreatedAt(offer.getCreatedAt());
        r.setApplicationsCount(offer.getApplications().size());
        return r;
    }
}
