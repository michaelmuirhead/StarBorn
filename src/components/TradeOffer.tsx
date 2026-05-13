"use client";

import { useGame } from "@/game/store";
import type { Resources } from "@/game/types";

const SHORT: Record<keyof Resources, string> = {
  credits: "₡",
  food: "food",
  water: "water",
  oxygen: "O₂",
  power: "⚡",
  minerals: "ore",
  alloys: "alloys",
  rare_earths: "REE",
  research: "rp",
};

function describe(obj: Partial<Resources>) {
  const entries = Object.entries(obj).filter(([, v]) => v && v !== 0);
  if (entries.length === 0) return "—";
  return entries.map(([k, v]) => `${v} ${SHORT[k as keyof Resources]}`).join(", ");
}

export default function TradeOffer() {
  const offer = useGame((s) => s.pendingOffer);
  const sol = useGame((s) => s.sol);
  const resources = useGame((s) => s.resources);
  const accept = useGame((s) => s.acceptOffer);
  const decline = useGame((s) => s.declineOffer);

  if (!offer) return null;
  const solsLeft = offer.expiresSol - sol;
  const affordable = Object.entries(offer.cost).every(
    ([k, v]) => (resources[k as keyof Resources] ?? 0) >= (v ?? 0)
  );

  return (
    <div className="panel p-3 border-mars-300/40 bg-mars-700/20 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-sm uppercase tracking-widest text-mars-100">
          ✈ Trade Offer
        </span>
        <span className="text-[10px] uppercase tracking-widest text-space-200">
          expires in {solsLeft} sol{solsLeft === 1 ? "" : "s"}
        </span>
      </div>
      <p className="text-[12px] text-space-50 leading-snug">{offer.flavor}</p>
      <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
        <div>
          <div className="text-[10px] uppercase tracking-widest text-space-200">You give</div>
          <div className="text-rose-200">{describe(offer.cost)}</div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-widest text-space-200">You receive</div>
          <div className="text-emerald-200">{describe(offer.reward)}</div>
        </div>
      </div>
      <div className="flex gap-2 pt-1">
        <button
          className="btn btn-primary text-xs"
          disabled={!affordable}
          onClick={accept}
          title={affordable ? "Accept this trade" : "Insufficient resources"}
        >
          Accept
        </button>
        <button className="btn text-xs" onClick={decline}>
          Decline
        </button>
      </div>
    </div>
  );
}
