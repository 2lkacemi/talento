package com.talento.repository;

import com.talento.model.Client;
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
public interface ClientRepository extends JpaRepository<Client, UUID> {
    boolean existsByEmailAndAgencyId(String email, UUID agencyId);

    Optional<Client> findByIdAndAgencyId(UUID id, UUID agencyId);
    boolean existsByIdAndAgencyId(UUID id, UUID agencyId);

    List<Client> findAllByAgencyId(UUID agencyId);
    Page<Client> findAllByAgencyId(UUID agencyId, Pageable pageable);
    long countByAgencyId(UUID agencyId);

    @Query("SELECT c FROM Client c WHERE c.agency.id = :agencyId AND (" +
           "LOWER(c.name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(c.companyName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(c.email) LIKE LOWER(CONCAT('%', :query, '%')))")
    List<Client> search(@Param("query") String query, @Param("agencyId") UUID agencyId);
}
