package com.talento.controller;

import com.talento.dto.request.AgencySelfRegisterRequest;
import com.talento.dto.request.AuthRequest;
import com.talento.dto.request.InvitationAcceptRequest;
import com.talento.dto.response.AuthResponse;
import com.talento.dto.response.InvitationPreviewResponse;
import com.talento.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register-agency")
    public ResponseEntity<AuthResponse> registerAgency(@Valid @RequestBody AgencySelfRegisterRequest request) {
        return ResponseEntity.ok(authService.registerAgency(request));
    }

    @GetMapping("/invitations/{token}")
    public ResponseEntity<InvitationPreviewResponse> previewInvitation(@PathVariable String token) {
        return ResponseEntity.ok(authService.previewInvitation(token));
    }

    @PostMapping("/invitations/{token}/accept")
    public ResponseEntity<AuthResponse> acceptInvitation(@PathVariable String token,
                                                          @Valid @RequestBody InvitationAcceptRequest request) {
        return ResponseEntity.ok(authService.acceptInvitation(token, request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody AuthRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }
}
