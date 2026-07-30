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

    // ── POST /activity/login — record today's login/visit ──
    @PostMapping("/login")
    public ResponseEntity<?> recordLogin(Authentication authentication) {
        String username = authentication.getName();
        activityService.logVisit(username);
        return ResponseEntity.ok(Map.of("message", "Login recorded"));
    }

    // ── POST /activity/log — log a completed focus session ──
    // Body: { "focusSeconds": 3000, "sessions": 1 }
    @PostMapping("/log")
    public ResponseEntity<?> logSession(
            @RequestBody Map<String, Object> body,
            Authentication authentication) {

        String username = authentication.getName();
        long focusSeconds = ((Number) body.getOrDefault("focusSeconds", 0)).longValue();
        int sessions = ((Number) body.getOrDefault("sessions", 0)).intValue();

        activityService.logFocusSession(username, focusSeconds, sessions);
        return ResponseEntity.ok(Map.of("message", "Session logged"));
    }

    // ── GET /activity/stats — return full dashboard stats ──
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getDashboardStats(Authentication authentication) {
        String username = authentication.getName();
        Map<String, Object> stats = activityService.getDashboardStats(username);
        return ResponseEntity.ok(stats);
    }
}
