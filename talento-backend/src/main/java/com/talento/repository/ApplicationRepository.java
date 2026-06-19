package com.talento.repository;

import com.talento.model.Application;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, UUID> {
    List<Application> findByJobOfferId(UUID jobOfferId);
    List<Application> findByCandidateId(UUID candidateId);
    Optional<Application> findByCandidateIdAndJobOfferId(UUID candidateId, UUID jobOfferId);
    boolean existsByCandidateIdAndJobOfferId(UUID candidateId, UUID jobOfferId);
    long countByStatus(Application.ApplicationStatus status);
}
