package com.example.server.repo;

import com.example.server.entity.UserActivity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface UserActivityRepo extends JpaRepository<UserActivity, Long> {

    // All activity rows for one user (for streak + heatmap computation)
    List<UserActivity> findByUsernameOrderByActivityDateAsc(String username);

    // Today's row — used for upsert logic
    Optional<UserActivity> findByUsernameAndActivityDate(String username, LocalDate date);

    // Last 12 months of data for heatmap
    List<UserActivity> findByUsernameAndActivityDateBetween(String username, LocalDate from, LocalDate to);
}
