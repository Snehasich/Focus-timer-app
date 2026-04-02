package com.example.server.Service;

import java.util.List;

import org.springframework.stereotype.*;

import com.example.server.entity.Task;
import com.example.server.repo.TaskRepo;

import lombok.*;

@Service
public class TaskService {

    private final TaskRepo repository;

    public TaskService(TaskRepo repository) {
        this.repository = repository;
    }
    
    public List<Task> getAllTasks() {
        return repository.findAll();
    }

    public Task createTasks(Task task) {
        return repository.save(task);
    }

    public Task updateTask(Long id, Task updatedTask) {
        Task task = repository.findById(id).orElseThrow();
        task.setCompleted(updatedTask.isCompleted());
        return repository.save(task);
    }

    public void deleteTask(Long id) {
        repository.deleteById(id);
    }

}