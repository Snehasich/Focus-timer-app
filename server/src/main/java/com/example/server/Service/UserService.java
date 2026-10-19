package com.example.server.service;

import com.example.server.entity.Users;
import com.example.server.repo.UserRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    @Autowired
    private UserRepository repo;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JWTService jwtService;

    // ✅ REGISTER
    public void register(Users user) {

        // 🔥 check null
        if (user.getUsername() == null || user.getPassword() == null) {
            throw new RuntimeException("Username or password missing");
        }

        String rawUsername = user.getUsername().trim();
        String rawPassword = user.getPassword().trim();

        if (rawUsername.isEmpty() || rawPassword.isEmpty()) {
            throw new RuntimeException("Username or password cannot be blank");
        }

        // 🔥 check duplicate (case-insensitive & trimmed)
        if (repo.findByTrimmedUsernameIgnoreCase(rawUsername) != null) {
            throw new RuntimeException("User already exists");
        }

        user.setUsername(rawUsername);
        user.setPassword(passwordEncoder.encode(rawPassword));

        repo.save(user);
    }

    // ✅ LOGIN
    public String verify(Users user) {

        if (user.getUsername() == null || user.getPassword() == null) {
            throw new RuntimeException("Username or password missing");
        }

        String rawUsername = user.getUsername().trim();
        String rawPassword = user.getPassword().trim();

        // 🔥 lookup case-insensitively and trimmed
        Users existingUser = repo.findByTrimmedUsernameIgnoreCase(rawUsername);

        if (existingUser == null) {
            throw new RuntimeException("User not found");
        }

        if (!passwordEncoder.matches(rawPassword, existingUser.getPassword())) {
            throw new RuntimeException("Invalid password");
        }

        // Use the exact canonical username stored in the database for the JWT token
        return jwtService.generateToken(existingUser.getUsername());
    }

    // ✅ CANONICAL USERNAME
    public String getCanonicalUsername(String username) {
        if (username == null) return "";
        Users existingUser = repo.findByTrimmedUsernameIgnoreCase(username.trim());
        return existingUser != null ? existingUser.getUsername() : username.trim();
    }
}