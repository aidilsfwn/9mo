import {
  ResponsiveContainer,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Line,
} from "recharts";

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
      <div className="h-64 flex items-center justify-center px-4 text-center text-sm text-gray-500">
        Log 10+ kicks in a day to see your time-to-10 trend
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
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            tickFormatter={formatDate}
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis
            tickFormatter={formatTime}
            label={{
              value: "Time to 10 kicks",
              angle: -90,
              position: "insideLeft",
            }}
          />
          <Tooltip
            labelFormatter={formatDate}
            formatter={(value: number) => [
              formatTime(value),
              "Time to 10 kicks",
            ]}
          />
          <Line
            type="monotone"
            dataKey="timeInMinutes"
            stroke="#a855f7"
            strokeWidth={2}
            dot={{ fill: "#a855f7", r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
