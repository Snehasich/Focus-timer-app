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
    // 1. Record today's login visit and sync streak days (upsert)
    // ─────────────────────────────────────────────
    public void logVisit(String username, int streak) {
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

        // Ensure past streak days (up to streak count) exist in DB for this user
        int daysToSync = Math.max(1, Math.min(streak, 365));
        for (int i = 0; i < daysToSync; i++) {
            LocalDate date = today.minusDays(i);
            Optional<UserActivity> opt = activityRepo.findByUsernameAndActivityDate(username, date);
            if (opt.isEmpty()) {
                UserActivity past = new UserActivity();
                past.setUsername(username);
                past.setActivityDate(date);
                past.setLoginCount(1);
                past.setFocusSeconds(1800); // 30 mins focus for past streak day
                past.setSessionCount(1);
                activityRepo.save(past);
            }
        }
    }

    // Overload for default call
    public void logVisit(String username) {
        logVisit(username, 1);
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

        // All activity in last 12 months for this user
        List<UserActivity> allActivity = activityRepo
                .findByUsernameAndActivityDateBetween(username, yearAgo, today);

        // Build a map of date → focusSeconds for quick lookup
        Map<LocalDate, Long> focusMap = allActivity.stream()
                .collect(Collectors.toMap(UserActivity::getActivityDate, UserActivity::getFocusSeconds, (a, b) -> a));

        // ── Current Streak ──
        int currentStreak = 0;
        LocalDate cursor = today;
        while (true) {
            Long secs = focusMap.get(cursor);
            boolean active = (secs != null && secs > 0);
            if (!active) {
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
        maxStreak = Math.max(maxStreak, currentStreak);

        // ── Focus time today ──
        long focusSecondsToday = focusMap.getOrDefault(today, 0L);

        // ── Task counts (real from DB for this user) ──
        List<Task> tasks = taskRepo.findByUsername(username);
        long completedTasks = tasks.stream().filter(Task::isCompleted).count();
        long totalTasks = tasks.size();

        // ── Weekly data (last 7 days) ──
        List<Map<String, Object>> weeklyData = new ArrayList<>();
        String[] dayNames = {"Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"};
        for (int i = 6; i >= 0; i--) {
            LocalDate day = today.minusDays(i);
            Map<String, Object> entry = new HashMap<>();
            entry.put("date", day.toString());
            entry.put("dayName", dayNames[day.getDayOfWeek().getValue() % 7]);
            long sec = focusMap.getOrDefault(day, 0L);
            entry.put("focusMins", Math.round(sec / 60.0));
            weeklyData.add(entry);
        }

        // ── Heatmap Data ──
        List<Map<String, Object>> heatmap = allActivity.stream().map(a -> {
            Map<String, Object> m = new HashMap<>();
            m.put("date", a.getActivityDate().toString());
            m.put("focusSeconds", a.getFocusSeconds());
            m.put("sessionCount", a.getSessionCount());
            m.put("loginCount", a.getLoginCount());
            return m;
        }).collect(Collectors.toList());

        Map<String, Object> result = new HashMap<>();
        result.put("username", username);
        result.put("currentStreak", currentStreak);
        result.put("maxStreak", maxStreak);
        result.put("activeDays", allSorted.size());
        result.put("focusSecondsToday", focusSecondsToday);
        result.put("completedTasks", completedTasks);
        result.put("totalTasks", totalTasks);
        result.put("weeklyData", weeklyData);
        result.put("heatmap", heatmap);

        return result;
    }
}
