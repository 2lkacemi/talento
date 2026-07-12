package com.talento.repository;

import com.talento.model.Invitation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface InvitationRepository extends JpaRepository<Invitation, UUID> {

    Optional<Invitation> findByToken(String token);

    List<Invitation> findByAgencyIdOrderByCreatedAtDesc(UUID agencyId);

    Optional<Invitation> findByIdAndAgencyId(UUID id, UUID agencyId);

    boolean existsByAgencyIdAndEmailAndStatus(UUID agencyId, String email, Invitation.InvitationStatus status);
}
