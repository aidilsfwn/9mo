# 9mo.

A mobile-first pregnancy tracker PWA built with React and Firebase. Tracks baby kicks, maternal weight, and labour contractions — with a live summary dashboard.

**Live:** https://9mo.netlify.app · https://9mo.aidilsfwn.dev

---

## Features

- **Kicks** — log fetal kicks with one tap, undo support, daily stats, peak hour, and history chart
- **Weight** — log weight over time with a line chart, gain tracking, and week-by-week history
- **Contractions** — start/stop timer with 5-1-1 rule guidance for labour
- **Summary** — pregnancy progress bar, days to go, and an overview of all tracked data

---

## Tech Stack

- React 19 + TypeScript
- Vite 7 + Tailwind CSS v4
- shadcn/ui + Lucide React + Recharts
- Firebase Firestore (real-time)
- Netlify (hosting) + vite-plugin-pwa

---

## Getting Started

### 1. Clone and install

```bash
git clone https://github.com/aidilsfwn/9mo.git
cd 9mo
yarn install
```

### 2. Set up environment variables

Copy `.env.example` to `.env.local` and fill in your Firebase config:

```bash
cp .env.example .env.local
```

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_MEASUREMENT_ID=
```

### 3. Update pregnancy constants

Edit `src/constants/index.ts` with the correct LMP and due date:

```ts
const LMP = new Date("2025-07-30");
const DUE_DATE = new Date("2026-05-12");
```

### 4. Configure Firestore rules

In Firebase Console → Firestore → Rules:

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

### 5. Run

```bash
yarn dev
```

---

## Deployment

Deployed on Netlify. Set the environment variables from `.env.local` in Netlify → Site → Environment variables (all deploy contexts).

---

## Project Structure

```
src/
├── App.tsx                      # Root layout, tab routing, global state
├── components/
│   ├── BottomNav.tsx            # Fixed bottom tab navigation
│   ├── HistoryChart.tsx         # Kicks bar chart
│   ├── HistoryTable.tsx         # Kicks history table
│   └── tabs/
│       ├── KicksTab.tsx         # Kick counter + stats + history
│       ├── WeightTab.tsx        # Weight logger + chart + history
│       ├── ContractionsTab.tsx  # Contraction timer + 5-1-1 guidance
│       └── SummaryTab.tsx       # Overview dashboard
├── constants/index.ts           # LMP, DUE_DATE, timing constants
├── hooks/
│   ├── useKicks.ts              # Firestore real-time kicks hook
│   └── useWeight.ts             # Firestore real-time weight hook
├── lib/
│   └── firebase.ts              # Firebase app init
├── types/index.ts               # Shared TypeScript types
└── utils/index.ts               # calculateTimeInfo, formatDate, startOfWeek
docs/
├── PRD.md                       # Full product requirements document
└── cursor-prompt-pregnancy-tracker.md
```

---

*For Nana, with all my love.*
