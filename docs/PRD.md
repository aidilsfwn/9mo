# Product Requirements Document — 9mo.

## Overview

**9mo.** is a mobile-first pregnancy tracker PWA built for a single user (Nana). It helps track baby kicks, maternal weight, and labour contractions throughout the pregnancy, with a real-time Firebase backend and an overview dashboard.

- **Live:** https://9mo.netlify.app / https://9mo.aidilsfwn.dev
- **Repo:** https://github.com/aidilsfwn/9mo (public)

---

## Goals

- Give a pregnant partner a simple, beautiful app to track the key data points her midwife cares about
- Work reliably on mobile (iOS Safari, Android Chrome) as a PWA
- Persist data in real-time across devices via Firebase Firestore
- Require zero login or account setup

---

## Non-Goals

- Multi-user / multi-pregnancy support
- Push notifications
- Export to PDF / CSV
- Backend logic beyond Firestore rules

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | React 19 + TypeScript |
| Build | Vite 7 |
| Styling | Tailwind CSS v4 |
| UI components | shadcn/ui (Radix primitives) |
| Charts | Recharts |
| Icons | Lucide React |
| Backend | Firebase Firestore (real-time) |
| Hosting | Netlify |
| PWA | vite-plugin-pwa |

---

## App Structure

The app uses a fixed bottom tab navigation with 4 tabs. A persistent header shows the app logo and tagline across all tabs.

### Tab 1 — Kicks

**Purpose:** Count and track fetal kick movements throughout the day.

**Features:**
- Large "Log Kick" button — writes to Firestore, shows a toast with an Undo action (5-second window)
- Today stats: kicks logged today, time of first kick, time to reach 10 kicks
- Overall stats: daily average kicks, most active hour of day (all-time)
- History with a time range filter: Today / This Week / All Time
- Bar chart visualising kick counts per day
- Paginated history table: Date, Kicks, 1st Kick, 10th Kick, Time to 10

**Data:** Persisted in Firestore `kicks` collection via `useKicks` hook with `onSnapshot` real-time listener.

---

### Tab 2 — Weight Tracker

**Purpose:** Log and visualise maternal weight gain throughout the pregnancy.

**Features:**
- Form: weight input (kg, step 0.1) + date picker (defaults to today) + Log Weight button
- Stats row: current weight, total gained (vs first entry), current pregnancy week
- Line chart: weight over time, x-axis = pregnancy week, y-axis = kg
- Weight trend label (last 3 entries): Gaining / Stable / Losing
- Paginated history table (7 per page): Date, Weight (kg), Gained (delta from previous entry, +/- coloured), Week
- Delete entry: trash icon → inline confirm (✓ / ✗) before deletion

**Data:** Persisted in Firestore `weights` collection via `useWeight` hook.

**Data model:**
```ts
interface WeightEntry {
  id: string;
  date: string;        // YYYY-MM-DD
  timestamp: string;   // ISO timestamp (for sort)
  weight: number;      // kg
  weekNumber: number;  // pregnancy week derived from LMP constant
}
```

---

### Tab 3 — Contraction Timer

**Purpose:** Time contractions during labour and surface the 5-1-1 rule guidance.

**Features:**
- Large Start / Stop button — toggles active contraction timing
- Live elapsed timer (updates every 500ms); turns red after 90 seconds
- Animated ping ring while contraction is active
- Stats: Last Duration, Last Interval, Avg Duration (last 5), Avg Interval (last 5)
- 5-1-1 guidance banner (colour-coded):
  - Green — not yet / keep tracking
  - Yellow — getting close (< 7 min intervals)
  - Red — 5-1-1 met, time to go to hospital
- Scrollable contraction history list (max 20 entries, most recent first)
- Clear All button to reset the session

**Data:** In-memory only (React state). Contractions are not persisted — they are a single-session feature.

---

### Tab 4 — Summary (default tab)

**Purpose:** At-a-glance overview of all tracking data.

**Features:**
- Due date + days to go counter
- Pregnancy progress bar (weeks / 40) with a 👶 emoji marker
- Current week + day label
- Kicks this week: total count + daily average
- Weight: current weight, total gained, trend label
- Contractions: session status (active count or "No session yet")
- Trimester-aware motivational message at the bottom

---

## Constants

Hardcoded in `src/constants/index.ts` — update these for each pregnancy:

```ts
const LMP = new Date("2025-07-30");       // Last Menstrual Period
const DUE_DATE = new Date("2026-05-12");  // Expected due date
```

All week/day calculations derive from these two values.

---

## Firebase Setup

- Project: `nana-kick-tracker`
- Database: Cloud Firestore
- Collections: `kicks`, `weights`
- Auth: none (no user authentication)
- Security rules: allow read/write for `kicks` and `weights` collections
- API key: restricted to production domains + localhost via Google Cloud Console HTTP referrer restrictions

### Required Firestore rules:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /kicks/{document=**} {
      allow read, write: if true;
    }
    match /weights/{document=**} {
      allow read, write: if true;
    }
  }
}
```

---

## Environment Variables

Config is loaded from `.env.local` (gitignored). See `.env.example` for required keys.

| Variable | Description |
|---|---|
| `VITE_FIREBASE_API_KEY` | Firebase API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase auth domain |
| `VITE_FIREBASE_PROJECT_ID` | Firestore project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | Storage bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Messaging sender ID |
| `VITE_FIREBASE_APP_ID` | Firebase app ID |
| `VITE_FIREBASE_MEASUREMENT_ID` | Analytics measurement ID |

---

## Known Limitations

- Due date and LMP are hardcoded constants — not configurable in the UI
- Contraction data is lost on page refresh (in-memory only by design)
- No offline support beyond PWA caching
- Single-user app — no access control beyond Firestore rules
