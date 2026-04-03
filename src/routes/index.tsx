import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { LogOut } from "lucide-react";
import { useTasks, useReadingLog, useNotes, useSavedItems } from "@/lib/store";
import { useAuth } from "@/hooks/useAuth";
import { DashboardView } from "@/components/DashboardView";
import { TodoView } from "@/components/TodoView";
import { MonthlyProgressView } from "@/components/MonthlyProgressView";
import { ReadingView } from "@/components/ReadingView";
import { NotesView } from "@/components/NotesView";
import { SavedItemsView } from "@/components/SavedItemsView";
import { AuthPage } from "@/components/AuthPage";
import { BottomNav, type ViewType } from "@/components/BottomNav";
import { Button } from "@/components/ui/button";

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
  const { user, loading, signIn, signUp, signOut } = useAuth();
  const [activeView, setActiveView] = useState<ViewType>("dashboard");

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
          className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!user) {
    return <AuthPage onSignIn={signIn} onSignUp={signUp} />;
  }

  return <AppContent user={user} activeView={activeView} setActiveView={setActiveView} signOut={signOut} />;
}

function AppContent({ user, activeView, setActiveView, signOut }: {
  user: { id: string; email?: string };
  activeView: ViewType;
  setActiveView: (v: ViewType) => void;
  signOut: () => Promise<void>;
}) {
  const taskStore = useTasks(user.id);
  const readingStore = useReadingLog(user.id);
  const notesStore = useNotes(user.id);
  const savedStore = useSavedItems(user.id);

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-lg mx-auto px-4 pt-4">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs text-muted-foreground truncate max-w-[200px]">{user.email}</span>
          <Button variant="ghost" size="sm" onClick={signOut} className="gap-1 text-xs text-muted-foreground">
            <LogOut className="h-3 w-3" />
            Sign out
          </Button>
        </div>

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
            {activeView === "notes" && (
              <NotesView
                getNoteForDate={notesStore.getNoteForDate}
                saveNote={notesStore.saveNote}
                addImage={notesStore.addImage}
                deleteImage={notesStore.deleteImage}
              />
            )}
            {activeView === "saved" && (
              <SavedItemsView
                items={savedStore.items}
                loading={savedStore.loading}
                addItem={savedStore.addItem}
                deleteItem={savedStore.deleteItem}
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
