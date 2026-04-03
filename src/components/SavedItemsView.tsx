import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Link2, FileText, Trash2, ExternalLink, X, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import type { SavedItem } from "@/lib/store";

interface SavedItemsViewProps {
  items: SavedItem[];
  loading: boolean;
  addItem: (item: { type: "link" | "snippet"; title: string; url?: string; content?: string; tags?: string[] }) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
}

export function SavedItemsView({ items, loading, addItem, deleteItem }: SavedItemsViewProps) {
  const [showForm, setShowForm] = useState(false);
  const [type, setType] = useState<"link" | "snippet">("link");
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [content, setContent] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [filter, setFilter] = useState<"all" | "link" | "snippet">("all");

  const filtered = filter === "all" ? items : items.filter(i => i.type === filter);

  const handleAddTag = () => {
    const t = tagInput.trim().toLowerCase();
    if (t && !tags.includes(t)) {
      setTags([...tags, t]);
      setTagInput("");
    }
  };

  const handleSubmit = async () => {
    if (!title.trim()) return;
    await addItem({ type, title: title.trim(), url: type === "link" ? url.trim() : undefined, content: content.trim(), tags });
    setTitle("");
    setUrl("");
    setContent("");
    setTags([]);
    setShowForm(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold text-foreground">Saved Items</h1>
        <Button size="sm" onClick={() => setShowForm(!showForm)} className="rounded-full gap-1">
          {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showForm ? "Cancel" : "Add"}
        </Button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-card rounded-2xl p-4 border border-border space-y-3">
              {/* Type toggle */}
              <div className="flex gap-2">
                <button
                  onClick={() => setType("link")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${type === "link" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}
                >
                  <Link2 className="h-3.5 w-3.5" /> Link
                </button>
                <button
                  onClick={() => setType("snippet")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${type === "snippet" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}
                >
                  <FileText className="h-3.5 w-3.5" /> Snippet
                </button>
              </div>

              <Input placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} className="rounded-xl" />
              {type === "link" && (
                <Input placeholder="https://..." value={url} onChange={e => setUrl(e.target.value)} className="rounded-xl" />
              )}
              <Textarea placeholder="Notes or content..." value={content} onChange={e => setContent(e.target.value)} className="rounded-xl min-h-[60px]" />

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 items-center">
                {tags.map(t => (
                  <Badge key={t} variant="secondary" className="gap-1 cursor-pointer" onClick={() => setTags(tags.filter(x => x !== t))}>
                    {t} <X className="h-3 w-3" />
                  </Badge>
                ))}
                <div className="flex gap-1">
                  <Input
                    placeholder="Add tag"
                    value={tagInput}
                    onChange={e => setTagInput(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && (e.preventDefault(), handleAddTag())}
                    className="h-7 w-24 text-xs rounded-lg"
                  />
                  <Button size="sm" variant="ghost" onClick={handleAddTag} className="h-7 px-2">
                    <Tag className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              <Button onClick={handleSubmit} disabled={!title.trim()} className="w-full rounded-xl">
                Save Item
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {(["all", "link", "snippet"] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${filter === f ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}
          >
            {f === "all" ? "All" : f === "link" ? "Links" : "Snippets"}
          </button>
        ))}
      </div>

      {/* Items list */}
      {loading ? (
        <div className="text-center text-muted-foreground py-8">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-lg">No saved items yet</p>
          <p className="text-sm mt-1">Tap + to save a link or snippet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="bg-card rounded-2xl p-4 border border-border group"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {item.type === "link" ? <Link2 className="h-4 w-4 text-primary shrink-0" /> : <FileText className="h-4 w-4 text-pink-glow shrink-0" />}
                    <h3 className="font-medium text-sm truncate">{item.title}</h3>
                  </div>
                  {item.url && (
                    <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1 mb-1 truncate">
                      {item.url} <ExternalLink className="h-3 w-3 shrink-0" />
                    </a>
                  )}
                  {item.content && <p className="text-xs text-muted-foreground line-clamp-2">{item.content}</p>}
                  {item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {item.tags.map(t => (
                        <Badge key={t} variant="outline" className="text-[10px] px-1.5 py-0">{t}</Badge>
                      ))}
                    </div>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteItem(item.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7 p-0 text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
