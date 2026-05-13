"use client";

import { useEffect, useRef, useState } from "react";
import TopBar from "./TopBar";
import ResourcePanel from "./ResourcePanel";
import MarsMap from "./MarsMap";
import BuildMenu from "./BuildMenu";
import ResearchPanel from "./ResearchPanel";
import EventLog from "./EventLog";
import TradeOffer from "./TradeOffer";
import GovernorCard from "./GovernorCard";
import FactionsPanel from "./FactionsPanel";
import LawsPanel from "./LawsPanel";
import ChoicePrompt from "./ChoicePrompt";
import {
  hydrateFromStorage,
  isStormSeason,
  snapshotProduction,
  solInYear,
  useGame,
} from "@/game/store";
import { ATMOSPHERE_VICTORY, SOL_MS, YEAR_SOLS } from "@/game/constants";

export default function GameView() {
  const [hydrated, setHydrated] = useState(false);
  const speed = useGame((s) => s.speed);
  const tick = useGame((s) => s.tick);
  const lastTickRef = useRef<number>(0);

  useEffect(() => {
    hydrateFromStorage();
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated || speed === 0) return;
    const interval = SOL_MS / speed;
    let raf = 0;
    const loop = (now: number) => {
      if (!lastTickRef.current) lastTickRef.current = now;
      if (now - lastTickRef.current >= interval) {
        tick();
        lastTickRef.current = now;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [hydrated, speed, tick]);

  if (!hydrated) {
    return (
      <main className="min-h-screen flex items-center justify-center text-mars-200 text-sm tracking-widest uppercase">
        Booting colony systems…
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col">
      <TopBar />
      <div className="mx-3 mt-3 flex flex-col gap-2">
        <ResourcePanel />
        <AtmosphereBar />
        <VictoryBanner />
      </div>
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[320px_minmax(0,1fr)_320px] gap-3 m-3">
        <div className="flex flex-col gap-3 min-h-0">
          <GovernorCard />
          <BuildMenu />
        </div>
        <div className="flex flex-col gap-3 min-h-0">
          <ChoicePrompt />
          <MarsMap />
          <FlavorBar />
          <TradeOffer />
          <LawsPanel />
        </div>
        <div className="flex flex-col gap-3 min-h-0">
          <FactionsPanel />
          <ResearchPanel />
          <EventLog />
        </div>
      </div>
      <footer className="text-[10px] text-space-200 text-center pb-3">
        StarBorn · single-player MVP · save lives in your browser
      </footer>
    </main>
  );
}

function FlavorBar() {
  const sol = useGame((s) => s.sol);
  const buildings = useGame((s) => s.buildings.length);
  const research = useGame((s) => s.research.completed.length);
  const soldiers = useGame((s) => s.strata.soldiers);
  const independence = useGame((s) => s.independence);
  const state = useGame();
  const soldierCapacity = snapshotProduction(state).soldierCapacity;
  const stormy = isStormSeason(sol);
  const yearSol = solInYear(sol);
  const milTone =
    soldiers > soldierCapacity && soldiers > 0
      ? "text-rose-300"
      : soldiers > 0
        ? "text-mars-100"
        : "text-space-200";
  return (
    <div className="panel px-3 py-2 text-[11px] flex flex-wrap gap-x-4 gap-y-1 text-space-200">
      <span>
        Sol <span className="text-mars-100 font-mono">{sol}</span>
      </span>
      <span>
        Year-sol <span className="text-mars-100 font-mono">{yearSol}/{YEAR_SOLS}</span>
      </span>
      <span>
        Structures <span className="text-mars-100 font-mono">{buildings}</span>
      </span>
      <span>
        Techs <span className="text-mars-100 font-mono">{research}</span>
      </span>
      <span
        title="Soldiers / total barracks capacity. Overflow drags morale."
      >
        Military <span className={`font-mono ${milTone}`}>
          {Math.floor(soldiers)}/{Math.floor(soldierCapacity)}
        </span>
      </span>
      {independence && (
        <span className="text-emerald-300" title="Mars has declared independence. Phase 3 hook.">
          ✪ Independent
        </span>
      )}
      <span
        className={`ml-auto ${stormy ? "text-amber-300" : "text-space-200"}`}
        title="Martian storm season clusters dust storms in the second half of each year."
      >
        {stormy ? "⚠ Storm Season" : "Clear Skies"}
      </span>
    </div>
  );
}

function AtmosphereBar() {
  const atmosphere = useGame((s) => s.atmosphere);
  const pct = Math.min(100, (atmosphere / ATMOSPHERE_VICTORY) * 100);
  if (atmosphere === 0) return null;
  return (
    <div className="panel px-3 py-2">
      <div className="flex items-center justify-between text-[11px]">
        <span className="uppercase tracking-widest text-mars-200">Terraforming</span>
        <span className="font-mono text-space-50">
          {atmosphere.toFixed(1)} / {ATMOSPHERE_VICTORY}
        </span>
      </div>
      <div className="mt-1 h-2 rounded bg-space-700 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-sky-300"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="text-[10px] text-space-200 mt-1">
        As atmosphere rises, colonists need less bottled oxygen.
      </div>
    </div>
  );
}

function VictoryBanner() {
  const victory = useGame((s) => s.victory);
  if (!victory) return null;
  return (
    <div className="panel px-3 py-2 border-emerald-500/40 bg-emerald-900/20 text-emerald-100">
      <div className="text-sm uppercase tracking-widest">🌱 Mars terraformed</div>
      <div className="text-[12px] text-emerald-200 mt-0.5">
        The atmosphere holds. Earth-Mars relations and off-world expansion arrive
        in Phase 3.
      </div>
    </div>
  );
}
