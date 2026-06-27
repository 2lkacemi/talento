package com.talento.repository;

import com.talento.model.JobOffer;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface JobOfferRepository extends JpaRepository<JobOffer, UUID> {

    @EntityGraph(attributePaths = {"applications"})
    @Override
    List<JobOffer> findAll();

    @EntityGraph(attributePaths = {"applications"})
    @Override
    Page<JobOffer> findAll(Pageable pageable);

    @EntityGraph(attributePaths = {"applications"})
    List<JobOffer> findByClientId(UUID clientId);

    @EntityGraph(attributePaths = {"applications"})
    List<JobOffer> findByStatus(JobOffer.JobOfferStatus status);

    @EntityGraph(attributePaths = {"applications"})
    Page<JobOffer> findByStatus(JobOffer.JobOfferStatus status, Pageable pageable);

    @EntityGraph(attributePaths = {"applications"})
    @Query("SELECT j FROM JobOffer j WHERE " +
           "LOWER(j.title) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(j.location) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<JobOffer> search(@Param("query") String query);
}
