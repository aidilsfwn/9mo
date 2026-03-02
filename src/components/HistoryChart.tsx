import {
  ResponsiveContainer,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Line,
} from "recharts";
import { ChartLine } from "lucide-react";

import { formatDate } from "@/utils";
import type { DailySummary } from "@/types";

export const HistoryChart = ({ data }: { data: DailySummary[] }) => {
  if (data.length === 0) return null;

  const chartData = data
    .map((item) => {
      let timeInMinutes = null;
      if (item.timeTo10Kicks) {
        const timeStr = item.timeTo10Kicks;
        const hourMatch = timeStr.match(/(\d+)h/);
        const minMatch = timeStr.match(/(\d+)m/);

        const hours = hourMatch ? parseInt(hourMatch[1]) : 0;
        const mins = minMatch ? parseInt(minMatch[1]) : 0;
        timeInMinutes = hours * 60 + mins;
      }

      return {
        ...item,
        timeInMinutes,
      };
    })
    .filter((item) => item.timeInMinutes !== null);

  if (chartData.length === 0) {
    return (
      <div className="flex h-48 flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-purple-100 bg-purple-50/40 px-4 text-center">
        <ChartLine className="h-7 w-7 text-purple-200" />
        <p className="text-xs text-purple-500">Hit 10 kicks in a day and you&apos;ll see how long it took charted here.</p>
      </div>
    );
  }

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  return (
    <div className="h-56 rounded-lg border border-purple-100 bg-white/60 px-2 py-2">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{ top: 10, right: 8, bottom: 20, left: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="date"
            tickFormatter={formatDate}
            tick={{ fontSize: 11 }}
            interval="preserveEnd"
            angle={-30}
            textAnchor="end"
            height={40}
          />
          <YAxis
            width={40}
            tick={{ fontSize: 11 }}
            tickFormatter={formatTime}
          />
          <Tooltip
            contentStyle={{
              borderRadius: 8,
              borderColor: "#e5e7eb",
              fontSize: 12,
            }}
            labelFormatter={formatDate}
            formatter={(value: number) => [
              formatTime(value as number),
              "Time to 10 kicks",
            ]}
          />
          <Line
            type="monotone"
            dataKey="timeInMinutes"
            stroke="#ec4899"
            strokeWidth={2.2}
            dot={{ fill: "#ec4899", r: 3 }}
            activeDot={{ r: 5, strokeWidth: 1, stroke: "#db2777" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
