"use client";

import { depletionWarning, useGame } from "@/game/store";
import type { ResourceKey } from "@/game/types";

const ORDER: { key: ResourceKey; label: string; icon: string; flow?: boolean }[] = [
  { key: "credits", label: "Credits", icon: "₡" },
  { key: "power", label: "Power", icon: "⚡", flow: true },
  { key: "food", label: "Food", icon: "⚘" },
  { key: "water", label: "Water", icon: "☃" },
  { key: "oxygen", label: "Oxygen", icon: "♁" },
  { key: "minerals", label: "Minerals", icon: "⛏" },
  { key: "alloys", label: "Alloys", icon: "⚒" },
  { key: "research", label: "Research", icon: "⚗" },
];

function fmt(n: number, flow = false) {
  const rounded = Math.round(n * 10) / 10;
  if (flow) return rounded >= 0 ? `+${rounded}` : `${rounded}`;
  return `${Math.floor(rounded)}`;
}

export default function ResourcePanel() {
  const resources = useGame((s) => s.resources);
  const caps = useGame((s) => s.storageCaps);
  const population = useGame((s) => s.population);
  const housing = useGame((s) => s.housing);
  const morale = useGame((s) => s.morale);
  const state = useGame();
  const warnings = depletionWarning(state);

  return (
    <section className="panel px-3 py-2 flex flex-col gap-1.5">
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-x-3 gap-y-1.5">
        <Stat
          icon="☻"
          label="Pop"
          value={`${population}/${housing}`}
          hint="Colonists / Housing"
        />
        <Stat
          icon="♥"
          label="Morale"
          value={`${Math.round(morale)}`}
          hint="Colony morale (0-100)"
          tone={morale < 30 ? "bad" : morale < 60 ? "warn" : "good"}
        />
        {ORDER.map((r) => {
          const val = resources[r.key] ?? 0;
          const cap = caps[r.key];
          const tone = r.flow ? (val < 0 ? "bad" : val === 0 ? "warn" : "good") : undefined;
          const capLabel =
            !r.flow && cap !== Infinity ? `/${Math.floor(cap)}` : "";
          const nearCap = !r.flow && cap !== Infinity && val >= cap * 0.95;
          return (
            <Stat
              key={r.key}
              icon={r.icon}
              label={r.label}
              value={`${fmt(val, r.flow)}${capLabel}`}
              tone={nearCap ? "warn" : tone}
              hint={nearCap ? "Near storage cap — surplus will spoil" : undefined}
            />
          );
        })}
      </div>
      {warnings.length > 0 && (
        <div className="flex flex-wrap gap-1 pt-1 text-[11px]">
          {warnings.map((w) => {
            const tone =
              w.solsLeft <= 3
                ? "border-rose-700/50 bg-rose-900/30 text-rose-200"
                : "border-amber-700/40 bg-amber-900/20 text-amber-200";
            return (
              <span
                key={w.key}
                className={`px-2 py-0.5 rounded border ${tone}`}
                title="Estimated based on current production minus consumption"
              >
                ⚠ {w.key} runs out in ~{w.solsLeft} sol{w.solsLeft === 1 ? "" : "s"}
              </span>
            );
          })}
        </div>
      )}
    </section>
  );
}

function Stat({
  icon,
  label,
  value,
  hint,
  tone,
}: {
  icon: string;
  label: string;
  value: string;
  hint?: string;
  tone?: "good" | "warn" | "bad";
}) {
  const toneClass =
    tone === "bad"
      ? "text-rose-300"
      : tone === "warn"
        ? "text-amber-300"
        : tone === "good"
          ? "text-emerald-300"
          : "text-space-50";
  return (
    <div className="flex items-center gap-2" title={hint}>
      <span className="text-mars-200 w-4 text-center">{icon}</span>
      <div className="leading-tight">
        <div className={`text-sm font-mono ${toneClass}`}>{value}</div>
        <div className="text-[10px] uppercase tracking-wider text-space-200">{label}</div>
      </div>
    </div>
  );
}
