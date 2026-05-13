"use client";

import { useEffect, useRef, useState } from "react";
import TopBar from "./TopBar";
import ResourcePanel from "./ResourcePanel";
import MarsMap from "./MarsMap";
import BuildMenu from "./BuildMenu";
import ResearchPanel from "./ResearchPanel";
import EventLog from "./EventLog";
import { hydrateFromStorage, useGame } from "@/game/store";
import { SOL_MS } from "@/game/constants";

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
      <div className="mx-3 mt-3">
        <ResourcePanel />
      </div>
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[320px_minmax(0,1fr)_320px] gap-3 m-3">
        <div className="flex flex-col gap-3 min-h-0">
          <BuildMenu />
        </div>
        <div className="flex flex-col gap-3 min-h-0">
          <MarsMap />
          <FlavorBar />
        </div>
        <div className="flex flex-col gap-3 min-h-0">
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
  return (
    <div className="panel px-3 py-2 text-[11px] flex flex-wrap gap-x-4 gap-y-1 text-space-200">
      <span>
        Sol <span className="text-mars-100 font-mono">{sol}</span>
      </span>
      <span>
        Structures <span className="text-mars-100 font-mono">{buildings}</span>
      </span>
      <span>
        Techs <span className="text-mars-100 font-mono">{research}</span>
      </span>
      <span className="ml-auto text-space-200">
        Tip: place a Solar Array on a Sunlit Ridge for +2 power.
      </span>
    </div>
  );
}
