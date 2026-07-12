package com.talento.repository;

import com.talento.model.Application;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, UUID> {
    List<Application> findByJobOfferIdAndAgencyId(UUID jobOfferId, UUID agencyId);
    List<Application> findByCandidateIdAndAgencyId(UUID candidateId, UUID agencyId);
    Optional<Application> findByIdAndAgencyId(UUID id, UUID agencyId);
    boolean existsByCandidateIdAndJobOfferIdAndAgencyId(UUID candidateId, UUID jobOfferId, UUID agencyId);
    long countByStatusAndAgencyId(Application.ApplicationStatus status, UUID agencyId);
    long countByAgencyId(UUID agencyId);
}
