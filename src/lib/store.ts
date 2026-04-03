import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Task {
  id: string;
  text: string;
  completed: boolean;
  date: string; // YYYY-MM-DD
}

export interface ReadingEntry {
  id: string;
  title: string;
  pagesRead: number;
  minutesSpent: number;
  date: string; // YYYY-MM-DD
}

export interface DailyNote {
  id: string;
  content: string;
  date: string;
  images: NoteImage[];
}

export interface NoteImage {
  id: string;
  imageUrl: string;
}

export function useTasks(userId: string | undefined) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = useCallback(async () => {
    if (!userId) return;
    const { data } = await supabase
      .from("tasks")
      .select("*")
      .eq("user_id", userId)
      .order("date", { ascending: false });
    if (data) {
      setTasks(data.map(t => ({ id: t.id, text: t.text, completed: t.completed, date: t.date })));
    }
    setLoading(false);
  }, [userId]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const addTask = useCallback(async (text: string, date: string) => {
    if (!userId) return;
    const { data } = await supabase
      .from("tasks")
      .insert({ user_id: userId, text, date, completed: false })
      .select()
      .single();
    if (data) setTasks(prev => [...prev, { id: data.id, text: data.text, completed: data.completed, date: data.date }]);
  }, [userId]);

  const toggleTask = useCallback(async (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    await supabase.from("tasks").update({ completed: !task.completed }).eq("id", id);
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  }, [tasks]);

  const deleteTask = useCallback(async (id: string) => {
    await supabase.from("tasks").delete().eq("id", id);
    setTasks(prev => prev.filter(t => t.id !== id));
  }, []);

  const editTask = useCallback(async (id: string, text: string) => {
    await supabase.from("tasks").update({ text }).eq("id", id);
    setTasks(prev => prev.map(t => t.id === id ? { ...t, text } : t));
  }, []);

  const getTasksForDate = useCallback((date: string) => tasks.filter(t => t.date === date), [tasks]);

  const getTasksForMonth = useCallback((year: number, month: number) => {
    const prefix = `${year}-${String(month + 1).padStart(2, "0")}`;
    return tasks.filter(t => t.date.startsWith(prefix));
  }, [tasks]);

  return { tasks, loading, addTask, toggleTask, deleteTask, editTask, getTasksForDate, getTasksForMonth };
}

export function useReadingLog(userId: string | undefined) {
  const [entries, setEntries] = useState<ReadingEntry[]>([]);

  const fetchEntries = useCallback(async () => {
    if (!userId) return;
    const { data } = await supabase
      .from("reading_entries")
      .select("*")
      .eq("user_id", userId)
      .order("date", { ascending: false });
    if (data) {
      setEntries(data.map(e => ({ id: e.id, title: e.title, pagesRead: e.pages_read, minutesSpent: e.minutes_spent, date: e.date })));
    }
  }, [userId]);

  useEffect(() => { fetchEntries(); }, [fetchEntries]);

  const addEntry = useCallback(async (title: string, pagesRead: number, minutesSpent: number, date: string) => {
    if (!userId) return;
    const { data } = await supabase
      .from("reading_entries")
      .insert({ user_id: userId, title, pages_read: pagesRead, minutes_spent: minutesSpent, date })
      .select()
      .single();
    if (data) setEntries(prev => [...prev, { id: data.id, title: data.title, pagesRead: data.pages_read, minutesSpent: data.minutes_spent, date: data.date }]);
  }, [userId]);

  const deleteEntry = useCallback(async (id: string) => {
    await supabase.from("reading_entries").delete().eq("id", id);
    setEntries(prev => prev.filter(e => e.id !== id));
  }, []);

  const getEntriesForDate = useCallback((date: string) => entries.filter(e => e.date === date), [entries]);

  const getEntriesForMonth = useCallback((year: number, month: number) => {
    const prefix = `${year}-${String(month + 1).padStart(2, "0")}`;
    return entries.filter(e => e.date.startsWith(prefix));
  }, [entries]);

  const getReadingStreak = useCallback(() => {
    const dates = [...new Set(entries.map(e => e.date))].sort().reverse();
    if (dates.length === 0) return 0;
    let streak = 1;
    for (let i = 0; i < dates.length - 1; i++) {
      const curr = new Date(dates[i]);
      const prev = new Date(dates[i + 1]);
      const diff = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
      if (diff === 1) streak++;
      else break;
    }
    return streak;
  }, [entries]);

  return { entries, addEntry, deleteEntry, getEntriesForDate, getEntriesForMonth, getReadingStreak };
}

