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

    // 🔐 GET TASKS FOR LOGGED-IN USER (Strictly isolated by username, case-insensitive)
    public List<Task> getTasksByUser(String username) {
        if (username == null || username.trim().isEmpty() || "anonymousUser".equalsIgnoreCase(username)) {
            return List.of();
        }
        List<Task> userTasks = repository.findByUsernameIgnoreCase(username.trim());
        return userTasks != null ? userTasks : List.of();
    }

    // ➕ CREATE TASK
    public Task createTasks(Task task) {
        if (task.getUsername() == null || task.getUsername().trim().isEmpty()) {
            task.setUsername("Guest");
        } else {
            task.setUsername(task.getUsername().trim());
        }
        return repository.save(task);
    }

    // ✏️ UPDATE TASK (Strict user isolation: only owner can update)
    public Task updateTaskForUser(Long id, Task updatedTask, String username) {
        Task task = repository.findById(id).orElse(null);

        if (task == null) {
            updatedTask.setUsername(username.trim());
            return repository.save(updatedTask);
        }

        // 🔐 Security verification: Prevent cross-user modification
        if (!task.getUsername().equalsIgnoreCase(username.trim())) {
            throw new SecurityException("Access denied: You do not own this task.");
        }

        task.setText(updatedTask.getText());
        task.setCompleted(updatedTask.isCompleted());
        // Preserve original owner username
        return repository.save(task);
    }

    // ❌ DELETE TASK (Strict user isolation: only owner can delete)
    public void deleteTaskForUser(Long id, String username) {
        Task task = repository.findById(id).orElse(null);
        if (task != null) {
            // 🔐 Security verification: Prevent cross-user deletion
            if (!task.getUsername().equalsIgnoreCase(username.trim())) {
                throw new SecurityException("Access denied: You cannot delete another user's task.");
            }
            repository.delete(task);
        }
    }

    // ⚡ BULK ACTION (Strictly user-scoped)
    public List<Task> executeBulkAction(String action, String username) {
        if (username == null || username.trim().isEmpty()) return List.of();
        List<Task> tasks = repository.findByUsernameIgnoreCase(username.trim());
        if (tasks == null || tasks.isEmpty()) return List.of();

        if ("mark-all-completed".equalsIgnoreCase(action)) {
            tasks.forEach(t -> t.setCompleted(true));
            return repository.saveAll(tasks);
        } else if ("clear-completed".equalsIgnoreCase(action)) {
            List<Task> completed = tasks.stream().filter(Task::isCompleted).toList();
            repository.deleteAll(completed);
            return repository.findByUsernameIgnoreCase(username.trim());
        } else if ("delete-all".equalsIgnoreCase(action)) {
            repository.deleteAll(tasks);
            return List.of();
        }
        return tasks;
    }
}
