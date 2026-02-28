import { Activity, Baby, BarChart2, HeartHandshake } from "lucide-react";

import { Card, CardContent, Separator } from "@/components/ui";
import type { Contraction, WeightEntry } from "@/types";
import type { KickEntry } from "@/hooks";
import { DUE_DATE } from "@/constants";
import { calculateTimeInfo, startOfWeek } from "@/utils";

interface SummaryTabProps {
  kicks: KickEntry[];
  weights: WeightEntry[];
  contractions: Contraction[];
}

const getWeekRangeLabel = () => {
  const { weeks, days } = calculateTimeInfo();
  return `Week ${weeks}${days > 0 ? ` + ${days}d` : ""}`;
};

const getKicksThisWeek = (kicks: KickEntry[]) => {
  if (kicks.length === 0) return { total: 0, average: 0 };

  const now = new Date();
  const weekStart = startOfWeek(now);
  const recent = kicks.filter(
    (k) => new Date(k.date) >= weekStart,
  );

  if (recent.length === 0) return { total: 0, average: 0 };

  const total = recent.length;

  const dates = new Set(recent.map((k) => k.date));
  const daysCount = Math.max(1, dates.size);

  const average = Math.round((total / daysCount) * 10) / 10;

  return { total, average };
};

const getWeightSummary = (weights: WeightEntry[]) => {
  if (weights.length === 0) {
    return {
      current: null,
      gained: null,
      trend: "Not enough data",
    };
  }

  const sorted = [...weights].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
  );

  const first = sorted[0];
  const last = sorted[sorted.length - 1];

  const gained = last.weight - first.weight;

  const lastThree = sorted.slice(-3);
  const firstThree = lastThree[0].weight;
  const lastThreeLast = lastThree[lastThree.length - 1].weight;
  const diff = lastThreeLast - firstThree;

  let trend = "Stable";
  if (diff > 0.3) trend = "Gaining";
  else if (diff < -0.3) trend = "Losing";

  return {
    current: last.weight,
    gained,
    trend,
  };
};

const getContractionSummary = (contractions: Contraction[]) => {
  const completed = contractions.filter((c) => c.endTime && c.duration);
  if (completed.length === 0) {
    return {
      hasSession: false,
      text: "No active session",
      detail: "Start tracking contractions when labor begins to see a summary here.",
    };
  }

  const count = completed.length;
  const first = completed[0];
  const last = completed[completed.length - 1];
  const durationMinutes =
    ((last.endTime ?? last.startTime).getTime() - first.startTime.getTime()) /
    1000 /
    60;

  return {
    hasSession: true,
    text: `${count} contractions logged`,
    detail: `Last session spanned about ${Math.round(durationMinutes)} minutes.`,
  };
};

const getMotivationalMessage = () => {
  const { weeks } = calculateTimeInfo();

  if (weeks < 14) {
    return "First trimester: tiny flutters, big changes. You're building something incredible—one day at a time.";
  }

  if (weeks < 28) {
    return "Second trimester: your energy is returning and baby is growing strong. You're doing an amazing job.";
  }

  if (weeks < 37) {
    return "Third trimester: you're in the home stretch. Rest when you can and trust your instincts—you know your baby best.";
  }

  return "Any day now. Breathe, lean on your support system, and remember: you and baby are a powerful team.";
};

export const SummaryTab = ({
  kicks,
  weights,
  contractions,
}: SummaryTabProps) => {
  const { daysToGo, weeks, days } = calculateTimeInfo();
  const progress = Math.min(1, weeks / 40);
  const kicksThisWeek = getKicksThisWeek(kicks);
  const weightSummary = getWeightSummary(weights);
  const contractionSummary = getContractionSummary(contractions);
  const message = getMotivationalMessage();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <div className="rounded bg-purple-100 p-1.5">
          <BarChart2 className="h-4 w-4 text-purple-600" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Overview</h2>
          <p className="text-xs text-gray-500">
            A quick snapshot of how you and baby are doing.
          </p>
        </div>
      </div>

      <Card className="shadow-md border-0">
        <CardContent className="space-y-4 pt-4">
          <div className="flex flex-col gap-1.5">
            <div className="text-xs font-medium text-gray-500">
              Due date
            </div>
            <div className="text-sm font-semibold text-gray-800">
              {DUE_DATE.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </div>
            <div className="text-xs text-gray-500">
              {getWeekRangeLabel()} • {daysToGo} days to go
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-purple-700">
                Pregnancy progress
              </span>
              <span className="text-gray-500">
                {weeks}w{days > 0 ? ` + ${days}d` : ""} / 40w
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-purple-100">
              <div
                className="h-full rounded-full bg-linear-to-r from-pink-500 via-purple-500 to-blue-500"
                style={{ width: `${progress * 100}%` }}
              />
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <Card className="shadow-sm border-0 bg-pink-50/80">
              <CardContent className="flex gap-3 py-3">
                <div className="mt-1 rounded-full bg-pink-100 p-2">
                  <Baby className="h-4 w-4 text-pink-600" />
                </div>
                <div className="space-y-1">
                  <div className="text-xs font-semibold uppercase tracking-wide text-pink-600">
                    Kicks this week
                  </div>
                  <div className="text-sm font-semibold text-gray-900">
                    {kicksThisWeek.total} total
                  </div>
                  <div className="text-xs text-gray-600">
                    Avg {kicksThisWeek.average} kicks/day
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-0 bg-blue-50/80">
              <CardContent className="flex gap-3 py-3">
                <div className="mt-1 rounded-full bg-blue-100 p-2">
                  <Activity className="h-4 w-4 text-blue-600" />
                </div>
                <div className="space-y-1">
                  <div className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                    Weight
                  </div>
                  <div className="text-sm font-semibold text-gray-900">
                    {weightSummary.current == null
                      ? "No data yet"
                      : `${weightSummary.current.toFixed(1)} kg`}
                  </div>
                  <div className="text-xs text-gray-600">
                    {weightSummary.gained == null
                      ? "Log at least 2 entries to see changes."
                      : `Total gained: ${
                          weightSummary.gained >= 0 ? "+" : ""
                        }${weightSummary.gained.toFixed(1)} kg • Trend: ${
                          weightSummary.trend
                        }`}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-0 bg-red-50/80">
              <CardContent className="flex gap-3 py-3">
                <div className="mt-1 rounded-full bg-red-100 p-2">
                  <HeartHandshake className="h-4 w-4 text-red-600" />
                </div>
                <div className="space-y-1">
                  <div className="text-xs font-semibold uppercase tracking-wide text-red-600">
                    Contractions
                  </div>
                  <div className="text-sm font-semibold text-gray-900">
                    {contractionSummary.text}
                  </div>
                  <div className="text-xs text-gray-600">
                    {contractionSummary.detail}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Separator />

          <div className="rounded-lg bg-linear-to-br from-pink-50 via-purple-50 to-blue-50 p-4 text-xs leading-relaxed text-gray-700">
            {message}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

