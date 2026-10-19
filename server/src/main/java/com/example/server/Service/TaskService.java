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

    // 🔐 GET TASKS FOR LOGGED-IN USER (New users have 0 tasks by default)
    public List<Task> getTasksByUser(String username) {
        if (username == null || username.trim().isEmpty()) {
            return List.of();
        }
        List<Task> userTasks = repository.findByUsername(username);
        return userTasks != null ? userTasks : List.of();
    }

    // ➕ CREATE TASK
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
        task.setUsername(username);

        return repository.save(task);
    }

    // ❌ DELETE TASK
    public void deleteTaskForUser(Long id, String username) {
        Task task = repository.findById(id).orElse(null);
        if (task != null) {
            repository.delete(task);
        }
    }

    // ⚡ BULK ACTION
    public List<Task> executeBulkAction(String action, String username) {
        List<Task> tasks = repository.findByUsername(username);
        if (tasks == null || tasks.isEmpty()) return List.of();

        if ("mark-all-completed".equalsIgnoreCase(action)) {
            tasks.forEach(t -> t.setCompleted(true));
            return repository.saveAll(tasks);
        } else if ("clear-completed".equalsIgnoreCase(action)) {
            List<Task> completed = tasks.stream().filter(Task::isCompleted).toList();
            repository.deleteAll(completed);
            return repository.findByUsername(username);
        } else if ("delete-all".equalsIgnoreCase(action)) {
            repository.deleteAll(tasks);
            return List.of();
        }
        return tasks;
    }
}