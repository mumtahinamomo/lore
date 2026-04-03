import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, BookOpen, Flame, Clock, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatDate } from "@/lib/store";
import type { ReadingEntry } from "@/lib/store";

interface ReadingViewProps {
  entries: ReadingEntry[];
  addEntry: (title: string, pagesRead: number, minutesSpent: number, date: string) => void;
  deleteEntry: (id: string) => void;
  getEntriesForDate: (date: string) => ReadingEntry[];
  readingStreak: number;
}

export function ReadingView({ entries, addEntry, deleteEntry, getEntriesForDate, readingStreak }: ReadingViewProps) {
  const [title, setTitle] = useState("");
  const [pages, setPages] = useState("");
  const [minutes, setMinutes] = useState("");
  const [showForm, setShowForm] = useState(false);

  const today = formatDate(new Date());
  const todayEntries = getEntriesForDate(today);
  const todayPages = todayEntries.reduce((s, e) => s + e.pagesRead, 0);
  const todayMinutes = todayEntries.reduce((s, e) => s + e.minutesSpent, 0);

  // Recent entries (last 7 days)
  const recentDates: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    recentDates.push(formatDate(d));
  }

  const handleAdd = () => {
    if (title.trim()) {
      addEntry(title.trim(), parseInt(pages) || 0, parseInt(minutes) || 0, today);
      setTitle("");
      setPages("");
      setMinutes("");
      setShowForm(false);
    }
  };

  const item = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
  };

  return (
    <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.08 } } }} className="space-y-5">
      <motion.div variants={item} className="flex items-center justify-between">
        <h2 className="font-display text-xl font-bold">Reading Log</h2>
        <Button onClick={() => setShowForm(!showForm)} size="sm" className="rounded-xl gap-1">
          <Plus className="h-3.5 w-3.5" />
          Log
        </Button>
      </motion.div>

      {/* Stats row */}
      <motion.div variants={item} className="grid grid-cols-3 gap-3">
        <Card className="border-0 bg-pink-soft/50 shadow-sm">
          <CardContent className="p-3 text-center">
            <Flame className="h-4 w-4 mx-auto text-primary mb-1" />
            <p className="font-display text-xl font-bold">{readingStreak}</p>
            <p className="text-[10px] text-muted-foreground">Day Streak</p>
          </CardContent>
        </Card>
        <Card className="border-0 bg-accent/50 shadow-sm">
          <CardContent className="p-3 text-center">
            <FileText className="h-4 w-4 mx-auto text-primary mb-1" />
            <p className="font-display text-xl font-bold">{todayPages}</p>
            <p className="text-[10px] text-muted-foreground">Pages Today</p>
          </CardContent>
        </Card>
        <Card className="border-0 bg-secondary/50 shadow-sm">
          <CardContent className="p-3 text-center">
            <Clock className="h-4 w-4 mx-auto text-primary mb-1" />
            <p className="font-display text-xl font-bold">{todayMinutes}</p>
            <p className="text-[10px] text-muted-foreground">Min Today</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Add form */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4 space-y-3">
                <Input placeholder="What did you read?" value={title} onChange={e => setTitle(e.target.value)} className="rounded-xl" />
                <div className="grid grid-cols-2 gap-2">
                  <Input type="number" placeholder="Pages" value={pages} onChange={e => setPages(e.target.value)} className="rounded-xl" />
                  <Input type="number" placeholder="Minutes" value={minutes} onChange={e => setMinutes(e.target.value)} className="rounded-xl" />
                </div>
                <Button onClick={handleAdd} className="w-full rounded-xl">Add Entry</Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Streak visualization - last 7 days */}
      <motion.div variants={item}>
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Last 7 Days</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between">
              {recentDates.reverse().map(date => {
                const dayEntries = getEntriesForDate(date);
                const hasReading = dayEntries.length > 0;
                const d = new Date(date);
                return (
                  <div key={date} className="flex flex-col items-center gap-1">
                    <div className={`h-8 w-8 rounded-lg flex items-center justify-center text-xs font-medium transition-colors ${
                      hasReading ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    }`}>
                      {d.getDate()}
                    </div>
                    <span className="text-[10px] text-muted-foreground">
                      {d.toLocaleDateString("en", { weekday: "short" }).slice(0, 2)}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Today's entries */}
      <motion.div variants={item}>
        <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-primary" />
          Today's Reading
        </h3>
        <div className="space-y-2">
          <AnimatePresence>
            {todayEntries.map(entry => (
              <motion.div key={entry.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{entry.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {entry.pagesRead > 0 && `${entry.pagesRead} pages`}
                        {entry.pagesRead > 0 && entry.minutesSpent > 0 && " · "}
                        {entry.minutesSpent > 0 && `${entry.minutesSpent} min`}
                      </p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => deleteEntry(entry.id)} className="h-7 w-7 text-muted-foreground">
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
          {todayEntries.length === 0 && (
            <p className="text-center text-sm text-muted-foreground py-6">No reading logged today. Tap + to start</p>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
