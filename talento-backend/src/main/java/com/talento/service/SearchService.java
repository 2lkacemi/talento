package com.talento.service;

import com.talento.dto.response.CandidateResponse;
import com.talento.dto.response.ClientResponse;
import com.talento.dto.response.JobOfferResponse;
import com.talento.dto.response.SearchResponse;
import com.talento.repository.CandidateRepository;
import com.talento.repository.ClientRepository;
import com.talento.repository.JobOfferRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SearchService {

    private final CandidateRepository candidateRepository;
    private final ClientRepository clientRepository;
    private final JobOfferRepository jobOfferRepository;

    @Transactional(readOnly = true)
    public SearchResponse search(String query) {
        SearchResponse response = new SearchResponse();
        if (!StringUtils.hasText(query) || query.trim().length() < 2) {
            response.setCandidates(List.of());
            response.setClients(List.of());
            response.setJobOffers(List.of());
            return response;
        }

        response.setCandidates(
            candidateRepository.search(query).stream()
                .limit(5)
                .map(CandidateResponse::from)
                .collect(Collectors.toList())
        );
        response.setClients(
            clientRepository.search(query).stream()
                .limit(5)
                .map(ClientResponse::from)
                .collect(Collectors.toList())
        );
        response.setJobOffers(
            jobOfferRepository.search(query).stream()
                .limit(5)
                .map(JobOfferResponse::from)
                .collect(Collectors.toList())
        );
        return response;
    }
}
