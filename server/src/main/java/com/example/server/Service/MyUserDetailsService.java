package com.example.server.service;

import com.example.server.entity.Users;
import com.example.server.entity.UserPrincipal;
import com.example.server.repo.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class MyUserDetailsService implements UserDetailsService {

    @Autowired
    private UserRepository repo;

    @Override
    public UserDetails loadUserByUsername(String identifier) throws UsernameNotFoundException {
        if (identifier == null || identifier.trim().isEmpty()) {
            throw new UsernameNotFoundException("Identifier cannot be empty");
        }

        Users user = repo.findByIdentifier(identifier.trim());

        if (user == null) {
            throw new UsernameNotFoundException("User Not Found: " + identifier);
        }

        return new UserPrincipal(user);
    }
}
