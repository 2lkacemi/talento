package com.talento.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.List;

@Data
public class PublicApplicationRequest {

    @NotBlank(message = "First name is required")
    private String firstName;

    @NotBlank(message = "Last name is required")
    private String lastName;

    @Email(message = "Valid email is required")
    @NotBlank(message = "Email is required")
    private String email;

    private String phone;

    private String location;

    private int experienceYears;

    private List<String> skills;

    private List<String> languages;

    private String cvUrl;

    private String notes;

    public CandidateRequest toCandidateRequest() {
        CandidateRequest request = new CandidateRequest();
        request.setFirstName(firstName);
        request.setLastName(lastName);
        request.setEmail(email);
        request.setPhone(phone);
        request.setLocation(location);
        request.setExperienceYears(experienceYears);
        request.setSkills(skills);
        request.setLanguages(languages);
        request.setCvUrl(cvUrl);
        return request;
    }
}
