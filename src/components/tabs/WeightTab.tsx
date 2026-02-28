import { useMemo, useState } from "react";
import { Calendar, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card, CardContent, Button, Separator, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui";
import type { WeightEntry } from "@/types";
import { formatDate } from "@/utils";

interface WeightTabProps {
  weights: WeightEntry[];
  loading: boolean;
  onAddWeight: (weight: number, date: string) => Promise<void>;
  onRemoveWeight: (id: string) => Promise<void>;
}

const formatKg = (value: number | null | undefined) =>
  value == null ? "-" : `${value.toFixed(1)} kg`;

const getStats = (weights: WeightEntry[]) => {
  if (weights.length === 0) {
    return {
      currentWeight: null,
      totalGained: null,
      currentWeek: null,
    };
  }

  const sorted = [...weights].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
  );

  const first = sorted[0];
  const last = sorted[sorted.length - 1];

  const currentWeight = last.weight;
  const totalGained = last.weight - first.weight;
  const currentWeek = last.weekNumber;

  return { currentWeight, totalGained, currentWeek };
};

const getTrend = (weights: WeightEntry[]) => {
  if (weights.length < 3) return "Not enough data";

  const lastThree = [...weights]
    .sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
    )
    .slice(-3);

  const first = lastThree[0].weight;
  const last = lastThree[lastThree.length - 1].weight;
  const diff = last - first;

  if (diff > 0.3) return "Gaining";
  if (diff < -0.3) return "Losing";
  return "Stable";
};

