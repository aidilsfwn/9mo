import type { TabKey } from "@/types";
import { Baby, ChartLine, Scale, Timer } from "lucide-react";

interface BottomNavProps {
  activeTab: TabKey;
  onChange: (tab: TabKey) => void;
}

const tabs: { key: TabKey; label: string; Icon: React.ComponentType<any> }[] = [
  { key: "summary", label: "Summary", Icon: ChartLine },
  { key: "kicks", label: "Kicks", Icon: Baby },
  { key: "weight", label: "Weight", Icon: Scale },
  { key: "contractions", label: "Timer", Icon: Timer },
];

export const BottomNav = ({ activeTab, onChange }: BottomNavProps) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-20 border-t bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-md items-center justify-between gap-1 px-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2">
        {tabs.map(({ key, label, Icon }) => {
          const isActive = activeTab === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => onChange(key)}
              className={`relative flex flex-1 flex-col items-center gap-0.5 rounded-xl px-2 py-1 text-xs font-medium transition ${
                isActive
                  ? "text-pink-600"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              {isActive && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 h-0.5 w-6 rounded-full bg-pink-500" />
              )}
              <Icon className="h-5 w-5" />
              <span>{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

