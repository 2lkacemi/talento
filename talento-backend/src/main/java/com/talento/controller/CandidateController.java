package com.talento.controller;

import com.talento.dto.request.CandidateRequest;
import com.talento.dto.response.ApplicationResponse;
import com.talento.dto.response.CandidateResponse;
import com.talento.dto.response.PageResponse;
import com.talento.service.ApplicationService;
import com.talento.service.CandidateService;
import com.talento.service.FileStorageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/candidates")
@RequiredArgsConstructor
public class CandidateController {

    private final CandidateService candidateService;
    private final ApplicationService applicationService;
    private final FileStorageService fileStorageService;

    @GetMapping
    public ResponseEntity<PageResponse<CandidateResponse>> getAll(
            @RequestParam(required = false) String q,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        if (q != null && !q.isBlank()) {
            return ResponseEntity.ok(candidateService.search(q, pageable));
        }
        return ResponseEntity.ok(candidateService.findAll(pageable));
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

    @PostMapping("/upload-cv")
    public ResponseEntity<Map<String, String>> uploadCv(@RequestParam("file") MultipartFile file) {
        try {
            String url = fileStorageService.storeCv(file);
            return ResponseEntity.ok(Map.of("url", url));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Upload failed"));
        }
    }
}
