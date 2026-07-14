package com.talento.dto.response;

import com.talento.model.Client;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class ClientResponse {
    private UUID id;
    private String name;
    private String companyName;
    private String email;
    private String phone;
    private LocalDateTime createdAt;
    private int jobOffersCount;

    public static ClientResponse from(Client client) {
        ClientResponse r = new ClientResponse();
        r.setId(client.getId());
        r.setName(client.getName());
        r.setCompanyName(client.getCompanyName());
        r.setEmail(client.getEmail());
        r.setPhone(client.getPhone());
        r.setCreatedAt(client.getCreatedAt());
        r.setJobOffersCount(client.getJobOffers().size());
        return r;
    }
}
