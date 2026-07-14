package com.talento.dto.response;

import com.talento.model.Invitation;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class InvitationResponse {
    private UUID id;
    private String email;
    private String role;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime expiresAt;
    private LocalDateTime acceptedAt;
    private String inviteUrl;

    public static InvitationResponse from(Invitation invitation) {
        return from(invitation, null);
    }

    public static InvitationResponse from(Invitation invitation, String inviteUrl) {
        InvitationResponse r = new InvitationResponse();
        r.setId(invitation.getId());
        r.setEmail(invitation.getEmail());
        r.setRole(invitation.getRole().name());
        boolean expired = invitation.getStatus() == Invitation.InvitationStatus.PENDING
            && invitation.getExpiresAt().isBefore(LocalDateTime.now());
        r.setStatus(expired ? "EXPIRED" : invitation.getStatus().name());
        r.setCreatedAt(invitation.getCreatedAt());
        r.setExpiresAt(invitation.getExpiresAt());
        r.setAcceptedAt(invitation.getAcceptedAt());
        r.setInviteUrl(inviteUrl);
        return r;
    }
}
