package com.example.server.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.example.server.entity.Task;
import com.example.server.entity.Users;
import com.example.server.repo.TaskRepo;
import com.example.server.repo.UserRepository;

@Service
public class TaskService {

    private final TaskRepo repository;
    private final UserRepository userRepo;

    public TaskService(TaskRepo repository, UserRepository userRepo) {
        this.repository = repository;
        this.userRepo = userRepo;
    }

    // 🔐 GET TASKS FOR LOGGED-IN USER (Isolated via user_id foreign key & email)
    public List<Task> getTasksByUser(String identifier) {
        if (identifier == null || identifier.trim().isEmpty() || "anonymousUser".equalsIgnoreCase(identifier)) {
            return List.of();
        }
        String cleanIdentifier = identifier.trim();
        Users user = userRepo.findByIdentifier(cleanIdentifier);
        if (user != null) {
            return repository.findAllForUser(user.getId(), cleanIdentifier);
        }
        List<Task> userTasks = repository.findByUsernameIgnoreCase(cleanIdentifier);
        return userTasks != null ? userTasks : List.of();
    }

    // ➕ CREATE TASK WITH FOREIGN KEY LINKAGE
    public Task createTasks(Task task, String identifier) {
        String cleanIdentifier = (identifier != null && !identifier.trim().isEmpty()) ? identifier.trim() : "Guest";
        Users user = userRepo.findByIdentifier(cleanIdentifier);
        if (user != null) {
            task.setUser(user);
            task.setUsername(user.getEmail() != null ? user.getEmail() : user.getUsername());
        } else {
            task.setUsername(cleanIdentifier);
        }
        return repository.save(task);
    }

    // ✏️ UPDATE TASK (Strict user ownership check)
    public Task updateTaskForUser(Long id, Task updatedTask, String identifier) {
        Task task = repository.findById(id).orElse(null);
        if (task == null) {
            return createTasks(updatedTask, identifier);
        }

        verifyOwnership(task, identifier);

        task.setText(updatedTask.getText());
        task.setCompleted(updatedTask.isCompleted());
        return repository.save(task);
    }

    // ❌ DELETE TASK (Strict user ownership check)
    public void deleteTaskForUser(Long id, String identifier) {
        Task task = repository.findById(id).orElse(null);
        if (task != null) {
            verifyOwnership(task, identifier);
            repository.delete(task);
        }
    }

    // ⚡ BULK ACTION (Strictly user-scoped & handles all formats)
    public List<Task> executeBulkAction(String action, String identifier) {
        if (identifier == null || identifier.trim().isEmpty() || action == null) return List.of();
        List<Task> tasks = getTasksByUser(identifier);
        if (tasks == null || tasks.isEmpty()) return List.of();

        String normalizedAction = action.trim().toLowerCase().replace(" ", "-").replace("_", "-");

        if ("mark-all-completed".equals(normalizedAction)) {
            tasks.forEach(t -> t.setCompleted(true));
            return repository.saveAll(tasks);
        } else if ("mark-all-active".equals(normalizedAction)) {
            tasks.forEach(t -> t.setCompleted(false));
            return repository.saveAll(tasks);
        } else if ("clear-completed".equals(normalizedAction)) {
            List<Task> completed = tasks.stream().filter(Task::isCompleted).toList();
            repository.deleteAll(completed);
            return getTasksByUser(identifier);
        } else if ("delete-all".equals(normalizedAction) || "reset-all-tasks".equals(normalizedAction)) {
            repository.deleteAll(tasks);
            return List.of();
        }
        return tasks;
    }

    private void verifyOwnership(Task task, String identifier) {
        if (identifier == null || identifier.trim().isEmpty()) {
            throw new SecurityException("Unauthorized request.");
        }
        String cleanIdentifier = identifier.trim();
        Users user = userRepo.findByIdentifier(cleanIdentifier);

        boolean ownsByUserId = (user != null && task.getUser() != null && task.getUser().getId() == user.getId());
        boolean ownsByUsername = (task.getUsername() != null && task.getUsername().equalsIgnoreCase(cleanIdentifier));
        boolean ownsByEmail = (user != null && user.getEmail() != null && user.getEmail().equalsIgnoreCase(task.getUsername()));

        if (!ownsByUserId && !ownsByUsername && !ownsByEmail) {
            throw new SecurityException("Access denied: You do not own this task.");
        }
    }
}
