package com.talento.controller;

import com.talento.dto.request.ApplicationRequest;
import com.talento.dto.request.ApplicationStatusRequest;
import java.util.Map;
import com.talento.dto.response.ApplicationResponse;
import com.talento.dto.response.ApplicationStatusHistoryResponse;
import com.talento.service.ApplicationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/applications")
@RequiredArgsConstructor
public class ApplicationController {

    private final ApplicationService applicationService;

    @GetMapping("/job-offer/{jobOfferId}")
    public ResponseEntity<List<ApplicationResponse>> getByJobOffer(@PathVariable UUID jobOfferId) {
        return ResponseEntity.ok(applicationService.findByJobOffer(jobOfferId));
    }

    @GetMapping("/candidate/{candidateId}")
    public ResponseEntity<List<ApplicationResponse>> getByCandidate(@PathVariable UUID candidateId) {
        return ResponseEntity.ok(applicationService.findByCandidate(candidateId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApplicationResponse> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(applicationService.findById(id));
    }

    @GetMapping("/{id}/history")
    public ResponseEntity<List<ApplicationStatusHistoryResponse>> getHistory(@PathVariable UUID id) {
        return ResponseEntity.ok(applicationService.getHistory(id));
    }

    @PostMapping
    public ResponseEntity<ApplicationResponse> create(@Valid @RequestBody ApplicationRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(applicationService.create(request));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApplicationResponse> updateStatus(@PathVariable UUID id,
                                                             @Valid @RequestBody ApplicationStatusRequest request) {
        return ResponseEntity.ok(applicationService.updateStatus(id, request));
    }

    @PatchMapping("/{id}/notes")
    public ResponseEntity<ApplicationResponse> updateNotes(@PathVariable UUID id,
                                                            @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(applicationService.updateNotes(id, body.get("notes")));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        applicationService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
