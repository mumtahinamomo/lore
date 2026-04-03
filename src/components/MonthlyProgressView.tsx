import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { Task, ReadingEntry } from "@/lib/store";
import { WeeklySummary } from "@/components/WeeklySummary";

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

interface MonthlyProgressViewProps {
  tasks: Task[];
  readingEntries: ReadingEntry[];
  getTasksForMonth: (year: number, month: number) => Task[];
  getReadingForMonth: (year: number, month: number) => ReadingEntry[];
}

export function MonthlyProgressView({ tasks, readingEntries, getTasksForMonth, getReadingForMonth }: MonthlyProgressViewProps) {
  const [current, setCurrent] = useState(new Date());
  const year = current.getFullYear();
  const month = current.getMonth();

  const monthTasks = getTasksForMonth(year, month);
  const completedTasks = monthTasks.filter(t => t.completed).length;
  const totalTasks = monthTasks.length;
  const completionPct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const monthReading = getReadingForMonth(year, month);
  const totalPages = monthReading.reduce((s, e) => s + e.pagesRead, 0);
  const totalMinutes = monthReading.reduce((s, e) => s + e.minutesSpent, 0);
  const readingDays = new Set(monthReading.map(e => e.date)).size;

  const navigate = (delta: number) => {
    const d = new Date(current);
    d.setMonth(d.getMonth() + delta);
    setCurrent(d);
  };

  // Weekly breakdown
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const weeks: { label: string; completed: number; total: number }[] = [];
  for (let w = 0; w < Math.ceil(daysInMonth / 7); w++) {
    const start = w * 7 + 1;
    const end = Math.min(start + 6, daysInMonth);
    const weekTasks = monthTasks.filter(t => {
      const day = parseInt(t.date.split("-")[2]);
      return day >= start && day <= end;
    });
    weeks.push({
      label: `Day ${start}–${end}`,
      completed: weekTasks.filter(t => t.completed).length,
      total: weekTasks.length,
    });
  }

  const item = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
  };

  return (
    <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.08 } } }} className="space-y-5">
      <motion.div variants={item} className="flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h2 className="font-display text-lg font-bold">{MONTHS[month]} {year}</h2>
        <Button variant="ghost" size="icon" onClick={() => navigate(1)}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </motion.div>

      {/* Main Stats */}
      <motion.div variants={item}>
        <Card className="border-0 bg-gradient-to-br from-primary/10 to-pink-blush/30 shadow-sm">
          <CardContent className="p-5 text-center">
            <p className="font-display text-5xl font-bold text-primary">{completionPct}%</p>
            <p className="mt-1 text-sm text-muted-foreground">Task Completion Rate</p>
            <Progress value={completionPct} className="mt-4 h-3" />
            <p className="mt-2 text-xs text-muted-foreground">{completedTasks} of {totalTasks} tasks completed</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Reading Stats */}
      <motion.div variants={item} className="grid grid-cols-3 gap-3">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-3 text-center">
            <p className="font-display text-2xl font-bold">{totalPages}</p>
            <p className="text-xs text-muted-foreground">Pages</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-3 text-center">
            <p className="font-display text-2xl font-bold">{totalMinutes}</p>
            <p className="text-xs text-muted-foreground">Minutes</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-3 text-center">
            <p className="font-display text-2xl font-bold">{readingDays}</p>
            <p className="text-xs text-muted-foreground">Days Read</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Weekly Breakdown */}
      <motion.div variants={item}>
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-4 w-4 text-primary" />
              Weekly Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {weeks.map((w, i) => {
              const pct = w.total > 0 ? Math.round((w.completed / w.total) * 100) : 0;
              return (
                <div key={i}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">{w.label}</span>
                    <span className="font-medium">{w.completed}/{w.total}</span>
                  </div>
                  <div className="h-2 rounded-full bg-pink-soft overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-primary"
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.6, delay: i * 0.1 }}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </motion.div>

      {/* Week-over-Week Summary */}
      <motion.div variants={item}>
        <WeeklySummary tasks={tasks} readingEntries={readingEntries} />
      </motion.div>
    </motion.div>
  );
}
