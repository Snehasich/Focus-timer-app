package com.example.server.controller;

import com.example.server.entity.Users;
import com.example.server.service.UserService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

import org.springframework.web.bind.annotation.CrossOrigin;

@CrossOrigin(origins = "*")
@RestController
public class UserController {

    // we get the service on the controller, controller sending to service, service sending to database

    @Autowired
    private UserService service;

    @PostMapping("/register")
    public Users register(@RequestBody Users user) {              // receives data from client
        return service.register(user);
    }

    @PostMapping("/login")
    public Map<String, String> login(@RequestBody Users user) {
        String token = service.verify(user);
        return Map.of("token", token);
    }

}