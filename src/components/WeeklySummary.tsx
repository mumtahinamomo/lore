import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus, ArrowRight, BookOpen, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Task, ReadingEntry } from "@/lib/store";
import { formatDate } from "@/lib/store";

interface WeeklySummaryProps {
  tasks: Task[];
  readingEntries: ReadingEntry[];
}

function getWeekDates(weeksAgo: number): string[] {
  const dates: string[] = [];
  const now = new Date();
  const dayOfWeek = now.getDay();
  const startOfThisWeek = new Date(now);
  startOfThisWeek.setDate(now.getDate() - dayOfWeek - weeksAgo * 7);
  for (let i = 0; i < 7; i++) {
    const d = new Date(startOfThisWeek);
    d.setDate(startOfThisWeek.getDate() + i);
    dates.push(formatDate(d));
  }
  return dates;
}

function getWeekStats(tasks: Task[], reading: ReadingEntry[], weeksAgo: number) {
  const dates = getWeekDates(weeksAgo);
  const weekTasks = tasks.filter(t => dates.includes(t.date));
  const weekReading = reading.filter(e => dates.includes(e.date));
  return {
    dates,
    totalTasks: weekTasks.length,
    completedTasks: weekTasks.filter(t => t.completed).length,
    totalPages: weekReading.reduce((s, e) => s + e.pagesRead, 0),
    totalMinutes: weekReading.reduce((s, e) => s + e.minutesSpent, 0),
    readingDays: new Set(weekReading.map(e => e.date)).size,
    activeDays: new Set([...weekTasks.map(t => t.date), ...weekReading.map(e => e.date)]).size,
  };
}

function TrendIcon({ current, previous }: { current: number; previous: number }) {
  if (current > previous) return <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />;
  if (current < previous) return <TrendingDown className="h-3.5 w-3.5 text-destructive" />;
  return <Minus className="h-3.5 w-3.5 text-muted-foreground" />;
}

function trendLabel(current: number, previous: number): string {
  if (previous === 0) return current > 0 ? "New!" : "—";
  const diff = Math.round(((current - previous) / previous) * 100);
  if (diff > 0) return `+${diff}%`;
  if (diff < 0) return `${diff}%`;
  return "Same";
}

const DAYS_SHORT = ["S", "M", "T", "W", "T", "F", "S"];

