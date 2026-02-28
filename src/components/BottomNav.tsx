import type { TabKey } from "@/types";
import { Baby, ChartLine, Scale, Timer } from "lucide-react";

interface BottomNavProps {
  activeTab: TabKey;
  onChange: (tab: TabKey) => void;
}

const tabs: { key: TabKey; label: string; Icon: React.ComponentType<any> }[] = [
  { key: "kicks", label: "Kicks", Icon: Baby },
  { key: "weight", label: "Weight", Icon: Scale },
  { key: "contractions", label: "Contractions", Icon: Timer },
  { key: "summary", label: "Summary", Icon: ChartLine },
];

export const BottomNav = ({ activeTab, onChange }: BottomNavProps) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-20 border-t bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-md items-center justify-between px-4 pb-[env(safe-area-inset-bottom)] pt-2">
        {tabs.map(({ key, label, Icon }) => {
          const isActive = activeTab === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => onChange(key)}
              className={`flex flex-1 flex-col items-center gap-0.5 rounded-full px-2 py-1 text-xs font-medium transition ${
                isActive
                  ? "bg-pink-100 text-pink-600"
                  : "text-gray-500 hover:bg-gray-100"
              }`}
            >
              <Icon
                className={`h-5 w-5 ${
                  isActive ? "text-pink-600" : "text-gray-500"
                }`}
              />
              <span>{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

