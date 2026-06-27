package com.talento.dto.response;

import com.talento.model.Application;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
public class ApplicationResponse {
    private UUID id;
    private UUID candidateId;
    private String candidateName;
    private String candidateEmail;
    private UUID jobOfferId;
    private String jobOfferTitle;
    private String clientName;
    private Application.ApplicationStatus status;
    private int score;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<ApplicationStatusHistoryResponse> statusHistory;

    public static ApplicationResponse from(Application application) {
        ApplicationResponse r = new ApplicationResponse();
        r.setId(application.getId());
        r.setCandidateId(application.getCandidate().getId());
        r.setCandidateName(application.getCandidate().getFirstName() + " " + application.getCandidate().getLastName());
        r.setCandidateEmail(application.getCandidate().getEmail());
        r.setJobOfferId(application.getJobOffer().getId());
        r.setJobOfferTitle(application.getJobOffer().getTitle());
        r.setClientName(application.getJobOffer().getClient().getName());
        r.setStatus(application.getStatus());
        r.setScore(application.getScore());
        r.setNotes(application.getNotes());
        r.setCreatedAt(application.getCreatedAt());
        r.setUpdatedAt(application.getUpdatedAt());
        return r;
    }
}