export function useNotes(userId: string | undefined) {
  const [notes, setNotes] = useState<DailyNote[]>([]);

  const fetchNotes = useCallback(async () => {
    if (!userId) return;
    const { data } = await supabase
      .from("daily_notes")
      .select("*, note_images(*)")
      .eq("user_id", userId)
      .order("date", { ascending: false });
    if (data) {
      setNotes(data.map(n => ({
        id: n.id,
        content: n.content,
        date: n.date,
        images: (n.note_images || []).map((img: { id: string; image_url: string }) => ({ id: img.id, imageUrl: img.image_url })),
      })));
    }
  }, [userId]);

  useEffect(() => { fetchNotes(); }, [fetchNotes]);

  const saveNote = useCallback(async (content: string, date: string) => {
    if (!userId) return null;
    const existing = notes.find(n => n.date === date);
    if (existing) {
      await supabase.from("daily_notes").update({ content }).eq("id", existing.id);
      setNotes(prev => prev.map(n => n.id === existing.id ? { ...n, content } : n));
      return existing.id;
    } else {
      const { data } = await supabase
        .from("daily_notes")
        .insert({ user_id: userId, content, date })
        .select()
        .single();
      if (data) {
        const newNote: DailyNote = { id: data.id, content: data.content, date: data.date, images: [] };
        setNotes(prev => [newNote, ...prev]);
        return data.id;
      }
      return null;
    }
  }, [userId, notes]);

  const addImage = useCallback(async (noteId: string, file: File) => {
    if (!userId) return;
    const ext = file.name.split(".").pop();
    const path = `${userId}/${noteId}/${crypto.randomUUID()}.${ext}`;
    const { error: uploadError } = await supabase.storage.from("note-images").upload(path, file);
    if (uploadError) throw uploadError;
    const { data: urlData } = supabase.storage.from("note-images").getPublicUrl(path);
    const imageUrl = urlData.publicUrl;

    const { data } = await supabase
      .from("note_images")
      .insert({ note_id: noteId, image_url: imageUrl })
      .select()
      .single();

    if (data) {
      setNotes(prev => prev.map(n =>
        n.id === noteId
          ? { ...n, images: [...n.images, { id: data.id, imageUrl: data.image_url }] }
          : n
      ));
    }
  }, [userId]);

  const deleteImage = useCallback(async (noteId: string, imageId: string) => {
    await supabase.from("note_images").delete().eq("id", imageId);
    setNotes(prev => prev.map(n =>
      n.id === noteId
        ? { ...n, images: n.images.filter(i => i.id !== imageId) }
        : n
    ));
  }, []);

  const getNoteForDate = useCallback((date: string) => notes.find(n => n.date === date) || null, [notes]);

  return { notes, saveNote, addImage, deleteImage, getNoteForDate };
}

export interface SavedItem {
  id: string;
  type: "link" | "snippet";
  title: string;
  url: string | null;
  content: string;
  tags: string[];
  createdAt: string;
}

export function useSavedItems(userId: string | undefined) {
  const [items, setItems] = useState<SavedItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchItems = useCallback(async () => {
    if (!userId) return;
    const { data } = await supabase
      .from("saved_items")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (data) {
      setItems(data.map(i => ({ id: i.id, type: i.type as "link" | "snippet", title: i.title, url: i.url, content: i.content ?? "", tags: i.tags ?? [], createdAt: i.created_at })));
    }
    setLoading(false);
  }, [userId]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const addItem = useCallback(async (item: { type: "link" | "snippet"; title: string; url?: string; content?: string; tags?: string[] }) => {
    if (!userId) return;
    const { data } = await supabase
      .from("saved_items")
      .insert({ user_id: userId, type: item.type, title: item.title, url: item.url ?? null, content: item.content ?? "", tags: item.tags ?? [] })
      .select()
      .single();
    if (data) setItems(prev => [{ id: data.id, type: data.type as "link" | "snippet", title: data.title, url: data.url, content: data.content ?? "", tags: data.tags ?? [], createdAt: data.created_at }, ...prev]);
  }, [userId]);

  const deleteItem = useCallback(async (id: string) => {
    await supabase.from("saved_items").delete().eq("id", id);
    setItems(prev => prev.filter(i => i.id !== id));
  }, []);

  const updateItem = useCallback(async (id: string, updates: { title?: string; url?: string; content?: string; tags?: string[] }) => {
    await supabase.from("saved_items").update(updates).eq("id", id);
    setItems(prev => prev.map(i => i.id === id ? { ...i, ...updates } : i));
  }, []);

  return { items, loading, addItem, deleteItem, updateItem };
}

export function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}
