package com.example.server.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.example.server.entity.Task;
import com.example.server.service.TaskService;

import java.util.List;

@RequestMapping("/tasks")
@RestController
@CrossOrigin(origins = "*")
public class TaskController {

    private final TaskService service;

    public TaskController(TaskService service) {
        this.service = service;
    }

    // 🔐 GET USER-SPECIFIC TASKS
    @GetMapping
    public ResponseEntity<List<Task>> getTasks(Authentication authentication) {

        String username = authentication.getName();

        List<Task> tasks = service.getTasksByUser(username);

        return ResponseEntity.ok(tasks);
    }

    // ➕ CREATE TASK (assign to logged-in user)
    @PostMapping
    public ResponseEntity<Task> addTask(@RequestBody Task task, Authentication authentication) {

        String username = authentication.getName();

        task.setUsername(username); // 🔐 assign owner

        Task savedTask = service.createTasks(task);

        return ResponseEntity.ok(savedTask);
    }

    // ✏️ UPDATE TASK (only if belongs to user)
    @PutMapping("/{id}")
    public ResponseEntity<Task> updateTask(@PathVariable Long id,
                                           @RequestBody Task task,
                                           Authentication authentication) {

        String username = authentication.getName();

        Task updated = service.updateTaskForUser(id, task, username);

        return ResponseEntity.ok(updated);
    }

    // ❌ DELETE TASK (only if belongs to user)
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable Long id,
                                           Authentication authentication) {

        String username = authentication.getName();

        service.deleteTaskForUser(id, username);

        return ResponseEntity.ok().build();
    }
}