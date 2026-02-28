import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, HeartPulse, TimerReset } from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent, Button, Separator } from "@/components/ui";
import type { Contraction } from "@/types";

interface ContractionsTabProps {
  contractions: Contraction[];
  onChange: (next: Contraction[]) => void;
}

const formatSeconds = (seconds: number | undefined) => {
  if (!seconds && seconds !== 0) return "-";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  if (mins === 0) return `${secs}s`;
  return `${mins}m ${secs.toString().padStart(2, "0")}s`;
};

const formatTime = (date: Date) =>
  date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

const getCompletedContractions = (contractions: Contraction[]) =>
  contractions.filter((c) => c.endTime && c.duration);

const getStats = (contractions: Contraction[]) => {
  const completed = getCompletedContractions(contractions);
  if (completed.length === 0) {
    return {
      lastDuration: undefined,
      lastInterval: undefined,
      avgDuration: undefined,
      avgInterval: undefined,
    };
  }

  const last = completed[completed.length - 1];
  const recent = completed.slice(-5);

  const avgDuration =
    recent.reduce((sum, c) => sum + (c.duration ?? 0), 0) / recent.length;

  const intervals = recent
    .map((c) => c.interval)
    .filter((v): v is number => typeof v === "number");

  const avgInterval =
    intervals.length === 0
      ? undefined
      : intervals.reduce((sum, v) => sum + v, 0) / intervals.length;

  return {
    lastDuration: last.duration,
    lastInterval: last.interval,
    avgDuration,
    avgInterval,
  };
};

const getGuidance = (contractions: Contraction[]) => {
  const completed = getCompletedContractions(contractions);
  if (completed.length < 2) {
    return {
      level: "green" as const,
      title: "Keep tracking",
      message: "Log a few contractions to see guidance based on the 5-1-1 rule.",
    };
  }

  const recent = completed.slice(-5);
  const last = recent[recent.length - 1];

  const durationOk = (last.duration ?? 0) > 60;
  const intervalSeconds = last.interval ?? Infinity;

  const windowStart = recent[0].startTime;
  const windowEnd = last.endTime ?? last.startTime;
  const windowMinutes =
    (windowEnd.getTime() - windowStart.getTime()) / 1000 / 60;

  if (durationOk && intervalSeconds < 5 * 60 && windowMinutes >= 60) {
    return {
      level: "red" as const,
      title: "5-1-1 met — go now",
      message:
        "Contractions are less than 5 minutes apart, lasting more than 1 minute, and have been consistent for over an hour. It's time to go to the hospital or call your provider.",
    };
  }

  if (intervalSeconds < 7 * 60) {
    return {
      level: "yellow" as const,
      title: "Getting close",
      message:
        "Contractions are getting closer together. Keep timing them and get ready to go when they reach the 5-1-1 pattern.",
    };
  }

  return {
    level: "green" as const,
    title: "Not yet",
    message:
      "Contractions are still spaced out. Keep tracking and follow your provider's advice for when to go in.",
  };
};