export const WeightTab = ({
  weights,
  loading,
  onAddWeight,
  onRemoveWeight,
}: WeightTabProps) => {
  const [weightInput, setWeightInput] = useState<string>("");
  const [dateInput, setDateInput] = useState<string>(
    new Date().toISOString().split("T")[0],
  );
  const [submitting, setSubmitting] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 7;

  const stats = useMemo(() => getStats(weights), [weights]);
  const trend = useMemo(() => getTrend(weights), [weights]);

  const chartData = useMemo(
    () =>
      [...weights].map((entry) => ({
        week: entry.weekNumber,
        weight: entry.weight,
      })),
    [weights],
  );

  const paginated = useMemo(() => {
    const sorted = [...weights].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );
    const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
    const currentPage = Math.min(page, totalPages);
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return {
      rows: sorted.slice(start, end),
      totalPages,
      currentPage,
    };
  }, [weights, page]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(weightInput);
    if (Number.isNaN(parsed) || parsed <= 0) {
      toast.error("Enter a valid weight (kg)");
      return;
    }

    if (!dateInput) {
      toast.error("Please pick a date");
      return;
    }

    setSubmitting(true);
    try {
      await onAddWeight(parsed, dateInput);
      toast.success("Weight logged!");
      setWeightInput("");
    } catch {
      toast.error("Couldn't log weight. Try again?");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemove = async (id: string) => {
    try {
      await onRemoveWeight(id);
      toast.success("Entry removed");
    } catch {
      toast.error("Couldn't remove entry");
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <div className="p-1.5 rounded bg-pink-100">
          <TrendingUp className="h-4 w-4 text-pink-600" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Weight Tracker</h2>
          <p className="text-xs text-gray-500">
            Watch your progress as baby grows
          </p>
        </div>
      </div>

      <Card className="shadow-md border-0">
        <CardContent className="space-y-4 pt-4">
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-gray-600">
                  Weight (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={weightInput}
                  onChange={(e) => setWeightInput(e.target.value)}
                  className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm shadow-sm focus:border-pink-400 focus:outline-none focus:ring-1 focus:ring-pink-300"
                  placeholder="e.g. 65.5"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-gray-600 flex items-center gap-1">
                  <Calendar className="h-3 w-3 text-purple-500" />
                  Date
                </label>
                <input
                  type="date"
                  value={dateInput}
                  onChange={(e) => setDateInput(e.target.value)}
                  className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm shadow-sm focus:border-pink-400 focus:outline-none focus:ring-1 focus:ring-pink-300"
                />
              </div>
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={submitting || loading}
            >
              Log Weight
            </Button>
          </form>

          <Separator />

          <div className="grid grid-cols-3 gap-3">
            <Card className="shadow-sm border-0">
              <CardContent className="flex flex-col items-center py-3">
                <div className="text-xs font-medium text-gray-500 mb-1">
                  Current Weight
                </div>
                <div className="text-base font-semibold text-purple-700">
                  {formatKg(stats.currentWeight)}
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-sm border-0">
              <CardContent className="flex flex-col items-center py-3">
                <div className="text-xs font-medium text-gray-500 mb-1">
                  Total Gained
                </div>
                <div
                  className={`text-base font-semibold ${
                    stats.totalGained != null && stats.totalGained >= 0
                      ? "text-green-600"
                      : "text-red-500"
                  }`}
                >
                  {stats.totalGained == null
                    ? "-"
                    : `${stats.totalGained >= 0 ? "+" : ""}${stats.totalGained.toFixed(1)} kg`}
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-sm border-0">
              <CardContent className="flex flex-col items-center py-3">
                <div className="text-xs font-medium text-gray-500 mb-1">
                  Week
                </div>
                <div className="text-base font-semibold text-blue-600">
                  {stats.currentWeek != null ? `W${stats.currentWeek}` : "-"}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold">Weight Trend</span>
              <span className="text-xs text-gray-500">
                Recent: {trend}
              </span>
            </div>
            <div className="h-56 rounded-lg border border-purple-100 bg-purple-50/40 p-2">
              {chartData.length === 0 ? (
                <div className="flex h-full items-center justify-center px-4 text-center text-xs text-gray-500">
                  Add a few entries to see your progress
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="week"
                      tickLine={false}
                      tickMargin={8}
                      label={{
                        value: "Pregnancy Week",
                        position: "insideBottom",
                        offset: -4,
                      }}
                    />
                    <YAxis
                      tickLine={false}
                      tickMargin={8}
                      width={40}
                      label={{
                        value: "kg",
                        angle: -90,
                        position: "insideLeft",
                      }}
                    />
                    <Tooltip
                      formatter={(value: number) => [`${value.toFixed(1)} kg`, "Weight"]}
                      labelFormatter={(value: number) => `Week ${value}`}
                    />
                    <Line
                      type="monotone"
                      dataKey="weight"
                      stroke="#ec4899"
                      strokeWidth={2}
                      dot={{ r: 3, strokeWidth: 1, stroke: "#db2777", fill: "#f9a8d4" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold">History</span>
              <span className="text-xs text-gray-500">
                {weights.length} {weights.length === 1 ? "entry" : "entries"}
              </span>
            </div>
            <div className="overflow-hidden rounded-lg border">
              <Table>
                <TableHeader className="bg-purple-50">
                  <TableRow>
                    <TableHead className="text-xs font-semibold text-purple-900">
                      Date
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-purple-900">
                      Weight (kg)
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-purple-900">
                      Gained
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-purple-900">
                      Week
                    </TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginated.rows.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="py-6 text-center text-sm text-gray-500"
                      >
                        No entries yet. Log your first weight above.
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginated.rows.map((entry, index) => {
                      const prev =
                        index === 0
                          ? undefined
                          : paginated.rows[index - 1];
                      const delta =
                        prev != null ? entry.weight - prev.weight : null;
                      return (
                        <TableRow key={entry.id}>
                          <TableCell className="text-xs">
                            {formatDate(entry.date)}
                          </TableCell>
                          <TableCell className="text-xs">
                            {entry.weight.toFixed(1)}
                          </TableCell>
                          <TableCell className="text-xs">
                            {delta == null
                              ? "-"
                              : `${delta >= 0 ? "+" : ""}${delta.toFixed(1)} kg`}
                          </TableCell>
                          <TableCell className="text-xs">
                            W{entry.weekNumber}
                          </TableCell>
                          <TableCell className="text-right">
                            <button
                              type="button"
                              onClick={() => handleRemove(entry.id)}
                              className="text-xs font-medium text-red-500 hover:text-red-600"
                            >
                              Remove
                            </button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
              {paginated.totalPages > 1 && (
                <div className="flex items-center justify-between border-t bg-white px-3 py-1.5">
                  <button
                    type="button"
                    className="rounded bg-purple-100 px-2 py-1 text-xs text-purple-700 disabled:opacity-50"
                    disabled={paginated.currentPage === 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    Previous
                  </button>
                  <span className="text-xs text-gray-600">
                    Page {paginated.currentPage} of {paginated.totalPages}
                  </span>
                  <button
                    type="button"
                    className="rounded bg-purple-100 px-2 py-1 text-xs text-purple-700 disabled:opacity-50"
                    disabled={paginated.currentPage === paginated.totalPages}
                    onClick={() =>
                      setPage((p) =>
                        Math.min(paginated.totalPages, p + 1),
                      )
                    }
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

