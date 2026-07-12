package com.talento.controller;

import com.talento.dto.request.InviteUserRequest;
import com.talento.dto.response.InvitationResponse;
import com.talento.service.InvitationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/invitations")
@RequiredArgsConstructor
public class InvitationController {

    private final InvitationService invitationService;

    @GetMapping
    public ResponseEntity<List<InvitationResponse>> getAll() {
        return ResponseEntity.ok(invitationService.list());
    }

    @PostMapping
    public ResponseEntity<InvitationResponse> create(@Valid @RequestBody InviteUserRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(invitationService.invite(request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> revoke(@PathVariable UUID id) {
        invitationService.revoke(id);
        return ResponseEntity.noContent().build();
    }
}
