package com.talento.dto.response;

import com.talento.model.Agency;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class AgencyResponse {
    private UUID id;
    private String name;
    private LocalDateTime createdAt;

    public static AgencyResponse from(Agency agency) {
        AgencyResponse r = new AgencyResponse();
        r.setId(agency.getId());
        r.setName(agency.getName());
        r.setCreatedAt(agency.getCreatedAt());
        return r;
    }
}
