package com.talento.controller;

import com.talento.dto.request.CandidateRequest;
import com.talento.dto.response.ApplicationResponse;
import com.talento.dto.response.CandidateResponse;
import com.talento.service.ApplicationService;
import com.talento.service.CandidateService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/candidates")
@RequiredArgsConstructor
public class CandidateController {

    private final CandidateService candidateService;
    private final ApplicationService applicationService;

    @GetMapping
    public ResponseEntity<List<CandidateResponse>> getAll() {
        return ResponseEntity.ok(candidateService.findAll());
    }

    @GetMapping("/search")
    public ResponseEntity<List<CandidateResponse>> search(@RequestParam(required = false) String q) {
        return ResponseEntity.ok(candidateService.search(q));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CandidateResponse> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(candidateService.findById(id));
    }

    @GetMapping("/{id}/applications")
    public ResponseEntity<List<ApplicationResponse>> getApplications(@PathVariable UUID id) {
        return ResponseEntity.ok(applicationService.findByCandidate(id));
    }

    @PostMapping
    public ResponseEntity<CandidateResponse> create(@Valid @RequestBody CandidateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(candidateService.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CandidateResponse> update(@PathVariable UUID id,
                                                     @Valid @RequestBody CandidateRequest request) {
        return ResponseEntity.ok(candidateService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        candidateService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
