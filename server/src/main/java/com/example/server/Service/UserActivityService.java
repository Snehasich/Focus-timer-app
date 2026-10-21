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
    // 1. Record today's app visit / open (ONLY today, no fake past days)
    // ─────────────────────────────────────────────
    public void logVisit(String username) {
        if (username == null || username.trim().isEmpty() || "Guest".equalsIgnoreCase(username)) {
            return;
        }

        LocalDate today = LocalDate.now();
        UserActivity activity = activityRepo
                .findByUsernameIgnoreCaseAndActivityDate(username.trim(), today)
                .orElseGet(() -> {
                    UserActivity a = new UserActivity();
                    a.setUsername(username);
                    a.setActivityDate(today);
                    a.setLoginCount(0);
                    a.setFocusSeconds(0);
                    a.setSessionCount(0);
                    return a;
                });

        activity.setLoginCount(activity.getLoginCount() + 1);
        activityRepo.save(activity);
    }

    // Overload for backward compatibility
    public void logVisit(String username, int streak) {
        logVisit(username);
    }

    // ─────────────────────────────────────────────
    // 2. Log a completed focus session (upsert)
    // ─────────────────────────────────────────────
    public void logFocusSession(String username, long focusSeconds, int sessions) {
        if (username == null || username.trim().isEmpty() || "Guest".equalsIgnoreCase(username)) {
            return;
        }

        LocalDate today = LocalDate.now();
        UserActivity activity = activityRepo
                .findByUsernameIgnoreCaseAndActivityDate(username.trim(), today)
                .orElseGet(() -> {
                    UserActivity a = new UserActivity();
                    a.setUsername(username);
                    a.setActivityDate(today);
                    a.setLoginCount(1);
                    a.setFocusSeconds(0);
                    a.setSessionCount(0);
                    return a;
                });

        activity.setFocusSeconds(activity.getFocusSeconds() + focusSeconds);
        activity.setSessionCount(activity.getSessionCount() + sessions);
        activityRepo.save(activity);
    }

    // ─────────────────────────────────────────────
    // 3. Build full dashboard stats for a user (100% REAL DATA)
    // ─────────────────────────────────────────────
    public Map<String, Object> getDashboardStats(String username) {
        LocalDate today = LocalDate.now();
        LocalDate yearAgo = today.minusYears(1);

        // Record today's visit when fetching dashboard
        logVisit(username);

        // All activity in last 12 months for this user
        List<UserActivity> allActivity = activityRepo
                .findByUsernameIgnoreCaseAndActivityDateBetween(username.trim(), yearAgo, today);

        // Map date -> activity
        Map<LocalDate, UserActivity> activityMap = allActivity.stream()
                .collect(Collectors.toMap(UserActivity::getActivityDate, a -> a, (a, b) -> a));

        // ── Current Streak (Real consecutive days up to today or yesterday) ──
        int currentStreak = 0;
        UserActivity todayAct = activityMap.get(today);
        boolean activeToday = todayAct != null && (todayAct.getLoginCount() > 0 || todayAct.getFocusSeconds() > 0);

        LocalDate cursor = activeToday ? today : today.minusDays(1);
        while (true) {
            UserActivity act = activityMap.get(cursor);
            boolean active = act != null && (act.getLoginCount() > 0 || act.getFocusSeconds() > 0);
            if (!active) break;
            currentStreak++;
            cursor = cursor.minusDays(1);
        }

        // ── Max Streak (Real maximum consecutive streak in history) ──
        List<UserActivity> allSorted = activityRepo.findByUsernameIgnoreCaseOrderByActivityDateAsc(username.trim());
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

        // ── Year totals (Real sums) ──
        long totalSecondsYear = allActivity.stream().mapToLong(UserActivity::getFocusSeconds).sum();
        double totalHoursYear = Math.round((totalSecondsYear / 3600.0) * 10.0) / 10.0;
        long totalActiveDays = allActivity.stream()
                .filter(a -> a.getFocusSeconds() > 0 || a.getLoginCount() > 0)
                .count();

        // ── Focus time today ──
        long focusSecondsToday = todayAct != null ? todayAct.getFocusSeconds() : 0L;

        // ── Task counts (real from DB for this user) ──
        List<Task> tasks = taskRepo.findByUsernameIgnoreCase(username.trim());
        long completedTasks = tasks.stream().filter(Task::isCompleted).count();
        long totalTasks = tasks.size();

        // ── Weekly data (last 7 days - real numbers) ──
        List<Map<String, Object>> weeklyData = new ArrayList<>();
        String[] dayNames = {"Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"};
        for (int i = 6; i >= 0; i--) {
            LocalDate day = today.minusDays(i);
            Map<String, Object> entry = new HashMap<>();
            entry.put("date", day.toString());
            entry.put("dayName", dayNames[day.getDayOfWeek().getValue() % 7]);
            UserActivity a = activityMap.get(day);
            long sec = a != null ? a.getFocusSeconds() : 0L;
            entry.put("focusMins", Math.round(sec / 60.0));
            entry.put("focusSeconds", sec);
            weeklyData.add(entry);
        }

        // ── Heatmap Data (ONLY days with real user activity) ──
        List<Map<String, Object>> heatmap = allActivity.stream()
                .filter(a -> a.getFocusSeconds() > 0 || a.getLoginCount() > 0)
                .map(a -> {
                    Map<String, Object> m = new HashMap<>();
                    m.put("date", a.getActivityDate().toString());
                    m.put("focusSeconds", a.getFocusSeconds());
                    m.put("sessionCount", a.getSessionCount());
                    m.put("loginCount", a.getLoginCount());
                    m.put("isActive", true);
                    return m;
                }).collect(Collectors.toList());

        Map<String, Object> result = new HashMap<>();
        result.put("username", username);
        result.put("currentStreak", currentStreak);
        result.put("maxStreak", maxStreak);
        result.put("activeDays", totalActiveDays);
        result.put("totalActiveDays", totalActiveDays);
        result.put("totalHoursYear", totalHoursYear);
        result.put("totalFocusSecondsYear", totalSecondsYear);
        result.put("focusSecondsToday", focusSecondsToday);
        result.put("completedTasks", completedTasks);
        result.put("tasksCompleted", completedTasks);
        result.put("totalTasks", totalTasks);
        result.put("tasksTotal", totalTasks);
        result.put("weeklyData", weeklyData);
        result.put("heatmap", heatmap);

        return result;
    }
}
