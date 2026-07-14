package com.talento.service;

import com.talento.dto.response.DashboardStatsResponse;
import com.talento.model.Application;
import com.talento.model.JobOffer;
import com.talento.repository.ApplicationRepository;
import com.talento.repository.CandidateRepository;
import com.talento.repository.ClientRepository;
import com.talento.repository.JobOfferRepository;
import com.talento.security.AgencyContext;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final CandidateRepository candidateRepository;
    private final JobOfferRepository jobOfferRepository;
    private final ClientRepository clientRepository;
    private final ApplicationRepository applicationRepository;
    private final AgencyContext agencyContext;

    @Transactional(readOnly = true)
    public DashboardStatsResponse getStats() {
        UUID agencyId = agencyContext.getCurrentAgencyId();

        long totalCandidates = candidateRepository.countByAgencyId(agencyId);
        long totalJobOffers = jobOfferRepository.countByAgencyId(agencyId);
        long openJobOffers = jobOfferRepository.countByStatusAndAgencyId(JobOffer.JobOfferStatus.OPEN, agencyId);
        long totalClients = clientRepository.countByAgencyId(agencyId);
        long activeApplications = applicationRepository.countByAgencyId(agencyId)
            - applicationRepository.countByStatusAndAgencyId(Application.ApplicationStatus.HIRED, agencyId)
            - applicationRepository.countByStatusAndAgencyId(Application.ApplicationStatus.REJECTED, agencyId);
        long hiredThisMonth = applicationRepository.countByStatusAndAgencyId(Application.ApplicationStatus.HIRED, agencyId);

        return new DashboardStatsResponse(totalCandidates, totalJobOffers, openJobOffers,
            totalClients, activeApplications, hiredThisMonth);
    }
}
