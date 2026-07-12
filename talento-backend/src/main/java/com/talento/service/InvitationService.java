package com.talento.service;

import com.talento.dto.request.InviteUserRequest;
import com.talento.dto.response.InvitationResponse;
import com.talento.exception.DuplicateResourceException;
import com.talento.exception.ResourceNotFoundException;
import com.talento.model.Invitation;
import com.talento.repository.InvitationRepository;
import com.talento.repository.UserRepository;
import com.talento.security.AgencyContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class InvitationService {

    private static final int TOKEN_BYTES = 32;
    private static final long EXPIRY_DAYS = 7;
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    private final InvitationRepository invitationRepository;
    private final UserRepository userRepository;
    private final AgencyContext agencyContext;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    @Transactional
    public InvitationResponse invite(InviteUserRequest request) {
        agencyContext.requireAdmin();
        UUID agencyId = agencyContext.getCurrentAgencyId();

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Email already registered: " + request.getEmail());
        }
        if (invitationRepository.existsByAgencyIdAndEmailAndStatus(agencyId, request.getEmail(), Invitation.InvitationStatus.PENDING)) {
            throw new DuplicateResourceException("An invitation is already pending for this email — revoke it first");
        }

        Invitation invitation = new Invitation();
        invitation.setAgency(agencyContext.getCurrentUser().getAgency());
        invitation.setEmail(request.getEmail());
        invitation.setRole(request.getRole());
        invitation.setToken(generateToken());
        invitation.setInvitedBy(agencyContext.getCurrentUser());
        invitation.setExpiresAt(LocalDateTime.now().plusDays(EXPIRY_DAYS));
        invitationRepository.save(invitation);

        String inviteUrl = frontendUrl + "/accept-invite/" + invitation.getToken();
        log.info("Invitation created for {}: {}", request.getEmail(), inviteUrl);
        // TODO: send this via email once spring-boot-starter-mail is wired up
        return InvitationResponse.from(invitation, inviteUrl);
    }

    @Transactional(readOnly = true)
    public List<InvitationResponse> list() {
        agencyContext.requireAdmin();
        return invitationRepository.findByAgencyIdOrderByCreatedAtDesc(agencyContext.getCurrentAgencyId()).stream()
            .map(InvitationResponse::from)
            .collect(Collectors.toList());
    }

    @Transactional
    public void revoke(UUID id) {
        agencyContext.requireAdmin();
        Invitation invitation = invitationRepository.findByIdAndAgencyId(id, agencyContext.getCurrentAgencyId())
            .orElseThrow(() -> new ResourceNotFoundException("Invitation", "id", id));
        invitation.setStatus(Invitation.InvitationStatus.REVOKED);
        invitationRepository.save(invitation);
    }

    private String generateToken() {
        byte[] bytes = new byte[TOKEN_BYTES];
        SECURE_RANDOM.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }
}
