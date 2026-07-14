package com.talento.controller;

import com.talento.dto.request.UpdateAgencyRequest;
import com.talento.dto.response.AgencyResponse;
import com.talento.service.AgencyService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/agency")
@RequiredArgsConstructor
public class AgencyController {

    private final AgencyService agencyService;

    @GetMapping
    public ResponseEntity<AgencyResponse> getMine() {
        return ResponseEntity.ok(agencyService.getMine());
    }

    @PatchMapping
    public ResponseEntity<AgencyResponse> rename(@Valid @RequestBody UpdateAgencyRequest request) {
        return ResponseEntity.ok(agencyService.rename(request));
    }
}
