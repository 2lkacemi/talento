package com.talento.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RankedCandidateResponse {
    private CandidateResponse candidate;
    private int matchScore;
    private boolean alreadyApplied;
}
