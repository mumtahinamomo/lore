import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Pencil, Check, X, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { formatDate } from "@/lib/store";
import type { Task } from "@/lib/store";

interface TodoViewProps {
  tasks: Task[];
  addTask: (text: string, date: string) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  editTask: (id: string, text: string) => void;
  getTasksForDate: (date: string) => Task[];
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export function TodoView({ addTask, toggleTask, deleteTask, editTask, getTasksForDate }: TodoViewProps) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [newTask, setNewTask] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");

  const dateStr = formatDate(selectedDate);
  const dayTasks = getTasksForDate(dateStr);
  const completed = dayTasks.filter(t => t.completed).length;
  const total = dayTasks.length;
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

  const handleAdd = () => {
    if (newTask.trim()) {
      addTask(newTask.trim(), dateStr);
      setNewTask("");
    }
  };

  const startEdit = (task: Task) => {
    setEditingId(task.id);
    setEditText(task.text);
  };

  const saveEdit = () => {
    if (editingId && editText.trim()) {
      editTask(editingId, editText.trim());
      setEditingId(null);
    }
  };

  const navigateDay = (delta: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + delta);
    setSelectedDate(d);
  };

  // Mini calendar
  const year = selectedDate.getFullYear();
  const month = selectedDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const calendarDays: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) calendarDays.push(null);
  for (let i = 1; i <= daysInMonth; i++) calendarDays.push(i);

  const navigateMonth = (delta: number) => {
    const d = new Date(selectedDate);
    d.setMonth(d.getMonth() + delta);
    d.setDate(1);
    setSelectedDate(d);
  };

  const todayStr = formatDate(new Date());

  return (
    <div className="space-y-5">
      {/* Mini Calendar */}
      <Card className="border-0 shadow-sm overflow-hidden">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="icon" onClick={() => navigateMonth(-1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <CardTitle className="text-base">{MONTHS[month]} {year}</CardTitle>
            <Button variant="ghost" size="icon" onClick={() => navigateMonth(1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pb-4">
          <div className="grid grid-cols-7 gap-1 text-center">
            {DAYS.map(d => (
              <div key={d} className="text-xs font-medium text-muted-foreground py-1">{d}</div>
            ))}
            {calendarDays.map((day, i) => {
              if (day === null) return <div key={`empty-${i}`} />;
              const dayDate = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
              const isSelected = dayDate === dateStr;
              const isToday = dayDate === todayStr;
              const hasTasks = getTasksForDate(dayDate).length > 0;

              return (
                <button
                  key={day}
                  onClick={() => setSelectedDate(new Date(year, month, day))}
                  className={`relative text-xs rounded-lg py-1.5 transition-all ${
                    isSelected
                      ? "bg-primary text-primary-foreground font-bold"
                      : isToday
                        ? "bg-pink-soft font-semibold"
                        : "hover:bg-accent"
                  }`}
                >
                  {day}
                  {hasTasks && !isSelected && (
                    <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-primary" />
                  )}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Date nav + progress */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={() => navigateDay(-1)}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="text-center">
          <p className="font-display font-semibold">
            {selectedDate.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
          </p>
          {total > 0 && (
            <p className="text-xs text-muted-foreground">{completed}/{total} completed</p>
          )}
        </div>
        <Button variant="ghost" size="icon" onClick={() => navigateDay(1)}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {total > 0 && <Progress value={progress} className="h-2" />}

      {/* Add task */}
      <div className="flex gap-2">
        <Input
          placeholder="Add a task..."
          value={newTask}
          onChange={e => setNewTask(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleAdd()}
          className="rounded-xl"
        />
        <Button onClick={handleAdd} size="icon" className="rounded-xl shrink-0">
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Task list */}
      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {dayTasks.map(task => (
            <motion.div
              key={task.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="border-0 shadow-sm">
                <CardContent className="p-3 flex items-center gap-3">
                  {editingId === task.id ? (
                    <>
                      <Input value={editText} onChange={e => setEditText(e.target.value)} onKeyDown={e => e.key === "Enter" && saveEdit()} className="flex-1 h-8 rounded-lg" autoFocus />
                      <Button variant="ghost" size="icon" onClick={saveEdit} className="h-8 w-8">
                        <Check className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setEditingId(null)} className="h-8 w-8">
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <Checkbox
                        checked={task.completed}
                        onCheckedChange={() => toggleTask(task.id)}
                        className="rounded-full h-5 w-5"
                      />
                      <span className={`flex-1 text-sm ${task.completed ? "line-through text-muted-foreground" : ""}`}>
                        {task.text}
                      </span>
                      <Button variant="ghost" size="icon" onClick={() => startEdit(task)} className="h-7 w-7 text-muted-foreground">
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => deleteTask(task.id)} className="h-7 w-7 text-muted-foreground">
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>

        {dayTasks.length === 0 && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-sm text-muted-foreground py-8">
            No tasks for this day. Add one above!
          </motion.p>
        )}
      </div>
    </div>
  );
}
