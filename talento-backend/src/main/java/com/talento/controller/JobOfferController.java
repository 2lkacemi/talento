package com.talento.controller;

import com.talento.dto.request.JobOfferRequest;
import com.talento.dto.response.JobOfferResponse;
import com.talento.dto.response.PageResponse;
import com.talento.dto.response.RankedCandidateResponse;
import com.talento.model.JobOffer;
import com.talento.service.ApplicationService;
import com.talento.service.JobOfferService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/job-offers")
@RequiredArgsConstructor
public class JobOfferController {

    private final JobOfferService jobOfferService;
    private final ApplicationService applicationService;

    @GetMapping
    public ResponseEntity<PageResponse<JobOfferResponse>> getAll(
            @RequestParam(required = false) JobOffer.JobOfferStatus status,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(jobOfferService.findAll(pageable, status));
    }

    @GetMapping("/{id}")
    public ResponseEntity<JobOfferResponse> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(jobOfferService.findById(id));
    }

    @GetMapping("/{id}/public")
    public ResponseEntity<JobOfferResponse> getPublic(@PathVariable UUID id) {
        return ResponseEntity.ok(JobOfferResponse.from(jobOfferService.findPublicById(id)));
    }

    @GetMapping("/{id}/candidates-ranked")
    public ResponseEntity<List<RankedCandidateResponse>> getRankedCandidates(@PathVariable UUID id) {
        return ResponseEntity.ok(applicationService.getRankedCandidates(id));
    }

    @PostMapping
    public ResponseEntity<JobOfferResponse> create(@Valid @RequestBody JobOfferRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(jobOfferService.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<JobOfferResponse> update(@PathVariable UUID id,
                                                    @Valid @RequestBody JobOfferRequest request) {
        return ResponseEntity.ok(jobOfferService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        jobOfferService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
