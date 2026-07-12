package com.talento.service;

import com.talento.dto.request.ApplicationRequest;
import com.talento.dto.request.ApplicationStatusRequest;
import com.talento.dto.request.PublicApplicationRequest;
import com.talento.dto.response.ApplicationResponse;
import com.talento.dto.response.ApplicationStatusHistoryResponse;
import com.talento.dto.response.RankedCandidateResponse;
import com.talento.exception.DuplicateResourceException;
import com.talento.exception.ResourceNotFoundException;
import com.talento.model.Application;
import com.talento.model.ApplicationStatusHistory;
import com.talento.model.Candidate;
import com.talento.model.JobOffer;
import com.talento.repository.ApplicationRepository;
import com.talento.repository.ApplicationStatusHistoryRepository;
import com.talento.security.AgencyContext;
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
    private final ApplicationStatusHistoryRepository statusHistoryRepository;
    private final CandidateService candidateService;
    private final JobOfferService jobOfferService;
    private final MatchingService matchingService;
    private final AgencyContext agencyContext;

    @Transactional(readOnly = true)
    public List<ApplicationResponse> findByJobOffer(UUID jobOfferId) {
        return applicationRepository.findByJobOfferIdAndAgencyId(jobOfferId, agencyContext.getCurrentAgencyId()).stream()
            .map(ApplicationResponse::from)
            .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ApplicationResponse> findByCandidate(UUID candidateId) {
        return applicationRepository.findByCandidateIdAndAgencyId(candidateId, agencyContext.getCurrentAgencyId()).stream()
            .map(ApplicationResponse::from)
            .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ApplicationResponse findById(UUID id) {
        Application application = getApplicationOrThrow(id);
        ApplicationResponse response = ApplicationResponse.from(application);
        response.setStatusHistory(
            statusHistoryRepository.findByApplicationIdAndAgencyIdOrderByChangedAtAsc(id, agencyContext.getCurrentAgencyId()).stream()
                .map(ApplicationStatusHistoryResponse::from)
                .collect(Collectors.toList())
        );
        return response;
    }

    @Transactional(readOnly = true)
    public List<ApplicationStatusHistoryResponse> getHistory(UUID applicationId) {
        getApplicationOrThrow(applicationId);
        return statusHistoryRepository.findByApplicationIdAndAgencyIdOrderByChangedAtAsc(applicationId, agencyContext.getCurrentAgencyId()).stream()
            .map(ApplicationStatusHistoryResponse::from)
            .collect(Collectors.toList());
    }

    @Transactional
    public ApplicationResponse create(ApplicationRequest request) {
        UUID agencyId = agencyContext.getCurrentAgencyId();
        if (applicationRepository.existsByCandidateIdAndJobOfferIdAndAgencyId(request.getCandidateId(), request.getJobOfferId(), agencyId)) {
            throw new DuplicateResourceException("Candidate is already applied to this job offer");
        }

        Candidate candidate = candidateService.getCandidateOrThrow(request.getCandidateId());
        JobOffer offer = jobOfferService.getOfferOrThrow(request.getJobOfferId());

        int score = matchingService.computeScore(candidate, offer);

        Application application = new Application();
        application.setAgency(agencyContext.getCurrentUser().getAgency());
        application.setCandidate(candidate);
        application.setJobOffer(offer);
        application.setStatus(Application.ApplicationStatus.NEW);
        application.setScore(score);
        application.setNotes(request.getNotes());

        return ApplicationResponse.from(applicationRepository.save(application));
    }

    /**
     * Public, unauthenticated apply flow: resolves the agency from the (public) job offer,
     * creates/updates the candidate within that agency, and creates the application — all
     * atomically, so a failure never leaves an orphan candidate behind.
     */
    @Transactional
    public ApplicationResponse applyPublic(UUID jobOfferId, PublicApplicationRequest request) {
        JobOffer offer = jobOfferService.findPublicById(jobOfferId);
        if (offer.getStatus() == JobOffer.JobOfferStatus.CLOSED) {
            throw new IllegalArgumentException("This job offer is no longer accepting applications");
        }

        Candidate candidate = candidateService.createOrUpdateForAgency(request.toCandidateRequest(), offer.getAgency());

        if (applicationRepository.existsByCandidateIdAndJobOfferIdAndAgencyId(
                candidate.getId(), offer.getId(), offer.getAgency().getId())) {
            throw new DuplicateResourceException("Candidate is already applied to this job offer");
        }

        int score = matchingService.computeScore(candidate, offer);

        Application application = new Application();
        application.setAgency(offer.getAgency());
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
        Application.ApplicationStatus oldStatus = application.getStatus();

        application.setStatus(request.getStatus());
        if (request.getNotes() != null) {
            application.setNotes(request.getNotes());
        }
        applicationRepository.save(application);

        ApplicationStatusHistory history = new ApplicationStatusHistory();
        history.setAgency(application.getAgency());
        history.setApplication(application);
        history.setFromStatus(oldStatus);
        history.setToStatus(request.getStatus());
        history.setNotes(request.getNotes());
        statusHistoryRepository.save(history);

        return ApplicationResponse.from(application);
    }

    @Transactional
    public ApplicationResponse updateNotes(UUID id, String notes) {
        Application application = getApplicationOrThrow(id);
        application.setNotes(notes);
        return ApplicationResponse.from(applicationRepository.save(application));
    }

    @Transactional
    public void delete(UUID id) {
        getApplicationOrThrow(id);
        applicationRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public List<RankedCandidateResponse> getRankedCandidates(UUID jobOfferId) {
        JobOffer offer = jobOfferService.getOfferOrThrow(jobOfferId);
        return matchingService.rankCandidatesForOffer(offer);
    }

    private Application getApplicationOrThrow(UUID id) {
        return applicationRepository.findByIdAndAgencyId(id, agencyContext.getCurrentAgencyId())
            .orElseThrow(() -> new ResourceNotFoundException("Application", "id", id));
    }
}
