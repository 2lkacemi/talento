package com.talento.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsResponse {
    private long totalCandidates;
    private long totalJobOffers;
    private long openJobOffers;
    private long totalClients;
    private long activeApplications;
    private long hiredThisMonth;
}
