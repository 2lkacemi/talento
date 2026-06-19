package com.talento.controller;

import com.talento.dto.request.CandidateRequest;
import com.talento.dto.response.CandidateResponse;
import com.talento.service.CandidateService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/candidates")
@RequiredArgsConstructor
public class PublicController {

    private final CandidateService candidateService;

    @PostMapping("/public")
    public ResponseEntity<CandidateResponse> createOrUpdate(@Valid @RequestBody CandidateRequest request) {
        return ResponseEntity.ok(candidateService.createOrUpdate(request));
    }
}
