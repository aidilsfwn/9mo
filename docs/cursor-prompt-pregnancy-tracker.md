# Cursor Prompt: Pregnancy Tracker PWA Expansion

> One-shot prompt for expanding the kick counter React PWA into a full-featured pregnancy tracker with bottom tab navigation.

---

## Prompt

I'm building a React PWA pregnancy tracker app for mobile. The current app is a kick counter (`App.tsx`) with a history table (`HistoryTable.tsx`). I want to expand it into a full-featured pregnancy tracker with a **bottom tab navigation** (mobile-first). Do not change existing data persistence logic (`useKicks` hook, storage, etc.) — only expand the UI and add new features.

---

## Architecture

Refactor the app to use a bottom tab navigation with 4 tabs:

1. **Kicks** (baby icon) — existing kick counter, improved
2. **Weight** (scale icon) — new weight tracking tab
3. **Contractions** (timer icon) — new contraction tracker tab
4. **Summary** (chart icon) — overview/stats across all features

Use a persistent bottom nav bar (fixed to bottom, safe-area aware for iOS). Each tab renders its own full-screen view component. Active tab should be visually distinct (use existing pink/purple theme: `#ff78ae` for pink, purple-600 for purple).

---

## Tab 1 — Kicks (refactor existing)

Keep all existing logic. Add the following improvements:

**Enhanced Stats (today's card):**
- Add "Most Active Hour" — find the hour of day with the most kicks across all-time data
- Add "Avg Daily Kicks" — average kicks per day across all logged days
- Add a time range filter (Today / This Week / All Time) that filters the history table below

**History Table improvements:**
- Add the time range filter above the table (pill buttons: Today / This Week / All Time)
- Keep existing columns: Date, Kicks, 1st Kick, 10th Kick, Time to 10
- Keep existing pagination

---

## Tab 2 — Weight Tracker

**Data model** (persist using the same storage pattern as kicks):

```ts
interface WeightEntry {
  id: string;
  date: string;        // ISO date string YYYY-MM-DD
  timestamp: string;   // full ISO timestamp
  weight: number;      // in kg
  weekNumber: number;  // pregnancy week at time of entry (derive from existing calculateTimeInfo util or DUE_DATE constant)
}
```

**UI:**
- Input card at top: number input for weight (kg), date picker defaulting to today, a "Log Weight" button
- Stats row: Current Weight, Total Gained (vs first entry), Current Week
- Line chart (use `recharts`) showing weight over time — x-axis: week number, y-axis: weight in kg. Style with the pink/purple theme.
- History table with columns: Date, Weight (kg), Gained (delta from previous entry, show +/- with color), Week. Paginated (7 per page).

---

## Tab 3 — Contractions

**Purpose:** Help track contraction duration and interval (time between contractions) during labor.

**Data model** (in-memory only, no persistence needed — contractions are a one-session thing):

```ts
interface Contraction {
  id: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;  // seconds
  interval?: number;  // seconds since last contraction ended
}
```

**UI:**
- Large central button: toggles between "Start Contraction" and "Stop Contraction". While active, show a live elapsed timer (HH:MM:SS).
- Stats row below button: Last Duration, Last Interval, Avg Duration (last 5), Avg Interval (last 5)
- Guidance text: show a color-coded alert when contractions are frequent enough to go to hospital (contractions < 5 min apart, lasting > 1 min, for > 1 hour — the 5-1-1 rule). Green = not yet, Yellow = getting close (< 7 min apart), Red = go now (< 5 min apart, > 60s duration).
- Contraction history list (most recent first): show each contraction's start time, duration, and interval from previous. Max 20 entries shown. Include a "Clear All" button.

---

## Tab 4 — Summary

A read-only overview combining data from all features:

- Pregnancy progress: due date, days to go, current week/day, progress bar (0–40 weeks)
- Kicks this week (sum) + daily average this week
- Weight: current, total gained, trend (gaining/stable/losing based on last 3 entries)
- Contractions: show "No active session" or last session summary if contractions exist in state
- A motivational message at the bottom that changes based on trimester (derive from week number)

---

## Data Persistence — Firebase

All data is stored in Firebase (same setup already used by `useKicks`). When creating `useWeight.ts`, follow the **exact same Firebase patterns** as `useKicks.ts` — same Firestore collection structure, same real-time listener setup (`onSnapshot`), same add/remove function signatures. The weight collection should be named `"weights"`.

Do **not** introduce any new Firebase configuration — reuse the existing Firebase app instance from wherever it's currently initialized (likely `src/firebase.ts` or `src/lib/firebase.ts`). Do not use localStorage or any other storage mechanism for weight data.

Contractions remain **in-memory only** (no Firebase) since they're a single-session feature.

---

## General Requirements

- **Mobile-first**, everything should look great on a 390px wide screen
- Use existing UI component library (`@/components/ui`) and existing Tailwind theme
- Use existing `DUE_DATE` constant and `calculateTimeInfo()` utility for all week/day calculations
- Keep the existing header (logo + app name) visible across all tabs, above the tab content
- Bottom nav must not overlap content — add appropriate bottom padding to all tab content areas
- Use `lucide-react` for all icons
- TypeScript throughout, no `any` types
- Keep `Toaster` for all success/error feedback
- For the weight chart, use `recharts` (add import — it's likely already available or can be added)
- New hooks should follow the same pattern as `useKicks` for data persistence

---

## File Structure

Create/modify these files:

```
src/
  App.tsx                       # refactor to add tab nav, lift state
  components/
    BottomNav.tsx                # new
    tabs/
      KicksTab.tsx               # extracted + improved kicks UI
      WeightTab.tsx              # new
      ContractionsTab.tsx        # new
      SummaryTab.tsx             # new
    HistoryTable.tsx             # keep, minor filter additions
  hooks/
    useKicks.ts                  # unchanged
    useWeight.ts                 # new, same pattern as useKicks
  types/
    index.ts                     # shared types (WeightEntry, Contraction, etc.)
```

---

## Before Running This Prompt

Pin the following files in Cursor's context window so it can mirror your existing patterns accurately:

- `useKicks.ts`
- `firebase.ts` (or wherever your Firebase init lives)
- `calculateTimeInfo.ts` (or the file containing that util)
- `constants.ts` (for `DUE_DATE`)
- `components/ui/index.ts` (or the barrel export for your UI lib)

If `recharts` is not yet installed, add this before running: `npm install recharts`
