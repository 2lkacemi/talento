package com.talento.security;

import com.talento.model.User;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
public class AgencyContext {

    public User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return (User) auth.getPrincipal();
    }

    public UUID getCurrentAgencyId() {
        return getCurrentUser().getAgency().getId();
    }

    public void requireAdmin() {
        if (getCurrentUser().getRole() != User.Role.ADMIN) {
            throw new AccessDeniedException("Admin role required");
        }
    }
}
