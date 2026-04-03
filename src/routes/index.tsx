import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { useTasks, useReadingLog } from "@/lib/store";
import { DashboardView } from "@/components/DashboardView";
import { TodoView } from "@/components/TodoView";
import { MonthlyProgressView } from "@/components/MonthlyProgressView";
import { ReadingView } from "@/components/ReadingView";
import { BottomNav, type ViewType } from "@/components/BottomNav";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Bloom — Your Pink Productivity Companion" },
      { name: "description", content: "Track tasks, reading habits, and personal growth with a calming pink productivity app." },
    ],
  }),
});

function Index() {
  const [activeView, setActiveView] = useState<ViewType>("dashboard");
  const taskStore = useTasks();
  const readingStore = useReadingLog();

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-lg mx-auto px-4 pt-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeView}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
          >
            {activeView === "dashboard" && (
              <DashboardView
                tasks={taskStore.tasks}
                readingEntries={readingStore.entries}
                readingStreak={readingStore.getReadingStreak()}
              />
            )}
            {activeView === "todos" && (
              <TodoView
                tasks={taskStore.tasks}
                addTask={taskStore.addTask}
                toggleTask={taskStore.toggleTask}
                deleteTask={taskStore.deleteTask}
                editTask={taskStore.editTask}
                getTasksForDate={taskStore.getTasksForDate}
              />
            )}
            {activeView === "progress" && (
              <MonthlyProgressView
                getTasksForMonth={taskStore.getTasksForMonth}
                getReadingForMonth={readingStore.getEntriesForMonth}
              />
            )}
            {activeView === "reading" && (
              <ReadingView
                entries={readingStore.entries}
                addEntry={readingStore.addEntry}
                deleteEntry={readingStore.deleteEntry}
                getEntriesForDate={readingStore.getEntriesForDate}
                readingStreak={readingStore.getReadingStreak()}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
      <BottomNav active={activeView} onChange={setActiveView} />
    </div>
  );
}
