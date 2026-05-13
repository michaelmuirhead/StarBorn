"use client";

import { useGame } from "@/game/store";
import { findChoiceEvent } from "@/game/choice_events";
import { FACTIONS } from "@/game/factions";
import { GOVERNMENTS } from "@/game/factions";
import type { ChoiceEffect, FactionId, Resources } from "@/game/types";

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

function describeEffect(e: ChoiceEffect): string[] {
  const lines: string[] = [];
  if (e.resources) {
    for (const k in e.resources) {
      const v = e.resources[k as keyof Resources];
      if (v) lines.push(`${v > 0 ? "+" : ""}${v} ${SHORT[k as keyof Resources]}`);
    }
  }
  if (e.morale) lines.push(`${e.morale > 0 ? "+" : ""}${e.morale} morale`);
  if (e.loyalty) lines.push(`${e.loyalty > 0 ? "+" : ""}${e.loyalty} loyalty`);
  if (e.factionHappiness) {
    for (const f in e.factionHappiness) {
      const v = e.factionHappiness[f as FactionId];
      if (v)
        lines.push(
          `${FACTIONS[f as FactionId].shortName} ${v > 0 ? "+" : ""}${v} happiness`
        );
    }
  }
  if (e.factionInfluence) {
    for (const f in e.factionInfluence) {
      const v = e.factionInfluence[f as FactionId];
      if (v)
        lines.push(
          `${FACTIONS[f as FactionId].shortName} ${v > 0 ? "+" : ""}${v} influence`
        );
    }
  }
  if (e.setGovernment) lines.push(`→ ${GOVERNMENTS[e.setGovernment].name}`);
  if (e.setIndependence) lines.push("→ Independence declared");
  return lines;
}

export default function ChoicePrompt() {
  const pending = useGame((s) => s.pendingChoice);
  const apply = useGame((s) => s.applyChoice);
  if (!pending) return null;
  const def = findChoiceEvent(pending.defId);
  if (!def) return null;

  return (
    <div className="panel p-3 border-amber-400/40 bg-amber-900/15 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-sm uppercase tracking-widest text-amber-200">
          ⚑ Decision
        </span>
        <span className="text-[10px] uppercase tracking-widest text-space-200">
          Sol {pending.offeredSol}
        </span>
      </div>
      <div className="text-mars-100 text-sm">{def.name}</div>
      <p className="text-[12px] text-space-50 leading-snug">{def.description}</p>
      <div className="flex flex-col gap-1.5 pt-1">
        {def.choices.map((c) => {
          const lines = describeEffect(c.effect);
          return (
            <button
              key={c.id}
              onClick={() => apply(c.id)}
              className="text-left p-2 rounded-md border border-amber-700/40 bg-space-700/40 hover:bg-space-600/60 transition"
              title={c.description}
            >
              <div className="text-sm text-amber-100">{c.label}</div>
              <div className="text-[11px] text-space-200 leading-snug">{c.description}</div>
              {lines.length > 0 && (
                <div className="mt-1 flex flex-wrap gap-x-2 gap-y-0.5 text-[11px] font-mono text-space-50">
                  {lines.map((l) => (
                    <span key={l}>{l}</span>
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
