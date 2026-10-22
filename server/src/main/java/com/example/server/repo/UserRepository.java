package com.example.server.repo;

import com.example.server.entity.Users;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface UserRepository extends JpaRepository<Users, Integer> {

    Users findByUsername(String username);

    Users findByUsernameIgnoreCase(String username);

    Users findByEmail(String email);

    Users findByEmailIgnoreCase(String email);

    @Query("SELECT u FROM Users u WHERE LOWER(TRIM(u.username)) = LOWER(TRIM(:username))")
    Users findByTrimmedUsernameIgnoreCase(@Param("username") String username);

    @Query("SELECT u FROM Users u WHERE LOWER(TRIM(u.email)) = LOWER(TRIM(:email))")
    Users findByTrimmedEmailIgnoreCase(@Param("email") String email);

    @Query("SELECT u FROM Users u WHERE LOWER(TRIM(u.email)) = LOWER(TRIM(:identifier)) OR LOWER(TRIM(u.username)) = LOWER(TRIM(:identifier))")
    Users findByIdentifier(@Param("identifier") String identifier);
}
