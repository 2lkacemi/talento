package com.talento.controller;

import com.talento.dto.request.PublicApplicationRequest;
import com.talento.dto.response.ApplicationResponse;
import com.talento.service.ApplicationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/public")
@RequiredArgsConstructor
public class PublicApplicationController {

    private final ApplicationService applicationService;

    @PostMapping("/apply/{jobOfferId}")
    public ResponseEntity<ApplicationResponse> apply(@PathVariable UUID jobOfferId,
                                                       @Valid @RequestBody PublicApplicationRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(applicationService.applyPublic(jobOfferId, request));
    }
}
