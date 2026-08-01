package com.example.server.service;

import com.example.server.entity.Task;
import com.example.server.entity.UserActivity;
import com.example.server.repo.TaskRepo;
import com.example.server.repo.UserActivityRepo;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class UserActivityService {

    private final UserActivityRepo activityRepo;
    private final TaskRepo taskRepo;

    public UserActivityService(UserActivityRepo activityRepo, TaskRepo taskRepo) {
        this.activityRepo = activityRepo;
        this.taskRepo = taskRepo;
    }

    // ─────────────────────────────────────────────
    // 1. Record today's login visit (upsert)
    // ─────────────────────────────────────────────
    public void logVisit(String username) {
        LocalDate today = LocalDate.now();
        UserActivity activity = activityRepo
                .findByUsernameAndActivityDate(username, today)
                .orElseGet(() -> {
                    UserActivity a = new UserActivity();
                    a.setUsername(username);
                    a.setActivityDate(today);
                    return a;
                });
        activity.setLoginCount(activity.getLoginCount() + 1);
        activityRepo.save(activity);
    }

    // ─────────────────────────────────────────────
    // 2. Log a completed focus session (upsert)
    // ─────────────────────────────────────────────
    public void logFocusSession(String username, long focusSeconds, int sessions) {
        LocalDate today = LocalDate.now();
        UserActivity activity = activityRepo
                .findByUsernameAndActivityDate(username, today)
                .orElseGet(() -> {
                    UserActivity a = new UserActivity();
                    a.setUsername(username);
                    a.setActivityDate(today);
                    return a;
                });
        activity.setFocusSeconds(activity.getFocusSeconds() + focusSeconds);
        activity.setSessionCount(activity.getSessionCount() + sessions);
        activityRepo.save(activity);
    }

    // ─────────────────────────────────────────────
    // 3. Build full dashboard stats for a user
    // ─────────────────────────────────────────────
    public Map<String, Object> getDashboardStats(String username) {
        LocalDate today = LocalDate.now();
        LocalDate yearAgo = today.minusYears(1);

        // All activity in last 12 months
        List<UserActivity> allActivity = activityRepo
                .findByUsernameAndActivityDateBetween(username, yearAgo, today);

        // Build a map of date → focusSeconds for quick lookup
        Map<LocalDate, Long> focusMap = allActivity.stream()
                .collect(Collectors.toMap(UserActivity::getActivityDate, UserActivity::getFocusSeconds));

        // ── Current Streak ──
        int currentStreak = 0;
        LocalDate cursor = today;
        while (true) {
            Long secs = focusMap.get(cursor);
            // Count today even if only logged in (loginCount > 0 means active day)
            boolean active = (secs != null && secs > 0);
            if (!active) {
                // Also count if user logged in today (loginCount > 0)
                Optional<UserActivity> opt = activityRepo.findByUsernameAndActivityDate(username, cursor);
                active = opt.isPresent() && opt.get().getLoginCount() > 0;
            }
            if (!active) break;
            currentStreak++;
            cursor = cursor.minusDays(1);
        }

        // ── Max Streak ──
        List<UserActivity> allSorted = activityRepo.findByUsernameOrderByActivityDateAsc(username);
        int maxStreak = 0, tempStreak = 0;
        LocalDate prev = null;
        for (UserActivity a : allSorted) {
            boolean active = a.getFocusSeconds() > 0 || a.getLoginCount() > 0;
            if (!active) { tempStreak = 0; prev = null; continue; }
            if (prev == null || a.getActivityDate().equals(prev.plusDays(1))) {
                tempStreak++;
            } else {
                tempStreak = 1;
            }
            maxStreak = Math.max(maxStreak, tempStreak);
            prev = a.getActivityDate();
        }

        // ── Focus time today ──
        long focusSecondsToday = focusMap.getOrDefault(today, 0L);

        // ── Task counts (real from DB) ──
        List<Task> tasks = taskRepo.findByUsername(username);
        long completedTasks = tasks.stream().filter(Task::isCompleted).count();
        long pendingTasks = tasks.stream().filter(t -> !t.isCompleted()).count();

        // ── Weekly data (last 7 days) ──
        List<Map<String, Object>> weeklyData = new ArrayList<>();
        for (int i = 6; i >= 0; i--) {
            LocalDate day = today.minusDays(i);
            Map<String, Object> entry = new HashMap<>();
            entry.put("date", day.toString());
            entry.put("focusSeconds", focusMap.getOrDefault(day, 0L));
            weeklyData.add(entry);
        }

        // ── Heatmap data (last 12 months, date → focusSeconds) ──
        Map<String, Long> heatmapData = new LinkedHashMap<>();
        for (UserActivity a : allActivity) {
            heatmapData.put(a.getActivityDate().toString(), a.getFocusSeconds());
        }

        // ── Total active days ──
        long totalActiveDays = allActivity.stream()
                .filter(a -> a.getFocusSeconds() > 0 || a.getLoginCount() > 0)
                .count();

        // ── Total hours in past year ──
        long totalSecondsYear = allActivity.stream().mapToLong(UserActivity::getFocusSeconds).sum();

        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("currentStreak", currentStreak);
        stats.put("maxStreak", maxStreak);
        stats.put("focusSecondsToday", focusSecondsToday);
        stats.put("tasksCompleted", completedTasks);
        stats.put("tasksPending", pendingTasks);
        stats.put("tasksTotal", tasks.size());
        stats.put("weeklyData", weeklyData);
        stats.put("heatmapData", heatmapData);
        stats.put("totalActiveDays", totalActiveDays);
        stats.put("totalHoursYear", Math.round(totalSecondsYear / 3600.0 * 10.0) / 10.0);

        return stats;
    }
}
