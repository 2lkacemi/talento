package com.talento.service;

import com.talento.dto.request.CandidateRequest;
import com.talento.dto.response.CandidateResponse;
import com.talento.dto.response.PageResponse;
import com.talento.exception.DuplicateResourceException;
import com.talento.exception.ResourceNotFoundException;
import com.talento.model.Agency;
import com.talento.model.Candidate;
import com.talento.repository.CandidateRepository;
import com.talento.security.AgencyContext;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CandidateService {

    private final CandidateRepository candidateRepository;
    private final AgencyContext agencyContext;

    @Transactional(readOnly = true)
    public List<CandidateResponse> findAll() {
        return candidateRepository.findAllByAgencyId(agencyContext.getCurrentAgencyId()).stream()
            .map(CandidateResponse::from)
            .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PageResponse<CandidateResponse> findAll(Pageable pageable) {
        return PageResponse.from(
            candidateRepository.findAllByAgencyId(agencyContext.getCurrentAgencyId(), pageable),
            CandidateResponse::from
        );
    }

    @Transactional(readOnly = true)
    public CandidateResponse findById(UUID id) {
        return CandidateResponse.from(getCandidateOrThrow(id));
    }

    @Transactional(readOnly = true)
    public List<CandidateResponse> search(String query) {
        if (!StringUtils.hasText(query)) {
            return findAll();
        }
        return candidateRepository.search(query, agencyContext.getCurrentAgencyId()).stream()
            .map(CandidateResponse::from)
            .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PageResponse<CandidateResponse> search(String query, Pageable pageable) {
        if (!StringUtils.hasText(query)) {
            return findAll(pageable);
        }
        return PageResponse.from(
            candidateRepository.searchPage(query, agencyContext.getCurrentAgencyId(), pageable),
            CandidateResponse::from
        );
    }

    @Transactional
    public CandidateResponse create(CandidateRequest request) {
        Candidate candidate = createEntity(request, agencyContext.getCurrentUser().getAgency());
        return CandidateResponse.from(candidate);
    }

    /**
     * Used by the public apply flow: creates a new candidate for the given agency, or updates
     * the existing one if a candidate with this email already exists in that agency.
     */
    @Transactional
    public Candidate createOrUpdateForAgency(CandidateRequest request, Agency agency) {
        return candidateRepository.findByEmailAndAgencyId(request.getEmail(), agency.getId())
            .map(existing -> candidateRepository.save(mapToEntity(existing, request)))
            .orElseGet(() -> createEntity(request, agency));
    }

    @Transactional
    public CandidateResponse update(UUID id, CandidateRequest request) {
        Candidate candidate = getCandidateOrThrow(id);
        UUID agencyId = agencyContext.getCurrentAgencyId();

        if (!candidate.getEmail().equals(request.getEmail())
                && candidateRepository.existsByEmailAndAgencyId(request.getEmail(), agencyId)) {
            throw new DuplicateResourceException("Candidate with email already exists: " + request.getEmail());
        }
        if (StringUtils.hasText(request.getPhone())
                && !request.getPhone().equals(candidate.getPhone())
                && candidateRepository.existsByPhoneAndAgencyId(request.getPhone(), agencyId)) {
            throw new DuplicateResourceException("Candidate with phone already exists: " + request.getPhone());
        }

        return CandidateResponse.from(candidateRepository.save(mapToEntity(candidate, request)));
    }

    @Transactional
    public void delete(UUID id) {
        UUID agencyId = agencyContext.getCurrentAgencyId();
        if (!candidateRepository.existsByIdAndAgencyId(id, agencyId)) {
            throw new ResourceNotFoundException("Candidate", "id", id);
        }
        candidateRepository.deleteById(id);
    }

    public Candidate getCandidateOrThrow(UUID id) {
        return candidateRepository.findByIdAndAgencyId(id, agencyContext.getCurrentAgencyId())
            .orElseThrow(() -> new ResourceNotFoundException("Candidate", "id", id));
    }

    private Candidate createEntity(CandidateRequest request, Agency agency) {
        if (candidateRepository.existsByEmailAndAgencyId(request.getEmail(), agency.getId())) {
            throw new DuplicateResourceException("Candidate with email already exists: " + request.getEmail());
        }
        if (StringUtils.hasText(request.getPhone()) && candidateRepository.existsByPhoneAndAgencyId(request.getPhone(), agency.getId())) {
            throw new DuplicateResourceException("Candidate with phone already exists: " + request.getPhone());
        }

        Candidate candidate = mapToEntity(new Candidate(), request);
        candidate.setAgency(agency);
        return candidateRepository.save(candidate);
    }

    private Candidate mapToEntity(Candidate candidate, CandidateRequest request) {
        candidate.setFirstName(request.getFirstName());
        candidate.setLastName(request.getLastName());
        candidate.setEmail(request.getEmail());
        candidate.setPhone(request.getPhone());
        candidate.setLocation(request.getLocation());
        candidate.setExperienceYears(request.getExperienceYears());
        candidate.setSkills(request.getSkills() != null ? request.getSkills() : List.of());
        candidate.setLanguages(request.getLanguages() != null ? request.getLanguages() : List.of());
        candidate.setCvUrl(request.getCvUrl());
        return candidate;
    }
}
