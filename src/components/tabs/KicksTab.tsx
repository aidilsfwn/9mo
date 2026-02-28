import { useMemo, useState } from "react";
import { Calendar, Baby } from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent, Skeleton, Separator } from "@/components/ui";
import { HistoryChart, HistoryTable, LogButton } from "@/components";
import type { KickEntry } from "@/hooks";
import { startOfWeek } from "@/utils";
import type { DailySummary, TimeRangeFilter } from "@/types";

interface KicksTabProps {
  kicks: KickEntry[];
  logging: boolean;
  onLogKick: () => Promise<void>;
}

const getTodayDate = () => new Date().toISOString().split("T")[0];

const buildDailySummaries = (kicks: KickEntry[]): DailySummary[] => {
  const dateMap = new Map<string, KickEntry[]>();

  kicks.forEach((kick) => {
    if (!dateMap.has(kick.date)) {
      dateMap.set(kick.date, []);
    }
    dateMap.get(kick.date)!.push(kick);
  });

  return Array.from(dateMap.entries())
    .map(([date, dateKicks]) => {
      const kickCount = dateKicks.length;
      let timeTo10Kicks: string | null = null;

      if (kickCount >= 10) {
        const sortedKicks = [...dateKicks].sort(
          (a, b) =>
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
        );

        const firstKick = new Date(sortedKicks[0].timestamp);
        const tenthKick = new Date(sortedKicks[9].timestamp);

        const diffMs = tenthKick.getTime() - firstKick.getTime();
        const diffMins = Math.floor(diffMs / 60000);

        if (diffMins < 60) {
          timeTo10Kicks = `${diffMins}m`;
        } else {
          const hours = Math.floor(diffMins / 60);
          const mins = diffMins % 60;
          timeTo10Kicks = `${hours}h ${mins}m`;
        }
      }

      return { date, kickCount, timeTo10Kicks };
    })
    .sort((a, b) => b.date.localeCompare(a.date));
};

const getTodayKickTimes = (kicks: KickEntry[]) => {
  const todayKicks = kicks.filter((k) => k.date === getTodayDate());
  if (todayKicks.length === 0)
    return { firstKick: null, tenthKick: null, timeTo10: null };

  const sortedKicks = [...todayKicks].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
  );

  const firstKick = sortedKicks[0]
    ? new Date(sortedKicks[0].timestamp)
    : null;
  const tenthKick = sortedKicks[9]
    ? new Date(sortedKicks[9].timestamp)
    : null;

  let timeTo10 = null;
  if (firstKick && tenthKick) {
    const diffMs = tenthKick.getTime() - firstKick.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 60) {
      timeTo10 = `${diffMins}m`;
    } else {
      const hours = Math.floor(diffMins / 60);
      const mins = diffMins % 60;
      timeTo10 = `${hours}h ${mins}m`;
    }
  }

  const formatTime = (date: Date | null) =>
    date
      ? date.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        })
      : null;

  return {
    firstKick: formatTime(firstKick),
    tenthKick: formatTime(tenthKick),
    timeTo10,
  };
};

const formatHourRange = (hour: number) => {
  const formatHour = (h: number) => {
    const period = h >= 12 ? "PM" : "AM";
    const hour12 = h % 12 === 0 ? 12 : h % 12;
    return `${hour12} ${period}`;
  };

  const startLabel = formatHour(hour);
  const endLabel = formatHour((hour + 1) % 24);
  return `${startLabel} – ${endLabel}`;
};

const getMostActiveHour = (kicks: KickEntry[]): string | null => {
  if (kicks.length === 0) return null;

  const counts = new Array(24).fill(0);
  kicks.forEach((kick) => {
    const hour = new Date(kick.timestamp).getHours();
    counts[hour] += 1;
  });

  let maxHour = 0;
  for (let i = 1; i < 24; i += 1) {
    if (counts[i] > counts[maxHour]) {
      maxHour = i;
    }
  }

  if (counts[maxHour] === 0) return null;
  return formatHourRange(maxHour);
};

const getAverageDailyKicks = (kicks: KickEntry[]): number => {
  if (kicks.length === 0) return 0;
  const uniqueDates = new Set(kicks.map((k) => k.date));
  if (uniqueDates.size === 0) return 0;
  return Math.round((kicks.length / uniqueDates.size) * 10) / 10;
};

