package com.example.server.repo;

import com.example.server.entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TaskRepo extends JpaRepository<Task, Long> {

    // 🔐 get tasks for specific user
    List<Task> findByUsername(String username);
}