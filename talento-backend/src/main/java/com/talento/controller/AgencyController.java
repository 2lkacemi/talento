package com.talento.controller;

import com.talento.dto.response.AgencyResponse;
import com.talento.security.AgencyContext;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/agency")
@RequiredArgsConstructor
public class AgencyController {

    private final AgencyContext agencyContext;

    @GetMapping
    public ResponseEntity<AgencyResponse> getMine() {
        return ResponseEntity.ok(AgencyResponse.from(agencyContext.getCurrentUser().getAgency()));
    }
}
