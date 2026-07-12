package com.talento.service;

import com.talento.dto.request.ClientRequest;
import com.talento.dto.response.ClientResponse;
import com.talento.dto.response.PageResponse;
import com.talento.exception.DuplicateResourceException;
import com.talento.exception.ResourceNotFoundException;
import com.talento.model.Client;
import com.talento.repository.ClientRepository;
import com.talento.security.AgencyContext;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ClientService {

    private final ClientRepository clientRepository;
    private final AgencyContext agencyContext;

    @Transactional(readOnly = true)
    public List<ClientResponse> findAll() {
        return clientRepository.findAllByAgencyId(agencyContext.getCurrentAgencyId()).stream()
            .map(ClientResponse::from)
            .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PageResponse<ClientResponse> findAll(Pageable pageable) {
        return PageResponse.from(
            clientRepository.findAllByAgencyId(agencyContext.getCurrentAgencyId(), pageable),
            ClientResponse::from
        );
    }

    @Transactional(readOnly = true)
    public ClientResponse findById(UUID id) {
        return ClientResponse.from(getClientOrThrow(id));
    }

    @Transactional
    public ClientResponse create(ClientRequest request) {
        UUID agencyId = agencyContext.getCurrentAgencyId();
        if (clientRepository.existsByEmailAndAgencyId(request.getEmail(), agencyId)) {
            throw new DuplicateResourceException("Client with email already exists: " + request.getEmail());
        }

        Client client = new Client();
        client.setAgency(agencyContext.getCurrentUser().getAgency());
        client.setName(request.getName());
        client.setCompanyName(request.getCompanyName());
        client.setEmail(request.getEmail());
        client.setPhone(request.getPhone());
        return ClientResponse.from(clientRepository.save(client));
    }

    @Transactional
    public ClientResponse update(UUID id, ClientRequest request) {
        Client client = getClientOrThrow(id);

        if (!client.getEmail().equals(request.getEmail())
            && clientRepository.existsByEmailAndAgencyId(request.getEmail(), agencyContext.getCurrentAgencyId())) {
            throw new DuplicateResourceException("Client with email already exists: " + request.getEmail());
        }

        client.setName(request.getName());
        client.setCompanyName(request.getCompanyName());
        client.setEmail(request.getEmail());
        client.setPhone(request.getPhone());
        return ClientResponse.from(clientRepository.save(client));
    }

    @Transactional
    public void delete(UUID id) {
        UUID agencyId = agencyContext.getCurrentAgencyId();
        if (!clientRepository.existsByIdAndAgencyId(id, agencyId)) {
            throw new ResourceNotFoundException("Client", "id", id);
        }
        clientRepository.deleteById(id);
    }

    private Client getClientOrThrow(UUID id) {
        return clientRepository.findByIdAndAgencyId(id, agencyContext.getCurrentAgencyId())
            .orElseThrow(() -> new ResourceNotFoundException("Client", "id", id));
    }
}
