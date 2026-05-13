"use client";

import { useState } from "react";
import FactionsPanel from "./FactionsPanel";
import ResearchPanel from "./ResearchPanel";
import EventLog from "./EventLog";
import LawsPanel from "./LawsPanel";

type Tab = "sitrep" | "research" | "factions" | "laws";

const TABS: { id: Tab; label: string }[] = [
  { id: "sitrep", label: "Sitrep" },
  { id: "research", label: "Research" },
  { id: "factions", label: "Factions" },
  { id: "laws", label: "Laws" },
];

export default function RightTabs() {
  const [tab, setTab] = useState<Tab>("sitrep");
  return (
    <div className="flex flex-col gap-2 min-h-0 flex-1 overflow-hidden">
      <div className="flex gap-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`btn !py-1 !px-2 text-[11px] ${tab === t.id ? "btn-primary" : ""}`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
        {tab === "sitrep" && <EventLog />}
        {tab === "research" && <ResearchPanel />}
        {tab === "factions" && <FactionsPanel />}
        {tab === "laws" && <LawsPanel />}
      </div>
    </div>
  );
}
