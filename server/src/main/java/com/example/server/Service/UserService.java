package com.example.server.service;

import com.example.server.entity.Users;
import com.example.server.repo.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class UserService {

    @Autowired
    private UserRepository repo;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JWTService jwtService;

    // ✅ REGISTER (Full Name, Email, Password)
    public void register(Users user) {
        if (user.getEmail() == null || user.getEmail().trim().isEmpty()) {
            throw new RuntimeException("Email address is required.");
        }
        if (user.getPassword() == null || user.getPassword().trim().isEmpty()) {
            throw new RuntimeException("Password is required.");
        }
        if (user.getName() == null || user.getName().trim().isEmpty()) {
            throw new RuntimeException("Full name is required.");
        }

        String rawEmail = user.getEmail().trim().toLowerCase();
        String rawName = user.getName().trim();
        String rawPassword = user.getPassword().trim();

        if (!rawEmail.matches("^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$")) {
            throw new RuntimeException("Please provide a valid email address.");
        }

        if (rawPassword.length() < 6) {
            throw new RuntimeException("Password must be at least 6 characters long.");
        }

        // Check duplicate email / username
        if (repo.findByTrimmedEmailIgnoreCase(rawEmail) != null || repo.findByIdentifier(rawEmail) != null) {
            throw new RuntimeException("An account with this email already exists.");
        }

        user.setEmail(rawEmail);
        user.setName(rawName);
        user.setUsername(rawEmail); // Canonical username matches email
        user.setPassword(passwordEncoder.encode(rawPassword));

        repo.save(user);
    }

    // ✅ FAST LOGIN (Email & Password, single query)
    public Map<String, Object> verify(Users user) {
        String identifier = null;
        if (user.getEmail() != null && !user.getEmail().trim().isEmpty()) {
            identifier = user.getEmail().trim();
        } else if (user.getUsername() != null && !user.getUsername().trim().isEmpty()) {
            identifier = user.getUsername().trim();
        }

        if (identifier == null || user.getPassword() == null || user.getPassword().trim().isEmpty()) {
            throw new RuntimeException("Email and password are required.");
        }

        String rawPassword = user.getPassword().trim();

        // ⚡ Single query lookup to minimize remote network latency
        Users existingUser = repo.findByIdentifier(identifier);

        if (existingUser == null) {
            throw new RuntimeException("Invalid email or password.");
        }

        if (!passwordEncoder.matches(rawPassword, existingUser.getPassword())) {
            throw new RuntimeException("Invalid email or password.");
        }

        // Use canonical email/username for JWT subject
        String tokenSubject = existingUser.getEmail() != null && !existingUser.getEmail().isEmpty()
                ? existingUser.getEmail()
                : existingUser.getUsername();

        String token = jwtService.generateToken(tokenSubject);

        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("email", existingUser.getEmail() != null ? existingUser.getEmail() : "");
        response.put("name", existingUser.getName() != null ? existingUser.getName() : existingUser.getUsername());
        response.put("username", existingUser.getUsername() != null ? existingUser.getUsername() : "");
        response.put("userId", existingUser.getId());

        return response;
    }
}
