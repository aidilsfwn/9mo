import { useState } from "react";
import type { DailySummary } from "@/App";
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
  // Pagination state
  const [page, setPage] = useState(1);
  const pageSize = 7;
  const totalPages = Math.ceil(data.length / pageSize);

  // Helper to get first and 10th kick times
  const getKickTimes = (date: string, kicks: KickEntry[]) => {
    const dateKicks = kicks.filter((k) => k.date === date);
    if (dateKicks.length === 0) return { firstKick: null, tenthKick: null };
    const sorted = [...dateKicks].sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
    );
    return {
      firstKick:
        sorted.length > 0
          ? new Date(sorted[0].timestamp).toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
            })
          : null,
      tenthKick:
        sorted.length > 9
          ? new Date(sorted[9].timestamp).toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
            })
          : null,
    };
  };

  // Paginated data
  const paginatedData = data
    .slice()
    .reverse()
    .slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table className="w-full">
        <TableHeader className="bg-purple-50">
          <TableRow>
            <TableHead className="font-semibold text-purple-900">
              Date
            </TableHead>
            <TableHead className="font-semibold text-purple-900">
              Kicks
            </TableHead>
            <TableHead className="font-semibold text-purple-900">
              1st Kick
            </TableHead>
            <TableHead className="font-semibold text-purple-900">
              10th Kick
            </TableHead>
            <TableHead className="font-semibold text-purple-900">
              Time to 10
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={5}
                className="px-4 py-8 text-center text-gray-500"
              >
                No kicks logged yet
              </TableCell>
            </TableRow>
          ) : (
            paginatedData.map((summary) => {
              const { firstKick, tenthKick } = getKickTimes(
                summary.date,
                kicks,
              );
              return (
                <TableRow key={summary.date}>
                  <TableCell>{formatDate(summary.date)}</TableCell>
                  <TableCell>{summary.kickCount}</TableCell>
                  <TableCell>{firstKick || "-"}</TableCell>
                  <TableCell>{tenthKick || "-"}</TableCell>
                  <TableCell>{summary.timeTo10Kicks || "-"}</TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center px-4 py-2 bg-white border-t">
          <button
            className="px-3 py-1 rounded bg-purple-100 text-purple-700 disabled:opacity-50"
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            Previous
          </button>
          <span className="text-sm text-gray-600">
            Page {page} of {totalPages}
          </span>
          <button
            className="px-3 py-1 rounded bg-purple-100 text-purple-700 disabled:opacity-50"
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