export function WeeklySummary({ tasks, readingEntries }: WeeklySummaryProps) {
  const thisWeek = getWeekStats(tasks, readingEntries, 0);
  const lastWeek = getWeekStats(tasks, readingEntries, 1);

  const completionRate = thisWeek.totalTasks > 0
    ? Math.round((thisWeek.completedTasks / thisWeek.totalTasks) * 100)
    : 0;
  const lastCompletionRate = lastWeek.totalTasks > 0
    ? Math.round((lastWeek.completedTasks / lastWeek.totalTasks) * 100)
    : 0;

  const item = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  return (
    <motion.div variants={{ show: { transition: { staggerChildren: 0.08 } } }} className="space-y-4">
      <motion.div variants={item} className="flex items-center justify-between">
        <h3 className="font-display text-base font-bold">This Week</h3>
        <span className="text-xs text-muted-foreground">vs last week</span>
      </motion.div>

      {/* Activity heatmap for the week */}
      <motion.div variants={item}>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex justify-between mb-3">
              {thisWeek.dates.map((date, i) => {
                const dayTasks = tasks.filter(t => t.date === date);
                const dayReading = readingEntries.filter(e => e.date === date);
                const hasActivity = dayTasks.length > 0 || dayReading.length > 0;
                const allDone = dayTasks.length > 0 && dayTasks.every(t => t.completed);
                const today = formatDate(new Date());

                return (
                  <div key={date} className="flex flex-col items-center gap-1.5">
                    <span className="text-[10px] text-muted-foreground">{DAYS_SHORT[i]}</span>
                    <div className={`h-9 w-9 rounded-xl flex items-center justify-center text-xs font-semibold transition-all ${
                      date === today
                        ? "ring-2 ring-primary ring-offset-2 ring-offset-background"
                        : ""
                    } ${
                      allDone
                        ? "bg-primary text-primary-foreground"
                        : hasActivity
                          ? "bg-pink-blush/60 text-foreground"
                          : "bg-muted/50 text-muted-foreground"
                    }`}>
                      {new Date(date + "T12:00:00").getDate()}
                    </div>
                    {hasActivity && (
                      <div className="flex gap-0.5">
                        {dayTasks.length > 0 && <span className="h-1 w-1 rounded-full bg-primary" />}
                        {dayReading.length > 0 && <span className="h-1 w-1 rounded-full bg-pink-glow" />}
                      </div>
                    )}
                    {!hasActivity && <div className="h-1" />}
                  </div>
                );
              })}
            </div>
            <div className="flex items-center gap-3 text-[10px] text-muted-foreground justify-center">
              <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-primary" /> Tasks</span>
              <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-pink-glow" /> Reading</span>
              <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded bg-primary" /> All done</span>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Comparison cards */}
      <motion.div variants={item} className="grid grid-cols-2 gap-3">
        <Card className="border-0 bg-pink-soft/40 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle2 className="h-4 w-4 text-pink-deep" />
              <div className="flex items-center gap-1">
                <TrendIcon current={completionRate} previous={lastCompletionRate} />
                <span className="text-[10px] font-medium">{trendLabel(completionRate, lastCompletionRate)}</span>
              </div>
            </div>
            <p className="font-display text-2xl font-bold">{completionRate}%</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">Completion rate</p>
            <div className="mt-2 flex items-center gap-1.5">
              <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-primary"
                  initial={{ width: 0 }}
                  animate={{ width: `${completionRate}%` }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-accent/40 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <BookOpen className="h-4 w-4 text-pink-deep" />
              <div className="flex items-center gap-1">
                <TrendIcon current={thisWeek.totalPages} previous={lastWeek.totalPages} />
                <span className="text-[10px] font-medium">{trendLabel(thisWeek.totalPages, lastWeek.totalPages)}</span>
              </div>
            </div>
            <p className="font-display text-2xl font-bold">{thisWeek.totalPages}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">Pages read</p>
            <p className="text-[10px] text-muted-foreground mt-1">
              Last week: {lastWeek.totalPages}
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Detailed comparison */}
      <motion.div variants={item}>
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <ArrowRight className="h-3.5 w-3.5 text-primary" />
              Week-over-Week
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <ComparisonRow label="Tasks completed" current={thisWeek.completedTasks} previous={lastWeek.completedTasks} />
            <ComparisonRow label="Reading minutes" current={thisWeek.totalMinutes} previous={lastWeek.totalMinutes} />
            <ComparisonRow label="Reading days" current={thisWeek.readingDays} previous={lastWeek.readingDays} max={7} />
            <ComparisonRow label="Active days" current={thisWeek.activeDays} previous={lastWeek.activeDays} max={7} />
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}

function ComparisonRow({ label, current, previous, max }: { label: string; current: number; previous: number; max?: number }) {
  const barMax = max || Math.max(current, previous, 1);
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-muted-foreground">{label}</span>
        <div className="flex items-center gap-1.5">
          <span className="font-semibold">{current}</span>
          <TrendIcon current={current} previous={previous} />
        </div>
      </div>
      <div className="flex gap-1 h-2">
        <div className="flex-1 rounded-full bg-muted overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${(current / barMax) * 100}%` }}
            transition={{ duration: 0.6 }}
          />
        </div>
        <div className="flex-1 rounded-full bg-muted overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-pink-blush"
            initial={{ width: 0 }}
            animate={{ width: `${(previous / barMax) * 100}%` }}
            transition={{ duration: 0.6 }}
          />
        </div>
      </div>
      <div className="flex justify-between text-[10px] text-muted-foreground mt-0.5">
        <span>This week</span>
        <span>Last week: {previous}</span>
      </div>
    </div>
  );
}
