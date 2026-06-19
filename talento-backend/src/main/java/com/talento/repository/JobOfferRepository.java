package com.talento.repository;

import com.talento.model.JobOffer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface JobOfferRepository extends JpaRepository<JobOffer, UUID> {
    List<JobOffer> findByClientId(UUID clientId);
    List<JobOffer> findByStatus(JobOffer.JobOfferStatus status);
}
