package com.talento.service;

import com.talento.dto.response.DashboardStatsResponse;
import com.talento.model.Application;
import com.talento.model.JobOffer;
import com.talento.repository.ApplicationRepository;
import com.talento.repository.CandidateRepository;
import com.talento.repository.ClientRepository;
import com.talento.repository.JobOfferRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final CandidateRepository candidateRepository;
    private final JobOfferRepository jobOfferRepository;
    private final ClientRepository clientRepository;
    private final ApplicationRepository applicationRepository;

    @Transactional(readOnly = true)
    public DashboardStatsResponse getStats() {
        long totalCandidates = candidateRepository.count();
        long totalJobOffers = jobOfferRepository.count();
        long openJobOffers = jobOfferRepository.findByStatus(JobOffer.JobOfferStatus.OPEN).size();
        long totalClients = clientRepository.count();
        long activeApplications = applicationRepository.count()
            - applicationRepository.countByStatus(Application.ApplicationStatus.HIRED)
            - applicationRepository.countByStatus(Application.ApplicationStatus.REJECTED);
        long hiredThisMonth = applicationRepository.countByStatus(Application.ApplicationStatus.HIRED);

        return new DashboardStatsResponse(totalCandidates, totalJobOffers, openJobOffers,
            totalClients, activeApplications, hiredThisMonth);
    }
}
