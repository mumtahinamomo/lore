import { motion } from "framer-motion";
import { CheckCircle2, BookOpen, Target, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { WeeklySummary } from "@/components/WeeklySummary";
import type { Task, ReadingEntry } from "@/lib/store";
import { formatDate } from "@/lib/store";

interface DashboardViewProps {
  tasks: Task[];
  readingEntries: ReadingEntry[];
  readingStreak: number;
}

const greetings = [
  "You're doing amazing 💖",
  "Keep blooming 🌸",
  "One step at a time 🌷",
  "You've got this 💪✨",
  "Stay consistent, stay powerful 🌺",
];

export function DashboardView({ tasks, readingEntries, readingStreak }: DashboardViewProps) {
  const today = formatDate(new Date());
  const todayTasks = tasks.filter(t => t.date === today);
  const completedToday = todayTasks.filter(t => t.completed).length;
  const totalToday = todayTasks.length;
  const progressToday = totalToday > 0 ? Math.round((completedToday / totalToday) * 100) : 0;

  const todayReading = readingEntries.filter(e => e.date === today);
  const todayPages = todayReading.reduce((sum, e) => sum + e.pagesRead, 0);
  const todayMinutes = todayReading.reduce((sum, e) => sum + e.minutesSpent, 0);

  const greeting = greetings[new Date().getDate() % greetings.length];

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item}>
        <h1 className="font-display text-2xl font-bold">Good {getTimeOfDay()}</h1>
        <p className="mt-1 text-muted-foreground">{greeting}</p>
      </motion.div>

      <div className="grid grid-cols-2 gap-4">
        <motion.div variants={item}>
          <Card className="border-0 bg-pink-soft/50 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-pink-deep">
                <CheckCircle2 className="h-5 w-5" />
                <span className="text-sm font-medium">Tasks Done</span>
              </div>
              <p className="mt-2 font-display text-3xl font-bold">{completedToday}<span className="text-lg text-muted-foreground">/{totalToday}</span></p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="border-0 bg-accent/50 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-pink-deep">
                <BookOpen className="h-5 w-5" />
                <span className="text-sm font-medium">Pages Read</span>
              </div>
              <p className="mt-2 font-display text-3xl font-bold">{todayPages}</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="border-0 bg-secondary/50 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-pink-deep">
                <Target className="h-5 w-5" />
                <span className="text-sm font-medium">Reading Time</span>
              </div>
              <p className="mt-2 font-display text-3xl font-bold">{todayMinutes}<span className="text-lg text-muted-foreground">min</span></p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="border-0 bg-pink-blush/30 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-pink-deep">
                <Sparkles className="h-5 w-5" />
                <span className="text-sm font-medium">Read Streak</span>
              </div>
              <p className="mt-2 font-display text-3xl font-bold">{readingStreak}<span className="text-lg text-muted-foreground"> days</span></p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {totalToday > 0 && (
        <motion.div variants={item}>
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Today's Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <Progress value={progressToday} className="h-3" />
              <p className="mt-2 text-sm text-muted-foreground">{progressToday}% complete</p>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {todayTasks.length > 0 && (
        <motion.div variants={item}>
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Today's Tasks</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {todayTasks.slice(0, 5).map(task => (
                <div key={task.id} className="flex items-center gap-2 text-sm">
                  <div className={`h-2 w-2 rounded-full ${task.completed ? "bg-primary" : "bg-border"}`} />
                  <span className={task.completed ? "line-through text-muted-foreground" : ""}>{task.text}</span>
                </div>
              ))}
              {todayTasks.length > 5 && (
                <p className="text-xs text-muted-foreground">+{todayTasks.length - 5} more</p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Weekly Summary */}
      <motion.div variants={item}>
        <WeeklySummary tasks={tasks} readingEntries={readingEntries} />
      </motion.div>
    </motion.div>
  );
}

function getTimeOfDay() {
  const h = new Date().getHours();
  if (h < 12) return "morning 🌅";
  if (h < 17) return "afternoon ☀️";
  return "evening 🌙";
}
