package com.talento.service;

import com.talento.dto.request.JobOfferRequest;
import com.talento.dto.response.JobOfferResponse;
import com.talento.dto.response.PageResponse;
import com.talento.exception.ResourceNotFoundException;
import com.talento.model.Client;
import com.talento.model.JobOffer;
import com.talento.repository.ClientRepository;
import com.talento.repository.JobOfferRepository;
import com.talento.security.AgencyContext;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class JobOfferService {

    private final JobOfferRepository jobOfferRepository;
    private final ClientRepository clientRepository;
    private final AgencyContext agencyContext;

    @Transactional(readOnly = true)
    public List<JobOfferResponse> findAll() {
        return jobOfferRepository.findAllByAgencyId(agencyContext.getCurrentAgencyId()).stream()
            .map(JobOfferResponse::from)
            .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PageResponse<JobOfferResponse> findAll(Pageable pageable, JobOffer.JobOfferStatus status) {
        UUID agencyId = agencyContext.getCurrentAgencyId();
        if (status != null) {
            return PageResponse.from(jobOfferRepository.findByStatusAndAgencyId(status, agencyId, pageable), JobOfferResponse::from);
        }
        return PageResponse.from(jobOfferRepository.findAllByAgencyId(agencyId, pageable), JobOfferResponse::from);
    }

    @Transactional(readOnly = true)
    public JobOfferResponse findById(UUID id) {
        return JobOfferResponse.from(getOfferOrThrow(id));
    }

    /**
     * Unscoped lookup used only by the public job-offer page — no authenticated
     * principal/agency is available there.
     */
    @Transactional(readOnly = true)
    public JobOffer findPublicById(UUID id) {
        return jobOfferRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("JobOffer", "id", id));
    }

    @Transactional(readOnly = true)
    public List<JobOfferResponse> findByClient(UUID clientId) {
        return jobOfferRepository.findByClientIdAndAgencyId(clientId, agencyContext.getCurrentAgencyId()).stream()
            .map(JobOfferResponse::from)
            .collect(Collectors.toList());
    }

    @Transactional
    public JobOfferResponse create(JobOfferRequest request) {
        UUID agencyId = agencyContext.getCurrentAgencyId();
        Client client = clientRepository.findByIdAndAgencyId(request.getClientId(), agencyId)
            .orElseThrow(() -> new ResourceNotFoundException("Client", "id", request.getClientId()));

        JobOffer offer = new JobOffer();
        offer.setAgency(agencyContext.getCurrentUser().getAgency());
        offer.setTitle(request.getTitle());
        offer.setDescription(request.getDescription());
        offer.setClient(client);
        offer.setRequiredSkills(request.getRequiredSkills() != null ? request.getRequiredSkills() : List.of());
        offer.setRequiredLanguages(request.getRequiredLanguages() != null ? request.getRequiredLanguages() : List.of());
        offer.setRequiredExperienceYears(request.getRequiredExperienceYears());
        offer.setLocation(request.getLocation());
        offer.setOpenPositions(request.getOpenPositions() > 0 ? request.getOpenPositions() : 1);
        offer.setStatus(request.getStatus() != null ? request.getStatus() : JobOffer.JobOfferStatus.OPEN);

        return JobOfferResponse.from(jobOfferRepository.save(offer));
    }

    @Transactional
    public JobOfferResponse update(UUID id, JobOfferRequest request) {
        JobOffer offer = getOfferOrThrow(id);
        Client client = clientRepository.findByIdAndAgencyId(request.getClientId(), agencyContext.getCurrentAgencyId())
            .orElseThrow(() -> new ResourceNotFoundException("Client", "id", request.getClientId()));

        offer.setTitle(request.getTitle());
        offer.setDescription(request.getDescription());
        offer.setClient(client);
        offer.setRequiredSkills(request.getRequiredSkills() != null ? request.getRequiredSkills() : List.of());
        offer.setRequiredLanguages(request.getRequiredLanguages() != null ? request.getRequiredLanguages() : List.of());
        offer.setRequiredExperienceYears(request.getRequiredExperienceYears());
        offer.setLocation(request.getLocation());
        offer.setOpenPositions(request.getOpenPositions() > 0 ? request.getOpenPositions() : 1);
        offer.setStatus(request.getStatus());

        return JobOfferResponse.from(jobOfferRepository.save(offer));
    }

    @Transactional
    public void delete(UUID id) {
        UUID agencyId = agencyContext.getCurrentAgencyId();
        if (!jobOfferRepository.existsByIdAndAgencyId(id, agencyId)) {
            throw new ResourceNotFoundException("JobOffer", "id", id);
        }
        jobOfferRepository.deleteById(id);
    }

    public JobOffer getOfferOrThrow(UUID id) {
        return jobOfferRepository.findByIdAndAgencyId(id, agencyContext.getCurrentAgencyId())
            .orElseThrow(() -> new ResourceNotFoundException("JobOffer", "id", id));
    }
}
