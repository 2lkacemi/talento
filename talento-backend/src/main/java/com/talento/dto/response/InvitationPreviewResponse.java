package com.talento.dto.response;

import com.talento.model.Invitation;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class InvitationPreviewResponse {
    private String email;
    private String agencyName;
    private String role;

    public static InvitationPreviewResponse from(Invitation invitation) {
        return new InvitationPreviewResponse(
            invitation.getEmail(),
            invitation.getAgency().getName(),
            invitation.getRole().name()
        );
    }
}
