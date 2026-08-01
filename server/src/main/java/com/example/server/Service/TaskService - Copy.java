package com.example.server.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.example.server.entity.Task;
import com.example.server.repo.TaskRepo;

@Service
public class TaskService {

    private final TaskRepo repository;

    public TaskService(TaskRepo repository) {
        this.repository = repository;
    }

    // 🔐 GET TASKS FOR LOGGED-IN USER ONLY
    public List<Task> getTasksByUser(String username) {
        return repository.findByUsername(username);
    }

    // ➕ CREATE TASK (already assigned username in controller)
    public Task createTasks(Task task) {
        return repository.save(task);
    }

    // ✏️ UPDATE TASK (ONLY IF OWNER)
    public Task updateTaskForUser(Long id, Task updatedTask, String username) {

        Task task = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        // 🔐 check ownership
        if (!task.getUsername().equals(username)) {
            throw new RuntimeException("Unauthorized access");
        }

        task.setText(updatedTask.getText());
        task.setCompleted(updatedTask.isCompleted());

        return repository.save(task);
    }

    // ❌ DELETE TASK (ONLY IF OWNER)
    public void deleteTaskForUser(Long id, String username) {

        Task task = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        // 🔐 check ownership
        if (!task.getUsername().equals(username)) {
            throw new RuntimeException("Unauthorized access");
        }

        repository.delete(task);
    }
}