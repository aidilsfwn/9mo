import { useRef, useState } from "react";
import { Heart } from "lucide-react";
import { toast } from "sonner";

import { Toaster } from "@/components/ui";
import { BottomNav } from "@/components/BottomNav";
import { Loading } from "@/components";
import { useKicks, useWeight } from "@/hooks";
import type { Contraction, TabKey } from "@/types";
import { KicksTab } from "@/components/tabs/KicksTab";
import { WeightTab } from "@/components/tabs/WeightTab";
import { ContractionsTab } from "@/components/tabs/ContractionsTab";
import { SummaryTab } from "@/components/tabs/SummaryTab";
import logo from "./assets/logo.svg";

const App = () => {
  const [activeTab, setActiveTab] = useState<TabKey>("summary");
  const [logLoading, setLogLoading] = useState<boolean>(false);
  const [contractions, setContractions] = useState<Contraction[]>([]);

  const lastKickIdRef = useRef<string | null>(null);

  const {
    kicks,
    loading: kicksLoading,
    addKick,
    removeKick,
  } = useKicks();
  const {
    weights,
    loading: weightsLoading,
    addWeight,
    removeWeight,
  } = useWeight();

  const handleUndo = async () => {
    setLogLoading(true);
    if (!lastKickIdRef.current) {
      toast.error("No kick to undo");
      setLogLoading(false);
      return;
    }

    try {
      await removeKick(lastKickIdRef.current);
      lastKickIdRef.current = null;
      toast.success("Kick removed");
    } catch {
      toast.error("Failed to remove kick");
    } finally {
      setLogLoading(false);
    }
  };

  const handleLogKick = async () => {
    setLogLoading(true);
    try {
      const kickId = await addKick();
      lastKickIdRef.current = kickId;
      toast.success("Kick logged successfully! 🎉", {
        action: {
          label: "Undo",
          onClick: handleUndo,
        },
      });
    } catch {
      toast.error("Failed to log kick. Please try again.");
    } finally {
      setLogLoading(false);
    }
  };

  if (kicksLoading) return <Loading />;

  const renderContent = () => {
    switch (activeTab) {
      case "kicks":
        return (
          <KicksTab
            kicks={kicks}
            logging={logLoading}
            onLogKick={handleLogKick}
          />
        );
      case "weight":
        return (
          <WeightTab
            weights={weights}
            loading={weightsLoading}
            onAddWeight={addWeight}
            onRemoveWeight={async (id) => {
              await removeWeight(id);
            }}
          />
        );
      case "contractions":
        return (
          <ContractionsTab
            contractions={contractions}
            onChange={setContractions}
          />
        );
      case "summary":
        return (
          <SummaryTab
            kicks={kicks}
            weights={weights}
            contractions={contractions}
          />
        );
      default:
        return null;
    }
  };

  const headerAccent: Record<TabKey, string> = {
    summary: "border-purple-200/80",
    kicks: "border-pink-200/80",
    weight: "border-purple-200/80",
    contractions: "border-red-200/80",
  };

  return (
    <div className="flex min-h-screen flex-col bg-linear-to-br from-pink-50 via-purple-50 to-blue-50">
      <header className={`fixed top-0 left-0 right-0 z-20 border-b ${headerAccent[activeTab]} bg-white/95 shadow-sm backdrop-blur-md transition-colors duration-300`}>
        <div className="mx-auto flex max-w-md items-center gap-3 px-5 py-3 pt-[max(0.75rem,env(safe-area-inset-top,0px))] pb-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-pink-100 to-purple-100 shadow-sm">
            <img
              src={logo}
              alt=""
              className="h-9 w-9"
            />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-base font-semibold tracking-tight text-gray-900">
              9mo.
            </h1>
            <p className="flex items-center gap-1.5 truncate text-xs text-neutral-500">
              <Heart fill="#ff78ae" className="h-3 w-3 shrink-0 text-[#ff78ae]" />
              <span className="italic">For Nana, with all my love</span>
            </p>
          </div>
        </div>
      </header>
      <main className="flex flex-1 justify-center px-5 pb-24 pt-[calc(5rem+1.25rem+env(safe-area-inset-top,0px))]">
        <div className="w-full max-w-md">{renderContent()}</div>
      </main>
      <BottomNav activeTab={activeTab} onChange={setActiveTab} />
      <Toaster position="top-center" />
    </div>
  );
};

export default App;
