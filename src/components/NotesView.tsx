import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { StickyNote, ImagePlus, Trash2, ChevronLeft, ChevronRight, Save } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/store";
import type { DailyNote } from "@/lib/store";

interface NotesViewProps {
  getNoteForDate: (date: string) => DailyNote | null;
  saveNote: (content: string, date: string) => Promise<string | null>;
  addImage: (noteId: string, file: File) => Promise<void>;
  deleteImage: (noteId: string, imageId: string) => Promise<void>;
}

export function NotesView({ getNoteForDate, saveNote, addImage, deleteImage }: NotesViewProps) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [initialized, setInitialized] = useState(false);

  const dateStr = formatDate(selectedDate);
  const note = getNoteForDate(dateStr);

  // Sync content when date or note changes
  if (!initialized || (note && content === "" && note.content !== "")) {
    if (note) {
      if (content !== note.content) setContent(note.content);
    } else {
      if (content !== "") setContent("");
    }
    if (!initialized) setInitialized(true);
  }

  const navigateDay = (delta: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + delta);
    setSelectedDate(d);
    const newDateStr = formatDate(d);
    const newNote = getNoteForDate(newDateStr);
    setContent(newNote?.content || "");
  };

  const handleSave = useCallback(async () => {
    setSaving(true);
    await saveNote(content, dateStr);
    setSaving(false);
  }, [content, dateStr, saveNote]);

  const handleImageUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      let noteId = note?.id;
      if (!noteId) {
        noteId = await saveNote(content, dateStr) || undefined;
      }
      if (noteId) {
        await addImage(noteId, file);
      }
    } catch (err) {
      console.error("Upload failed:", err);
    }
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  }, [note, content, dateStr, saveNote, addImage]);

  const item = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
  };

  return (
    <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.08 } } }} className="space-y-5">
      <motion.div variants={item} className="flex items-center justify-between">
        <h2 className="font-display text-xl font-bold flex items-center gap-2">
          <StickyNote className="h-5 w-5 text-primary" />
          Daily Notes
        </h2>
      </motion.div>

      {/* Date navigation */}
      <motion.div variants={item} className="flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={() => navigateDay(-1)}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <p className="font-display font-semibold text-sm">
          {selectedDate.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
        </p>
        <Button variant="ghost" size="icon" onClick={() => navigateDay(1)}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </motion.div>

      {/* Note editor */}
      <motion.div variants={item}>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Write your thoughts, reflections, favorite quotes..."
              className="w-full min-h-[160px] bg-transparent text-sm resize-none focus:outline-none placeholder:text-muted-foreground/60 leading-relaxed"
            />
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
              <div className="flex gap-2">
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="gap-1 text-muted-foreground text-xs"
                >
                  <ImagePlus className="h-3.5 w-3.5" />
                  {uploading ? "Uploading..." : "Add Photo"}
                </Button>
              </div>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={saving}
                className="gap-1 rounded-xl text-xs"
              >
                <Save className="h-3.5 w-3.5" />
                {saving ? "Saving..." : "Save"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Images */}
      {note && note.images.length > 0 && (
        <motion.div variants={item}>
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Photos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                <AnimatePresence>
                  {note.images.map(img => (
                    <motion.div
                      key={img.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="relative group rounded-xl overflow-hidden aspect-square"
                    >
                      <img src={img.imageUrl} alt="" className="w-full h-full object-cover" />
                      <button
                        onClick={() => deleteImage(note.id, img.id)}
                        className="absolute top-1.5 right-1.5 h-6 w-6 rounded-full bg-foreground/60 text-background flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Recent notes preview */}
      <motion.div variants={item}>
        <p className="text-xs text-muted-foreground text-center py-4">
          Your notes are saved to the cloud and synced across devices
        </p>
      </motion.div>
    </motion.div>
  );
}
