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
import java.util.Optional;
import java.util.UUID;

@Repository
public interface JobOfferRepository extends JpaRepository<JobOffer, UUID> {

    @EntityGraph(attributePaths = {"applications"})
    List<JobOffer> findAllByAgencyId(UUID agencyId);

    @EntityGraph(attributePaths = {"applications"})
    Page<JobOffer> findAllByAgencyId(UUID agencyId, Pageable pageable);

    @EntityGraph(attributePaths = {"applications"})
    Optional<JobOffer> findByIdAndAgencyId(UUID id, UUID agencyId);

    boolean existsByIdAndAgencyId(UUID id, UUID agencyId);

    @EntityGraph(attributePaths = {"applications"})
    List<JobOffer> findByClientIdAndAgencyId(UUID clientId, UUID agencyId);

    @EntityGraph(attributePaths = {"applications"})
    Page<JobOffer> findByStatusAndAgencyId(JobOffer.JobOfferStatus status, UUID agencyId, Pageable pageable);

    long countByStatusAndAgencyId(JobOffer.JobOfferStatus status, UUID agencyId);

    long countByAgencyId(UUID agencyId);

    @EntityGraph(attributePaths = {"applications"})
    @Query("SELECT j FROM JobOffer j WHERE j.agency.id = :agencyId AND (" +
           "LOWER(j.title) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(j.location) LIKE LOWER(CONCAT('%', :query, '%')))")
    List<JobOffer> search(@Param("query") String query, @Param("agencyId") UUID agencyId);
}
