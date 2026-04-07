package com.example.server.service;

import com.example.server.entity.Users;
import com.example.server.repo.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    @Autowired
    private UserRepo repo;

    @Autowired
    private JWTService jwtService;

    @Autowired
    AuthenticationManager authManager;

    // REGISTER:
    //   Take raw password
    //   → Hash it
    //   → Save in DB
    //
    // LOGIN:
    //   Take raw password
    //   → Spring compares with hashed password
    //   → If correct → Generate JWT

    private BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(12);     // 12 means 12 rounds

    public Users register(Users user) {
        user.setPassword(encoder.encode(user.getPassword()));      // so the password will convert into hash value,
        return repo.save(user);                                     // but when you write the password in postman we have to write hash-value that is difficult, so we have to verify that
                    // so use in this config to type normal password than hash-value -> provider.setPasswordEncoder(new BCryptPasswordEncoder(12));
    }

    public String verify(Users user) {
        Authentication authentication = authManager.authenticate(new UsernamePasswordAuthenticationToken(user.getUsername(), user.getPassword()));

        if(authentication.isAuthenticated()) {
            return jwtService.generateToken(user.getUsername());
        }
        return "Fail";
    }

}
