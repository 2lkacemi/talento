package com.talento.service;

import com.talento.dto.response.CandidateResponse;
import com.talento.dto.response.RankedCandidateResponse;
import com.talento.model.Candidate;
import com.talento.model.JobOffer;
import com.talento.repository.ApplicationRepository;
import com.talento.repository.CandidateRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MatchingService {

    private final CandidateRepository candidateRepository;
    private final ApplicationRepository applicationRepository;

    @Transactional(readOnly = true)
    public List<RankedCandidateResponse> rankCandidatesForOffer(JobOffer offer) {
        List<Candidate> allCandidates = candidateRepository.findAll();
        Set<UUID> appliedCandidateIds = applicationRepository.findByJobOfferId(offer.getId())
            .stream()
            .map(a -> a.getCandidate().getId())
            .collect(Collectors.toSet());

        List<RankedCandidateResponse> ranked = new ArrayList<>();
        for (Candidate candidate : allCandidates) {
            int score = computeScore(candidate, offer);
            boolean alreadyApplied = appliedCandidateIds.contains(candidate.getId());
            ranked.add(new RankedCandidateResponse(CandidateResponse.from(candidate), score, alreadyApplied));
        }

        ranked.sort(Comparator.comparingInt(RankedCandidateResponse::getMatchScore).reversed());
        return ranked;
    }

    public int computeScore(Candidate candidate, JobOffer offer) {
        int score = 0;

        // +3 per matching skill
        if (offer.getRequiredSkills() != null && candidate.getSkills() != null) {
            Set<String> candidateSkills = candidate.getSkills().stream()
                .map(String::toLowerCase)
                .collect(Collectors.toSet());
            for (String required : offer.getRequiredSkills()) {
                if (candidateSkills.contains(required.toLowerCase())) {
                    score += 3;
                }
            }
        }

        // +2 if candidate experience >= required
        if (candidate.getExperienceYears() >= offer.getRequiredExperienceYears()) {
            score += 2;
        }

        // +2 if location matches exactly (case-insensitive)
        if (offer.getLocation() != null && candidate.getLocation() != null
                && offer.getLocation().equalsIgnoreCase(candidate.getLocation())) {
            score += 2;
        }

        // +2 per required language the candidate speaks
        if (offer.getRequiredLanguages() != null && candidate.getLanguages() != null) {
            Set<String> candidateLangs = candidate.getLanguages().stream()
                .map(String::toLowerCase)
                .collect(Collectors.toSet());
            for (String required : offer.getRequiredLanguages()) {
                if (candidateLangs.contains(required.toLowerCase())) {
                    score += 2;
                }
            }
        }

        return score;
    }
}