export const ContractionsTab = ({
  contractions,
  onChange,
}: ContractionsTabProps) => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    let interval: number | undefined;
    if (activeId) {
      interval = window.setInterval(() => {
        const active = contractions.find((c) => c.id === activeId);
        if (active) {
          setElapsed(
            (Date.now() - active.startTime.getTime()) / 1000,
          );
        }
      }, 500);
    } else {
      setElapsed(0);
    }

    return () => {
      if (interval) window.clearInterval(interval);
    };
  }, [activeId, contractions]);

  const stats = useMemo(() => getStats(contractions), [contractions]);
  const guidance = useMemo(() => getGuidance(contractions), [contractions]);

  const handleStartStop = () => {
    if (!activeId) {
      const now = new Date();
      const newContraction: Contraction = {
        id: crypto.randomUUID(),
        startTime: now,
      };
      onChange([...contractions, newContraction]);
      setActiveId(newContraction.id);
      setElapsed(0);
    } else {
      const now = new Date();
      const updated = contractions.map((c) => {
        if (c.id !== activeId) return c;

        const duration = (now.getTime() - c.startTime.getTime()) / 1000;

        const previousCompleted = getCompletedContractions(
          contractions.filter((x) => x.id !== activeId),
        );
        const lastCompleted =
          previousCompleted[previousCompleted.length - 1];

        const interval =
          lastCompleted && lastCompleted.endTime
            ? (now.getTime() - lastCompleted.endTime.getTime()) / 1000
            : undefined;

        return {
          ...c,
          endTime: now,
          duration,
          interval,
        };
      });

      onChange(updated);
      setActiveId(null);
      setElapsed(0);
      toast.success("Contraction recorded.");
    }
  };

  const handleClear = () => {
    onChange([]);
    setActiveId(null);
    setElapsed(0);
    toast.success("Contraction history cleared.");
  };

  const active = activeId
    ? contractions.find((c) => c.id === activeId)
    : undefined;

  const formattedElapsed = formatSeconds(elapsed);

  const list = [...contractions]
    .filter((c) => c.endTime)
    .sort(
      (a, b) =>
        (b.startTime?.getTime() ?? 0) - (a.startTime?.getTime() ?? 0),
    )
    .slice(0, 20);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <div className="rounded bg-red-100 p-1.5">
          <HeartPulse className="h-4 w-4 text-red-500" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Contraction Timer</h2>
          <p className="text-xs text-gray-500">
            Track duration and spacing to follow the 5-1-1 rule.
          </p>
        </div>
      </div>

      <Card className="shadow-md border-0">
        <CardContent className="space-y-4 pt-4">
          <div className="flex flex-col items-center gap-3">
            <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
              {active ? "Contraction in progress" : "Ready when you are"}
            </div>
            <div className="text-4xl font-mono font-semibold text-purple-700">
              {formattedElapsed}
            </div>
            <Button
              size="lg"
              className={`mt-2 w-48 rounded-full text-base font-semibold ${
                active
                  ? "bg-red-500 hover:bg-red-600"
                  : "bg-green-500 hover:bg-green-600"
              }`}
              onClick={handleStartStop}
            >
              {active ? "Stop Contraction" : "Start Contraction"}
            </Button>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-3 text-center text-xs">
            <div className="rounded-lg bg-purple-50 px-2 py-3">
              <div className="mb-1 text-[11px] font-medium text-purple-600">
                Last Duration
              </div>
              <div className="text-sm font-semibold">
                {formatSeconds(stats.lastDuration)}
              </div>
            </div>
            <div className="rounded-lg bg-purple-50 px-2 py-3">
              <div className="mb-1 text-[11px] font-medium text-purple-600">
                Last Interval
              </div>
              <div className="text-sm font-semibold">
                {formatSeconds(stats.lastInterval)}
              </div>
            </div>
            <div className="rounded-lg bg-blue-50 px-2 py-3">
              <div className="mb-1 text-[11px] font-medium text-blue-600">
                Avg Duration (last 5)
              </div>
              <div className="text-sm font-semibold">
                {formatSeconds(stats.avgDuration)}
              </div>
            </div>
            <div className="rounded-lg bg-blue-50 px-2 py-3">
              <div className="mb-1 text-[11px] font-medium text-blue-600">
                Avg Interval (last 5)
              </div>
              <div className="text-sm font-semibold">
                {formatSeconds(stats.avgInterval)}
              </div>
            </div>
          </div>

          <div
            className={`flex items-start gap-2 rounded-lg border px-3 py-2 text-xs ${
              guidance.level === "red"
                ? "border-red-300 bg-red-50 text-red-700"
                : guidance.level === "yellow"
                  ? "border-amber-300 bg-amber-50 text-amber-700"
                  : "border-emerald-300 bg-emerald-50 text-emerald-700"
            }`}
          >
            <AlertTriangle className="mt-0.5 h-4 w-4" />
            <div>
              <div className="text-xs font-semibold">{guidance.title}</div>
              <p className="text-[11px] leading-snug">{guidance.message}</p>
            </div>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold">Recent contractions</span>
            <button
              type="button"
              onClick={handleClear}
              className="flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-gray-700"
            >
              <TimerReset className="h-3 w-3" />
              Clear All
            </button>
          </div>

          <div className="max-h-64 space-y-2 overflow-y-auto rounded-lg border bg-white px-3 py-2">
            {list.length === 0 ? (
              <div className="py-6 text-center text-xs text-gray-500">
                No contractions recorded yet.
              </div>
            ) : (
              list.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between rounded-md bg-gray-50 px-3 py-2 text-xs"
                >
                  <div className="flex flex-col">
                    <span className="font-medium">
                      Started at {formatTime(c.startTime)}
                    </span>
                    {c.endTime && (
                      <span className="text-[11px] text-gray-500">
                        Ended at {formatTime(c.endTime)}
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">
                      {formatSeconds(c.duration)}
                    </div>
                    <div className="text-[11px] text-gray-500">
                      Interval: {formatSeconds(c.interval)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

