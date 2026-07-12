package com.talento.service;

import com.talento.dto.request.UpdateAgencyRequest;
import com.talento.dto.response.AgencyResponse;
import com.talento.exception.ResourceNotFoundException;
import com.talento.model.Agency;
import com.talento.repository.AgencyRepository;
import com.talento.security.AgencyContext;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AgencyService {

    private final AgencyRepository agencyRepository;
    private final AgencyContext agencyContext;

    @Transactional(readOnly = true)
    public AgencyResponse getMine() {
        return AgencyResponse.from(getCurrentAgency());
    }

    @Transactional
    public AgencyResponse rename(UpdateAgencyRequest request) {
        agencyContext.requireAdmin();
        Agency agency = getCurrentAgency();
        agency.setName(request.getName());
        return AgencyResponse.from(agencyRepository.save(agency));
    }

    /**
     * The User principal cached on the security context may carry a lazy, session-less
     * Agency proxy — fetch a fresh, attached entity by id instead of dereferencing it.
     */
    private Agency getCurrentAgency() {
        return agencyRepository.findById(agencyContext.getCurrentAgencyId())
            .orElseThrow(() -> new ResourceNotFoundException("Agency", "id", agencyContext.getCurrentAgencyId()));
    }
}
