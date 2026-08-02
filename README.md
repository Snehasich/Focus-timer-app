<div align="center">

# ⚡ FocusFlow — Next-Gen Productivity & Focus Suite

[![React](https://img.shields.io/badge/React-19.2-blue?logo=react&logoColor=61DAFB)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-7.3-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.2-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.3-6DB33F?logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![Java](https://img.shields.io/badge/Java-17%2B-ED8B00?logo=openjdk&logoColor=white)](https://www.oracle.com/java/)
[![JWT](https://img.shields.io/badge/Security-JWT_Auth-black?logo=jsonwebtokens)](https://jwt.io/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

**FocusFlow** is a modern, high-performance, full-stack productivity web application designed to help students, developers, and professionals build deep work habits, track tasks, and monitor focus consistency in real-time.

[Explore Features](#-key-features) • [Tech Stack](#%EF%B8%8F-technology-stack) • [Quick Start](#-quick-start) • [API Documentation](#-api-endpoints)

---

</div>

## 📖 Overview

FocusFlow combines a **Pomodoro Focus & Break Engine**, **Task Management System**, **LeetCode-Style Activity Heatmap**, **Interactive Notes Workspace**, **Precision StopWatch**, and **Calendar Schedule** into a single cohesive, ultra-sleek workspace. Built with a mobile-first responsive architecture, FocusFlow seamlessly transitions between desktop workstations and one-handed mobile devices.

---

## ✨ Key Features

### ⏱️ 1. Pomodoro Focus & Break Engine
- **Vibrant Circular Timer**: Animated SVG progress ring with electric blue/emerald glow filters and leading dot indicator.
- **Customizable Durations**: Quick presets (15m, 25m, 45m, 60m focus / 5m, 10m, 15m break) or custom minute inputs via slide-in drawer settings.
- **Mode Switching Safety**: Confirmation prompts when attempting to switch modes while a timer is running.
- **Session Counters**: Tracks completed pomodoro cycles per session (`🔁 N sessions done`).

### ⏱️ 2. Precision StopWatch
- **Millisecond Accuracy**: High-resolution `requestAnimationFrame` timer displaying `HH:MM:SS.ms`.
- **Lap Recording**: Capture split times and view lap history.
- **Performance Highlights**: Automatic highlighting of fastest (green) and slowest (red) laps.

### 📋 3. Task Management & Workstation
- **Optimistic Task Execution**: Instant UI feedback on task addition, completion toggling, and deletion.
- **Advanced Filtering & Sorting**: Filter by *All Tasks*, *Active Only*, or *Completed Only*. Sort alphabetically (A-Z / Z-A) or by completion status.
- **Bulk Actions**: One-click operations to *Mark All Completed*, *Mark All Active*, or *Reset All Tasks*.

### 📊 4. Real-Time Analytics & LeetCode Heatmap
- **12-Month Heatmap**: 52-week activity grid visualizing daily focus minutes with green intensity levels.
- **Daily Streak Tracking**: Dynamic streak calculation (`🔥 N Day Streak`) that automatically updates and syncs with the database.
- **Weekly Focus Chart**: Real-time bar chart showing daily focus hours for the current week (Sun–Sat).
- **Daily Goal Progress**: Visual progress bar tracking completion towards a customizable 4-hour daily goal.

### 📓 5. Rich Notes & Knowledge Workspace
- **Markdown Notes Editor**: Clean editor interface with word count, reading time estimation, and tag management.
- **Star Favorites & Tag Filtering**: Mark notes as favorites and filter notes by custom hashtags.
- **File Attachments**: Drag-and-drop file attachment support for notes.

### 📅 6. Interactive Calendar View
- **Monthly Schedule**: Month-by-month grid rendering schedule events and historical focus activity dots.
- **Quick Navigation**: Prev/Next month navigation with instant `Today` jump.

### 📱 7. Responsive Mobile & Desktop Layouts
- **Desktop (≥ 1024px)**: 2-column side-by-side workstation layout with collapsible sidebar (`Side.jsx`).
- **Mobile (< 1024px)**: Dedicated mobile-first vertical stack view (`MobileHomeView.jsx`) paired with a translucent frosted-glass floating bottom navbar (`MobileBottomNav.jsx`).

### 🌗 8. Dark & Light Theme System
- Complete dark mode (`#0b0b0b` / `#161616`) and light mode (`#ffffff` / `#f8fafc`) theme switching powered by `ThemeContext`.

---

## 🛠️ Technology Stack

### **Frontend**
- **Core Framework**: React 19 + Vite 7
- **Styling**: Tailwind CSS v4 (`@tailwindcss/vite`), Vanilla CSS tokens, Lucide Icons
- **HTTP Client**: Axios with request interceptors for JWT authorization header injection
- **Routing**: React Router 7 (`BrowserRouter`, `Routes`, `Route`)

### **Backend**
- **Framework**: Spring Boot 3.3.5 (Java 17+)
- **Security**: Spring Security + JSON Web Token (JWT) stateless authentication
- **Persistence**: Spring Data JPA + H2 Database (in-memory / local storage) / MySQL Connector
- **Build System**: Apache Maven

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** (v18.0 or higher) & **npm**
- **Java Development Kit (JDK)** (17 or higher)

---

### 1. Clone the Repository
```bash
git clone https://github.com/Snehasich/Focus-timer-app.git
cd Focus-timer-app
```

---

### 2. Run the Frontend (Client)
```bash
cd client
npm install
npm run dev
```
The frontend Vite server will start at `http://localhost:5173/`.

---

### 3. Run the Backend (Server)
```bash
cd ../server
./mvnw spring-boot:run
```
The Spring Boot backend REST server will start at `http://localhost:8080/`.

---

## 📡 API Endpoints

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/auth/register` | Register a new user account | ❌ |
| `POST` | `/api/auth/login` | Authenticate user & receive JWT token | ❌ |
| `GET` | `/tasks` | Fetch all tasks for authenticated user | ✅ |
| `POST` | `/tasks` | Create a new task | ✅ |
| `PUT` | `/tasks/{id}` | Update task text or completion status | ✅ |
| `DELETE` | `/tasks/{id}` | Delete task by ID | ✅ |
| `POST` | `/activity/login` | Log daily login visit & sync streak count | ✅ |
| `POST` | `/activity/log` | Log completed focus session seconds | ✅ |
| `GET` | `/activity/stats` | Fetch full user dashboard stats & heatmap | ✅ |

---

## 📂 Project Structure

```
Focus-timer-app/
├── client/                     # Frontend React Application
│   ├── src/
│   │   ├── api/                # Axios instance & interceptors
│   │   ├── assets/             # Branding logos & icons
│   │   ├── components/         # Modular UI Components
│   │   │   ├── CalendarView.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Dropdown.jsx
│   │   │   ├── InsideTask.jsx
│   │   │   ├── MobileBottomNav.jsx
│   │   │   ├── MobileHomeView.jsx
│   │   │   ├── NotesView.jsx
│   │   │   ├── Side.jsx
│   │   │   ├── TaskRoute.jsx
│   │   │   ├── TaskRoute_Task.jsx
│   │   │   └── Timer/          # Focus, Break & StopWatch components
│   │   ├── context/            # Theme & Timer React Contexts
│   │   ├── pages/              # Login, Register & Tasks pages
│   │   ├── services/           # Activity & Auth API services
│   │   ├── App.jsx             # Main App layout & routes
│   │   └── index.css           # Global Tailwind CSS imports
│   └── package.json
└── server/                     # Backend Spring Boot Application
    ├── src/main/java/com/example/server/
    │   ├── config/             # Security & JWT Filters
    │   ├── controller/         # REST Controllers
    │   ├── entity/             # JPA Entities (Users, Task, UserActivity)
    │   ├── repo/               # Spring Data Repositories
    │   └── service/            # Business Logic Services
    └── pom.xml
```

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check out the [Issues page](https://github.com/Snehasich/Focus-timer-app/issues).

---

## 📄 License

This project is licensed under the **MIT License**.