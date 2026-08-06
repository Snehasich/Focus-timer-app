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

    // 🔐 GET TASKS FOR LOGGED-IN USER (WITH GUEST FALLBACK ADOPTION)
    public List<Task> getTasksByUser(String username) {
        List<Task> userTasks = repository.findByUsername(username);
        if ((userTasks == null || userTasks.isEmpty()) && username != null && !"Guest".equals(username)) {
            List<Task> guestTasks = repository.findByUsername("Guest");
            if (guestTasks != null && !guestTasks.isEmpty()) {
                guestTasks.forEach(t -> t.setUsername(username));
                return repository.saveAll(guestTasks);
            }
        }
        return userTasks != null ? userTasks : List.of();
    }

    // ➕ CREATE TASK (already assigned username in controller)
    public Task createTasks(Task task) {
        if (task.getUsername() == null || task.getUsername().trim().isEmpty()) {
            task.setUsername("Guest");
        }
        return repository.save(task);
    }

    // ✏️ UPDATE TASK
    public Task updateTaskForUser(Long id, Task updatedTask, String username) {
        Task task = repository.findById(id).orElse(null);

        if (task == null) {
            updatedTask.setUsername(username);
            return repository.save(updatedTask);
        }

        task.setText(updatedTask.getText());
        task.setCompleted(updatedTask.isCompleted());
        if (task.getUsername() == null || "Guest".equals(task.getUsername())) {
            task.setUsername(username);
        }

        return repository.save(task);
    }

    // ❌ DELETE TASK
    public void deleteTaskForUser(Long id, String username) {
        Task task = repository.findById(id).orElse(null);
        if (task != null) {
            repository.delete(task);
        }
    }
}