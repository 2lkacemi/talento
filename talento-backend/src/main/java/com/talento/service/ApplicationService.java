package com.talento.service;

import com.talento.dto.request.ApplicationRequest;
import com.talento.dto.request.ApplicationStatusRequest;
import com.talento.dto.response.ApplicationResponse;
import com.talento.dto.response.RankedCandidateResponse;
import com.talento.exception.DuplicateResourceException;
import com.talento.exception.ResourceNotFoundException;
import com.talento.model.Application;
import com.talento.model.Candidate;
import com.talento.model.JobOffer;
import com.talento.repository.ApplicationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final CandidateService candidateService;
    private final JobOfferService jobOfferService;
    private final MatchingService matchingService;

    @Transactional(readOnly = true)
    public List<ApplicationResponse> findByJobOffer(UUID jobOfferId) {
        return applicationRepository.findByJobOfferId(jobOfferId).stream()
            .map(ApplicationResponse::from)
            .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ApplicationResponse> findByCandidate(UUID candidateId) {
        return applicationRepository.findByCandidateId(candidateId).stream()
            .map(ApplicationResponse::from)
            .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ApplicationResponse findById(UUID id) {
        return ApplicationResponse.from(getApplicationOrThrow(id));
    }

    @Transactional
    public ApplicationResponse create(ApplicationRequest request) {
        if (applicationRepository.existsByCandidateIdAndJobOfferId(request.getCandidateId(), request.getJobOfferId())) {
            throw new DuplicateResourceException("Candidate is already applied to this job offer");
        }

        Candidate candidate = candidateService.getCandidateOrThrow(request.getCandidateId());
        JobOffer offer = jobOfferService.getOfferOrThrow(request.getJobOfferId());

        int score = matchingService.computeScore(candidate, offer);

        Application application = new Application();
        application.setCandidate(candidate);
        application.setJobOffer(offer);
        application.setStatus(Application.ApplicationStatus.NEW);
        application.setScore(score);
        application.setNotes(request.getNotes());

        return ApplicationResponse.from(applicationRepository.save(application));
    }

    @Transactional
    public ApplicationResponse updateStatus(UUID id, ApplicationStatusRequest request) {
        Application application = getApplicationOrThrow(id);
        application.setStatus(request.getStatus());
        if (request.getNotes() != null) {
            application.setNotes(request.getNotes());
        }
        return ApplicationResponse.from(applicationRepository.save(application));
    }

    @Transactional
    public void delete(UUID id) {
        if (!applicationRepository.existsById(id)) {
            throw new ResourceNotFoundException("Application", "id", id);
        }
        applicationRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public List<RankedCandidateResponse> getRankedCandidates(UUID jobOfferId) {
        JobOffer offer = jobOfferService.getOfferOrThrow(jobOfferId);
        return matchingService.rankCandidatesForOffer(offer);
    }

    private Application getApplicationOrThrow(UUID id) {
        return applicationRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Application", "id", id));
    }
}
