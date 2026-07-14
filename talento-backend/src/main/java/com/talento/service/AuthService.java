package com.talento.service;

import com.talento.dto.request.AgencySelfRegisterRequest;
import com.talento.dto.request.AuthRequest;
import com.talento.dto.request.InvitationAcceptRequest;
import com.talento.dto.response.AuthResponse;
import com.talento.dto.response.InvitationPreviewResponse;
import com.talento.exception.DuplicateResourceException;
import com.talento.exception.InvalidInvitationException;
import com.talento.exception.ResourceNotFoundException;
import com.talento.model.Agency;
import com.talento.model.Invitation;
import com.talento.model.User;
import com.talento.repository.AgencyRepository;
import com.talento.repository.InvitationRepository;
import com.talento.repository.UserRepository;
import com.talento.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final AgencyRepository agencyRepository;
    private final InvitationRepository invitationRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final AuthenticationManager authenticationManager;

    @Transactional
    public AuthResponse registerAgency(AgencySelfRegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Email already registered: " + request.getEmail());
        }

        Agency agency = new Agency();
        agency.setName(request.getAgencyName());
        agencyRepository.save(agency);

        User user = new User();
        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(User.Role.ADMIN);
        user.setAgency(agency);
        userRepository.save(user);

        String token = tokenProvider.generateToken(user.getEmail());
        return toAuthResponse(user, token);
    }

    @Transactional(readOnly = true)
    public InvitationPreviewResponse previewInvitation(String token) {
        Invitation invitation = getValidInvitationOrThrow(token);
        return InvitationPreviewResponse.from(invitation);
    }

    @Transactional
    public AuthResponse acceptInvitation(String token, InvitationAcceptRequest request) {
        Invitation invitation = getValidInvitationOrThrow(token);

        if (userRepository.existsByEmail(invitation.getEmail())) {
            throw new DuplicateResourceException("Email already registered: " + invitation.getEmail());
        }

        User user = new User();
        user.setFullName(request.getFullName());
        user.setEmail(invitation.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(invitation.getRole());
        user.setAgency(invitation.getAgency());
        userRepository.save(user);

        invitation.setStatus(Invitation.InvitationStatus.ACCEPTED);
        invitation.setAcceptedAt(LocalDateTime.now());
        invitationRepository.save(invitation);

        String jwt = tokenProvider.generateToken(user.getEmail());
        return toAuthResponse(user, jwt);
    }

    public AuthResponse login(AuthRequest request) {
        Authentication auth = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        User user = userRepository.findByEmail(request.getEmail()).orElseThrow();
        String token = tokenProvider.generateToken(auth);
        return toAuthResponse(user, token);
    }

    private Invitation getValidInvitationOrThrow(String token) {
        Invitation invitation = invitationRepository.findByToken(token)
            .orElseThrow(() -> new ResourceNotFoundException("Invitation", "token", token));

        if (invitation.getStatus() != Invitation.InvitationStatus.PENDING
            || invitation.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new InvalidInvitationException("This invitation is no longer valid");
        }
        return invitation;
    }

    private AuthResponse toAuthResponse(User user, String token) {
        return new AuthResponse(
            token,
            user.getEmail(),
            user.getFullName(),
            user.getRole().name(),
            user.getAgency().getId().toString(),
            user.getAgency().getName()
        );
    }
}
