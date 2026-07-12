package com.talento.service;

import com.talento.dto.request.ChangeRoleRequest;
import com.talento.dto.request.UserStatusRequest;
import com.talento.dto.response.UserResponse;
import com.talento.exception.ResourceNotFoundException;
import com.talento.model.User;
import com.talento.repository.UserRepository;
import com.talento.security.AgencyContext;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserManagementService {

    private final UserRepository userRepository;
    private final AgencyContext agencyContext;

    @Transactional(readOnly = true)
    public List<UserResponse> list() {
        agencyContext.requireAdmin();
        return userRepository.findByAgencyIdOrderByCreatedAtAsc(agencyContext.getCurrentAgencyId()).stream()
            .map(UserResponse::from)
            .collect(Collectors.toList());
    }

    @Transactional
    public UserResponse changeRole(UUID id, ChangeRoleRequest request) {
        agencyContext.requireAdmin();
        User target = getUserOrThrow(id);

        if (target.getRole() == User.Role.ADMIN && request.getRole() != User.Role.ADMIN
                && isLastEnabledAdmin(target)) {
            throw new IllegalArgumentException("Cannot demote the last remaining admin");
        }

        target.setRole(request.getRole());
        return UserResponse.from(userRepository.save(target));
    }

    @Transactional
    public UserResponse setEnabled(UUID id, UserStatusRequest request) {
        agencyContext.requireAdmin();
        User target = getUserOrThrow(id);
        User currentUser = agencyContext.getCurrentUser();

        if (!request.isEnabled()) {
            if (target.getId().equals(currentUser.getId())) {
                throw new IllegalArgumentException("You cannot deactivate your own account");
            }
            if (target.getRole() == User.Role.ADMIN && isLastEnabledAdmin(target)) {
                throw new IllegalArgumentException("Cannot deactivate the last remaining admin");
            }
        }

        target.setEnabled(request.isEnabled());
        return UserResponse.from(userRepository.save(target));
    }

    private boolean isLastEnabledAdmin(User target) {
        long enabledAdmins = userRepository.countByAgencyIdAndRoleAndEnabledTrue(
            agencyContext.getCurrentAgencyId(), User.Role.ADMIN);
        return target.isEnabled() && enabledAdmins <= 1;
    }

    private User getUserOrThrow(UUID id) {
        return userRepository.findByIdAndAgencyId(id, agencyContext.getCurrentAgencyId())
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
    }
}
