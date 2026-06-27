package com.talento.dto.response;

import lombok.Data;

import java.util.List;

@Data
public class SearchResponse {
    private List<CandidateResponse> candidates;
    private List<ClientResponse> clients;
    private List<JobOfferResponse> jobOffers;
}
