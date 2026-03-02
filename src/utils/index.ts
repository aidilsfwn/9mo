import { DUE_DATE, LMP } from "@/constants";

const MS_PER_DAY = 1000 * 60 * 60 * 24;

const calculateTimeInfo = (referenceDate: Date = new Date()) => {
  const diffTime = DUE_DATE.getTime() - referenceDate.getTime();
  const daysToGo = Math.ceil(diffTime / MS_PER_DAY);

  const diffSinceLMP = referenceDate.getTime() - LMP.getTime();
  const daysPregnant = Math.floor(diffSinceLMP / MS_PER_DAY);
  const weeks = Math.floor(daysPregnant / 7);
  const days = daysPregnant % 7;

  return { daysToGo, weeks, days };
};

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const startOfWeek = (date: Date) => {
  const d = new Date(date);
  const day = d.getDay(); // 0 (Sun) - 6 (Sat)
  const diff = (day === 0 ? -6 : 1) - day; // make Monday the first day of week
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
};

export { calculateTimeInfo, formatDate, startOfWeek };
