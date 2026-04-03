import { Home, CheckSquare, BarChart3, BookOpen, StickyNote, Bookmark } from "lucide-react";
import { motion } from "framer-motion";

export type ViewType = "dashboard" | "todos" | "progress" | "reading" | "notes" | "saved";

interface BottomNavProps {
  active: ViewType;
  onChange: (view: ViewType) => void;
}

const tabs: { id: ViewType; label: string; icon: typeof Home }[] = [
  { id: "dashboard", label: "Home", icon: Home },
  { id: "todos", label: "Tasks", icon: CheckSquare },
  { id: "notes", label: "Notes", icon: StickyNote },
  { id: "reading", label: "Reading", icon: BookOpen },
  { id: "saved", label: "Saved", icon: Bookmark },
  { id: "progress", label: "Stats", icon: BarChart3 },
];

export function BottomNav({ active, onChange }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-xl border-t border-border">
      <div className="max-w-lg mx-auto flex items-center justify-around py-2 px-2">
        {tabs.map(tab => {
          const isActive = active === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className="relative flex flex-col items-center gap-0.5 py-1 px-2 transition-colors"
            >
              {isActive && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute -top-2 left-1/2 -translate-x-1/2 h-1 w-6 rounded-full bg-primary"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <Icon className={`h-5 w-5 transition-colors ${isActive ? "text-primary" : "text-muted-foreground"}`} />
              <span className={`text-[10px] font-medium transition-colors ${isActive ? "text-primary" : "text-muted-foreground"}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
