package com.example.server.repo;

import com.example.server.entity.UserActivity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserActivityRepo extends JpaRepository<UserActivity, Long> {

    // All activity rows for one user (case-insensitive for robust matching)
    List<UserActivity> findByUsernameOrderByActivityDateAsc(String username);
    List<UserActivity> findByUsernameIgnoreCaseOrderByActivityDateAsc(String username);

    // Specific date row — used for upsert logic
    Optional<UserActivity> findByUsernameAndActivityDate(String username, LocalDate date);
    Optional<UserActivity> findByUsernameIgnoreCaseAndActivityDate(String username, LocalDate date);

    // Date range of data for heatmap
    List<UserActivity> findByUsernameAndActivityDateBetween(String username, LocalDate from, LocalDate to);
    List<UserActivity> findByUsernameIgnoreCaseAndActivityDateBetween(String username, LocalDate from, LocalDate to);
}
