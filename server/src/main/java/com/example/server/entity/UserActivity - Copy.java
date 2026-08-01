package com.example.server.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(
    name = "user_activity",
    uniqueConstraints = @UniqueConstraint(columnNames = {"username", "activity_date"})
)
public class UserActivity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Logical FK to Users.username — isolates data per user
    @Column(nullable = false)
    private String username;

    @Column(name = "activity_date", nullable = false)
    private LocalDate activityDate;

    // Total focus seconds accumulated this day
    @Column(nullable = false)
    private long focusSeconds = 0;

    // Number of completed focus sessions (pomodoros)
    @Column(nullable = false)
    private int sessionCount = 0;

    // How many times user opened the app / logged in today
    @Column(nullable = false)
    private int loginCount = 0;

    // ── Getters & Setters ──

    public Long getId() { return id; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public LocalDate getActivityDate() { return activityDate; }
    public void setActivityDate(LocalDate activityDate) { this.activityDate = activityDate; }

    public long getFocusSeconds() { return focusSeconds; }
    public void setFocusSeconds(long focusSeconds) { this.focusSeconds = focusSeconds; }

    public int getSessionCount() { return sessionCount; }
    public void setSessionCount(int sessionCount) { this.sessionCount = sessionCount; }

    public int getLoginCount() { return loginCount; }
    public void setLoginCount(int loginCount) { this.loginCount = loginCount; }
}
