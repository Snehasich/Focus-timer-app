package com.example.server.controller;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.*;
import com.example.server.entity.Task;
import com.example.server.service.TaskService;

import java.util.*;

@RequestMapping("/tasks")
@RestController
@CrossOrigin(origins = "http://localhost:5173")
public class TaskController {
    
    private final TaskService service;

    public TaskController(TaskService service) {
        this.service = service;
    }


    @GetMapping
    public List<Task> getTasks() {
        return service.getAllTasks();
    }
    
    @PostMapping
    public Task addTask(@RequestBody Task task) {
        return service.createTasks(task);
    }

    @PutMapping("/{id}")
    public Task updateTask(@PathVariable Long id, @RequestBody Task task) {
        return service.updateTask(id, task);
    }

    @DeleteMapping("/{id}")
    public void deleteTask(@PathVariable Long id) {
        service.deleteTask(id);
    }   

}
