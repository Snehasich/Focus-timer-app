package com.example.server.repo;

import com.example.server.entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskRepo extends JpaRepository<Task, Long> {

    // 🔐 Get tasks for specific user (case-insensitive for robust auth match)
    List<Task> findByUsernameIgnoreCase(String username);

    List<Task> findByUsername(String username);
}
