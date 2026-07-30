package com.example.server.controller;

import com.example.server.service.UserActivityService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/activity")
@CrossOrigin(origins = "*")
public class UserActivityController {

    private final UserActivityService activityService;

    public UserActivityController(UserActivityService activityService) {
        this.activityService = activityService;
    }

    private String getUsername(Authentication authentication) {
        if (authentication != null && authentication.getName() != null && !authentication.getName().equals("anonymousUser")) {
            return authentication.getName();
        }
        return "Guest";
    }

    // ── POST /activity/login — record today's login/visit ──
    @PostMapping("/login")
    public ResponseEntity<?> recordLogin(Authentication authentication) {
        String username = getUsername(authentication);
        activityService.logVisit(username);
        return ResponseEntity.ok(Map.of("message", "Login recorded"));
    }

    // ── POST /activity/log — log a completed focus session ──
    @PostMapping("/log")
    public ResponseEntity<?> logSession(
            @RequestBody Map<String, Object> body,
            Authentication authentication) {

        String username = getUsername(authentication);
        long focusSeconds = ((Number) body.getOrDefault("focusSeconds", 0)).longValue();
        int sessions = ((Number) body.getOrDefault("sessions", 0)).intValue();

        activityService.logFocusSession(username, focusSeconds, sessions);
        return ResponseEntity.ok(Map.of("message", "Session logged"));
    }

    // ── GET /activity/stats — return full dashboard stats ──
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getDashboardStats(Authentication authentication) {
        String username = getUsername(authentication);
        Map<String, Object> stats = activityService.getDashboardStats(username);
        return ResponseEntity.ok(stats);
    }
}
