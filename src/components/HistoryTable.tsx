import { useState } from "react";
import { Baby } from "lucide-react";
import type { DailySummary } from "@/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui";
import { formatDate } from "@/utils";
import type { KickEntry } from "@/hooks";

interface HistoryTableProps {
  data: DailySummary[];
  kicks: KickEntry[];
}

export const HistoryTable = ({ data, kicks }: HistoryTableProps) => {
  const [page, setPage] = useState(1);
  const pageSize = 7;
  const totalPages = Math.ceil(data.length / pageSize);

  const getFirstKick = (date: string, kicks: KickEntry[]) => {
    const dateKicks = kicks.filter((k) => k.date === date);
    if (dateKicks.length === 0) return null;
    const sorted = [...dateKicks].sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
    );
    return new Date(sorted[0].timestamp).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const paginatedData = data
    .slice()
    .reverse()
    .slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="overflow-hidden rounded-lg border">
      <Table className="w-full">
        <TableHeader className="bg-purple-50">
          <TableRow>
            <TableHead className="text-xs font-semibold text-purple-900">Date</TableHead>
            <TableHead className="text-xs font-semibold text-purple-900">Kicks</TableHead>
            <TableHead className="text-xs font-semibold text-purple-900">1st Kick</TableHead>
            <TableHead className="text-xs font-semibold text-purple-900">Time to 10</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="py-8">
                <div className="flex flex-col items-center gap-2 text-center">
                  <Baby className="h-7 w-7 text-pink-200" />
                  <p className="text-xs text-gray-400">Nothing logged yet — tap the button above to record your first kick</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            paginatedData.map((summary) => {
              const firstKick = getFirstKick(summary.date, kicks);
              return (
                <TableRow key={summary.date}>
                  <TableCell className="text-xs">{formatDate(summary.date)}</TableCell>
                  <TableCell className="text-xs">{summary.kickCount}</TableCell>
                  <TableCell className="text-xs">{firstKick || "—"}</TableCell>
                  <TableCell className="text-xs">{summary.timeTo10Kicks || "—"}</TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t bg-white px-3 py-1.5">
          <button
            type="button"
            className="rounded bg-purple-100 px-2 py-1 text-xs text-purple-700 disabled:opacity-50"
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            Previous
          </button>
          <span className="text-xs text-gray-600">
            Page {page} of {totalPages}
          </span>
          <button
            type="button"
            className="rounded bg-purple-100 px-2 py-1 text-xs text-purple-700 disabled:opacity-50"
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};
