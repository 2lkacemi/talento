package com.talento.service;

import com.talento.dto.request.CandidateRequest;
import com.talento.dto.response.CandidateResponse;
import com.talento.dto.response.PageResponse;
import com.talento.exception.DuplicateResourceException;
import com.talento.exception.ResourceNotFoundException;
import com.talento.model.Candidate;
import com.talento.repository.CandidateRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CandidateService {

    private final CandidateRepository candidateRepository;

    @Transactional(readOnly = true)
    public List<CandidateResponse> findAll() {
        return candidateRepository.findAll().stream()
            .map(CandidateResponse::from)
            .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PageResponse<CandidateResponse> findAll(Pageable pageable) {
        return PageResponse.from(candidateRepository.findAll(pageable), CandidateResponse::from);
    }

    @Transactional(readOnly = true)
    public CandidateResponse findById(UUID id) {
        return CandidateResponse.from(getCandidateOrThrow(id));
    }

    @Transactional(readOnly = true)
    public Optional<Candidate> findByEmail(String email) {
        return candidateRepository.findByEmail(email);
    }

    @Transactional(readOnly = true)
    public List<CandidateResponse> search(String query) {
        if (!StringUtils.hasText(query)) {
            return findAll();
        }
        return candidateRepository.search(query).stream()
            .map(CandidateResponse::from)
            .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PageResponse<CandidateResponse> search(String query, Pageable pageable) {
        if (!StringUtils.hasText(query)) {
            return findAll(pageable);
        }
        return PageResponse.from(candidateRepository.searchPage(query, pageable), CandidateResponse::from);
    }

    @Transactional
    public CandidateResponse create(CandidateRequest request) {
        if (candidateRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Candidate with email already exists: " + request.getEmail());
        }
        if (StringUtils.hasText(request.getPhone()) && candidateRepository.existsByPhone(request.getPhone())) {
            throw new DuplicateResourceException("Candidate with phone already exists: " + request.getPhone());
        }

        return CandidateResponse.from(candidateRepository.save(mapToEntity(new Candidate(), request)));
    }

    @Transactional
    public CandidateResponse createOrUpdate(CandidateRequest request) {
        return candidateRepository.findByEmail(request.getEmail())
            .map(existing -> CandidateResponse.from(candidateRepository.save(mapToEntity(existing, request))))
            .orElseGet(() -> create(request));
    }

    @Transactional
    public CandidateResponse update(UUID id, CandidateRequest request) {
        Candidate candidate = getCandidateOrThrow(id);

        if (!candidate.getEmail().equals(request.getEmail()) && candidateRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Candidate with email already exists: " + request.getEmail());
        }
        if (StringUtils.hasText(request.getPhone())
                && !request.getPhone().equals(candidate.getPhone())
                && candidateRepository.existsByPhone(request.getPhone())) {
            throw new DuplicateResourceException("Candidate with phone already exists: " + request.getPhone());
        }

        return CandidateResponse.from(candidateRepository.save(mapToEntity(candidate, request)));
    }

    @Transactional
    public void delete(UUID id) {
        if (!candidateRepository.existsById(id)) {
            throw new ResourceNotFoundException("Candidate", "id", id);
        }
        candidateRepository.deleteById(id);
    }

    public Candidate getCandidateOrThrow(UUID id) {
        return candidateRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Candidate", "id", id));
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
