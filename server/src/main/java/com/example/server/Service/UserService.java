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

        // 🔥 check duplicate
        if (repo.findByUsername(user.getUsername()) != null) {
            throw new RuntimeException("User already exists");
        }

        // 🔥 encode password
        user.setPassword(passwordEncoder.encode(user.getPassword()));

        repo.save(user);
    }

    // ✅ LOGIN
    public String verify(Users user) {

        Users existingUser = repo.findByUsername(user.getUsername());

        if (existingUser == null) {
            throw new RuntimeException("User not found");
        }

        if (!passwordEncoder.matches(user.getPassword(), existingUser.getPassword())) {
            throw new RuntimeException("Invalid password");
        }

        return jwtService.generateToken(user.getUsername());
    }
}