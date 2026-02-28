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
  const [activeTab, setActiveTab] = useState<TabKey>("kicks");
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

  return (
    <div className="flex min-h-screen flex-col bg-linear-to-br from-pink-50 via-purple-50 to-blue-50">
      <div className="flex flex-1 justify-center pb-24">
        <div className="w-full max-w-md space-y-4">
          <header className="flex flex-col bg-white px-6 py-4 shadow-sm">
            <div className="flex flex-row items-center gap-4">
              <img
                src={logo}
                alt="Nana's Pregnancy Tracker logo"
                className="h-16 w-16"
              />
              <div className="flex flex-col gap-1">
                <span className="text-xl font-semibold">
                  Nana&apos;s Pregnancy Tracker
                </span>
                <div className="flex flex-row items-center gap-2">
                  <span className="text-sm italic text-neutral-400">
                    Built with love, by yours truly
                  </span>
                  <Heart
                    fill="#ff78ae"
                    className="h-4 w-4 text-[#ff78ae]"
                  />
                </div>
              </div>
            </div>
          </header>
          <main className="px-6 pb-4 pt-2">{renderContent()}</main>
        </div>
      </div>
      <BottomNav activeTab={activeTab} onChange={setActiveTab} />
      <Toaster position="top-center" />
    </div>
  );
};

export default App;
