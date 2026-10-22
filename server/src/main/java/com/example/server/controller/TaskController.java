package com.example.server.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.example.server.entity.Task;
import com.example.server.service.TaskService;

import java.util.List;
import java.util.Map;

@RequestMapping("/tasks")
@RestController
@CrossOrigin(origins = "*")
public class TaskController {

    private final TaskService service;

    public TaskController(TaskService service) {
        this.service = service;
    }

    private String getUsername(Authentication authentication) {
        if (authentication != null && authentication.getName() != null && !authentication.getName().equals("anonymousUser")) {
            return authentication.getName();
        }
        return "Guest";
    }

    // 🔐 GET USER-SPECIFIC TASKS
    @GetMapping
    public ResponseEntity<List<Task>> getTasks(Authentication authentication) {
        String username = getUsername(authentication);
        List<Task> tasks = service.getTasksByUser(username);
        return ResponseEntity.ok(tasks);
    }

    // ➕ CREATE TASK (assign to logged-in user with foreign key)
    @PostMapping
    public ResponseEntity<Task> addTask(@RequestBody Task task, Authentication authentication) {
        String username = getUsername(authentication);
        Task savedTask = service.createTasks(task, username);
        return ResponseEntity.ok(savedTask);
    }

    // ✏️ UPDATE TASK (only if belongs to user)
    @PutMapping("/{id}")
    public ResponseEntity<?> updateTask(@PathVariable Long id,
                                         @RequestBody Task task,
                                         Authentication authentication) {
        String username = getUsername(authentication);
        try {
            Task updated = service.updateTaskForUser(id, task, username);
            return ResponseEntity.ok(updated);
        } catch (SecurityException e) {
            return ResponseEntity.status(403).body(e.getMessage());
        }
    }

    // ❌ DELETE TASK (only if belongs to user)
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTask(@PathVariable Long id,
                                         Authentication authentication) {
        String username = getUsername(authentication);
        try {
            service.deleteTaskForUser(id, username);
            return ResponseEntity.ok().build();
        } catch (SecurityException e) {
            return ResponseEntity.status(403).body(e.getMessage());
        }
    }

    // ⚡ BULK ACTION (only affects current authenticated user's tasks)
    @PostMapping("/bulk")
    public ResponseEntity<List<Task>> bulkAction(@RequestBody Map<String, String> body,
                                                  Authentication authentication) {
        String username = getUsername(authentication);
        String action = body.getOrDefault("action", "");
        List<Task> updatedTasks = service.executeBulkAction(action, username);
        return ResponseEntity.ok(updatedTasks);
    }
}
