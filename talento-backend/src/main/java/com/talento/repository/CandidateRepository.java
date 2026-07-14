package com.talento.repository;

import com.talento.model.Candidate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CandidateRepository extends JpaRepository<Candidate, UUID> {
    Optional<Candidate> findByEmailAndAgencyId(String email, UUID agencyId);
    boolean existsByEmailAndAgencyId(String email, UUID agencyId);
    boolean existsByPhoneAndAgencyId(String phone, UUID agencyId);

    Optional<Candidate> findByIdAndAgencyId(UUID id, UUID agencyId);
    boolean existsByIdAndAgencyId(UUID id, UUID agencyId);

    List<Candidate> findAllByAgencyId(UUID agencyId);
    Page<Candidate> findAllByAgencyId(UUID agencyId, Pageable pageable);

    long countByAgencyId(UUID agencyId);

    @Query("SELECT c FROM Candidate c WHERE c.agency.id = :agencyId AND (" +
           "LOWER(c.firstName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(c.lastName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(c.email) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(c.location) LIKE LOWER(CONCAT('%', :query, '%')))")
    List<Candidate> search(@Param("query") String query, @Param("agencyId") UUID agencyId);

    @Query("SELECT c FROM Candidate c WHERE c.agency.id = :agencyId AND (" +
           "LOWER(c.firstName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(c.lastName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(c.email) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(c.location) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<Candidate> searchPage(@Param("query") String query, @Param("agencyId") UUID agencyId, Pageable pageable);
}
