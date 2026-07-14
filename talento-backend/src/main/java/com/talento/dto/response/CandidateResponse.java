package com.talento.dto.response;

import com.talento.model.Candidate;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
public class CandidateResponse {
    private UUID id;
    private String firstName;
    private String lastName;
    private String fullName;
    private String email;
    private String phone;
    private String location;
    private int experienceYears;
    private List<String> skills;
    private List<String> languages;
    private String cvUrl;
    private LocalDateTime createdAt;
    private int applicationsCount;

    public static CandidateResponse from(Candidate candidate) {
        CandidateResponse r = new CandidateResponse();
        r.setId(candidate.getId());
        r.setFirstName(candidate.getFirstName());
        r.setLastName(candidate.getLastName());
        r.setFullName(candidate.getFirstName() + " " + candidate.getLastName());
        r.setEmail(candidate.getEmail());
        r.setPhone(candidate.getPhone());
        r.setLocation(candidate.getLocation());
        r.setExperienceYears(candidate.getExperienceYears());
        r.setSkills(candidate.getSkills());
        r.setLanguages(candidate.getLanguages());
        r.setCvUrl(candidate.getCvUrl());
        r.setCreatedAt(candidate.getCreatedAt());
        r.setApplicationsCount(candidate.getApplications().size());
        return r;
    }
}
