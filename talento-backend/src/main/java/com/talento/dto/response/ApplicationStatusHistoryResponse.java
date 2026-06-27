package com.talento.dto.response;

import com.talento.model.Application;
import com.talento.model.ApplicationStatusHistory;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class ApplicationStatusHistoryResponse {
    private UUID id;
    private Application.ApplicationStatus fromStatus;
    private Application.ApplicationStatus toStatus;
    private String notes;
    private LocalDateTime changedAt;

    public static ApplicationStatusHistoryResponse from(ApplicationStatusHistory h) {
        ApplicationStatusHistoryResponse r = new ApplicationStatusHistoryResponse();
        r.setId(h.getId());
        r.setFromStatus(h.getFromStatus());
        r.setToStatus(h.getToStatus());
        r.setNotes(h.getNotes());
        r.setChangedAt(h.getChangedAt());
        return r;
    }
}
