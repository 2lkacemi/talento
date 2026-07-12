package com.talento.repository;

import com.talento.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);

    List<User> findByAgencyIdOrderByCreatedAtAsc(UUID agencyId);
    Optional<User> findByIdAndAgencyId(UUID id, UUID agencyId);
    long countByAgencyIdAndRoleAndEnabledTrue(UUID agencyId, User.Role role);
}
