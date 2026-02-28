import type { KickEntry } from "@/hooks";

export interface DailySummary {
  date: string;
  kickCount: number;
  timeTo10Kicks?: string | null;
}

export interface WeightEntry {
  id: string;
  date: string; // ISO date string YYYY-MM-DD
  timestamp: string; // full ISO timestamp
  weight: number; // in kg
  weekNumber: number; // pregnancy week at time of entry
}

export interface Contraction {
  id: string;
  startTime: Date;
  endTime?: Date;
  duration?: number; // seconds
  interval?: number; // seconds since last contraction ended
}

export type TimeRangeFilter = "today" | "week" | "all";

export type TabKey = "kicks" | "weight" | "contractions" | "summary";

export type { KickEntry };