export const KicksTab = ({ kicks, logging, onLogKick }: KicksTabProps) => {
  const [timeRange, setTimeRange] = useState<TimeRangeFilter>("today");

  const todayDate = getTodayDate();

  const kicksToday = kicks.filter((k) => k.date === todayDate).length;
  const todayTimes = getTodayKickTimes(kicks);
  const mostActiveHour = getMostActiveHour(kicks);
  const avgDailyKicks = getAverageDailyKicks(kicks);

  const dailySummaries = useMemo(
    () => buildDailySummaries(kicks),
    [kicks],
  );

  const filteredSummaries = useMemo(() => {
    if (timeRange === "all") return dailySummaries;
    if (timeRange === "today") {
      return dailySummaries.filter((summary) => summary.date === todayDate);
    }

    const now = new Date();
    const weekStart = startOfWeek(now);
    return dailySummaries.filter(
      (summary) => new Date(summary.date) >= weekStart,
    );
  }, [dailySummaries, timeRange]);

  const handleLogKickClick = async () => {
    try {
      await onLogKick();
    } catch {
      toast.error("Failed to log kick. Please try again.");
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <div className="rounded bg-pink-100 p-1.5">
          <Baby className="h-4 w-4 text-pink-600" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Kicks</h2>
          <p className="text-xs text-gray-500">
            Track daily kicks and spot your baby&apos;s patterns
          </p>
        </div>
      </div>

      <Card className="shadow-md border-0">
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="flex flex-row justify-center gap-2 mb-2">
              <div className="p-1.5 bg-purple-100 rounded">
                <Calendar className="w-3 h-3 text-purple-600" />
              </div>
              <div className="font-semibold">Today's Stats</div>
            </div>

            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
              <Card className="shadow-sm border-0">
                <CardContent className="flex flex-col items-center py-4">
                  <div className="text-xs font-medium text-gray-500 mb-1">
                    Kicks Today
                  </div>
                  {logging ? (
                    <Skeleton className="h-8 w-10 rounded self-center" />
                  ) : (
                    <div className="text-3xl font-bold text-purple-600">
                      {kicksToday}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="shadow-sm border-0">
                <CardContent className="flex flex-col items-center py-4">
                  <div className="text-xs font-medium text-gray-500 mb-1">
                    Time to 10
                  </div>
                  {logging ? (
                    <Skeleton className="h-8 w-10 rounded self-center" />
                  ) : (
                    <div className="text-2xl font-bold text-blue-600 text-center">
                      {todayTimes.timeTo10 || "-"}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="shadow-sm border-0">
                <CardContent className="flex flex-col items-center py-4">
                  <div className="text-xs font-medium text-gray-500 mb-1">
                    Peak Hour
                  </div>
                  {logging ? (
                    <Skeleton className="h-8 w-16 rounded self-center" />
                  ) : (
                    <div className="text-sm font-semibold text-green-600 text-center">
                      {mostActiveHour || "-"}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="shadow-sm border-0">
                <CardContent className="flex flex-col items-center py-4">
                  <div className="text-xs font-medium text-gray-500 mb-1">
                    Daily Average
                  </div>
                  {logging ? (
                    <Skeleton className="h-8 w-16 rounded self-center" />
                  ) : (
                    <div className="text-2xl font-semibold text-orange-600 text-center">
                      {avgDailyKicks.toFixed(1)}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="shadow-sm border-0">
                <CardContent className="flex flex-col items-center py-4">
                  <div className="text-xs font-medium text-gray-500 mb-1">
                    1st Kick
                  </div>
                  {logging ? (
                    <Skeleton className="h-8 w-16 rounded self-center" />
                  ) : (
                    <div className="text-xl font-semibold text-green-600 text-center">
                      {todayTimes.firstKick || "-"}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="shadow-sm border-0">
                <CardContent className="flex flex-col items-center py-4">
                  <div className="text-xs font-medium text-gray-500 mb-1">
                    10th Kick
                  </div>
                  {logging ? (
                    <Skeleton className="h-8 w-16 rounded self-center" />
                  ) : (
                    <div className="text-xl font-semibold text-orange-600 text-center">
                      {todayTimes.tenthKick || "-"}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="flex flex-col items-center gap-2 mt-2">
              <LogButton onClick={handleLogKickClick} loading={logging} />
              <p className="text-xs text-gray-500">Tap to log a kick</p>
            </div>
          </div>

          <Separator className="my-6" />

          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="font-semibold">History</div>
              <div className="flex gap-2 rounded-full bg-purple-50 p-1 text-xs">
                {[
                  { value: "today", label: "Today" },
                  { value: "week", label: "This Week" },
                  { value: "all", label: "All Time" },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setTimeRange(option.value as TimeRangeFilter)}
                    className={`rounded-full px-3 py-1 font-medium transition ${
                      timeRange === option.value
                        ? "bg-white text-purple-700 shadow-sm"
                        : "text-purple-700/70 hover:bg-purple-100"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
            <HistoryChart data={filteredSummaries} />
            <HistoryTable data={filteredSummaries} kicks={kicks} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

