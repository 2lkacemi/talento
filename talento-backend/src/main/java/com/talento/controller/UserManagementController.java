package com.talento.controller;

import com.talento.dto.request.ChangeRoleRequest;
import com.talento.dto.request.UserStatusRequest;
import com.talento.dto.response.UserResponse;
import com.talento.service.UserManagementService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserManagementController {

    private final UserManagementService userManagementService;

    @GetMapping
    public ResponseEntity<List<UserResponse>> getAll() {
        return ResponseEntity.ok(userManagementService.list());
    }

    @PatchMapping("/{id}/role")
    public ResponseEntity<UserResponse> changeRole(@PathVariable UUID id, @Valid @RequestBody ChangeRoleRequest request) {
        return ResponseEntity.ok(userManagementService.changeRole(id, request));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<UserResponse> setEnabled(@PathVariable UUID id, @Valid @RequestBody UserStatusRequest request) {
        return ResponseEntity.ok(userManagementService.setEnabled(id, request));
    }
}
