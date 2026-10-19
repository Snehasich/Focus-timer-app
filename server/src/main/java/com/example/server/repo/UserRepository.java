package com.example.server.repo;

import com.example.server.entity.Users;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface UserRepository extends JpaRepository<Users, Integer> {

    Users findByUsername(String username);

    Users findByUsernameIgnoreCase(String username);

    @Query("SELECT u FROM Users u WHERE LOWER(TRIM(u.username)) = LOWER(TRIM(:username))")
    Users findByTrimmedUsernameIgnoreCase(@Param("username") String username);
}