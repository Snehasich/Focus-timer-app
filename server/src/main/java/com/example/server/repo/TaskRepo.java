package com.example.server.repo;

import com.example.server.entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskRepo extends JpaRepository<Task, Long> {

    // 🔐 Get tasks for specific user by user_id foreign key
    List<Task> findByUser_Id(int userId);

    // 🔐 Get tasks for specific user by email / username
    List<Task> findByUsernameIgnoreCase(String username);

    // 🔐 Get tasks by either user_id OR username/email to guarantee all user's tasks are fetched
    @Query("SELECT t FROM Task t WHERE (t.user.id = :userId) OR (LOWER(TRIM(t.username)) = LOWER(TRIM(:identifier)))")
    List<Task> findAllForUser(@Param("userId") int userId, @Param("identifier") String identifier);
}
