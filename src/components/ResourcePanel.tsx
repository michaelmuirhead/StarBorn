"use client";

import { depletionWarning, resourceFlows, totalPopulation, useGame } from "@/game/store";
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

function fmtDelta(n: number) {
  const rounded = Math.round(n * 10) / 10;
  if (rounded === 0) return "±0";
  return rounded > 0 ? `+${rounded}` : `${rounded}`;
}

export default function ResourcePanel() {
  const resources = useGame((s) => s.resources);
  const caps = useGame((s) => s.storageCaps);
  const strata = useGame((s) => s.strata);
  const housing = useGame((s) => s.housing);
  const morale = useGame((s) => s.morale);
  const loyalty = useGame((s) => s.loyalty);
  const state = useGame();
  const warnings = depletionWarning(state);
  const flows = resourceFlows(state);
  const pop = totalPopulation(strata);

  return (
    <section className="panel px-3 py-1.5 flex flex-col gap-1 shrink-0">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
        <Pill
          icon="☻"
          label="Pop"
          value={`${pop}/${housing}`}
          hint={`Workers ${Math.floor(strata.workers)} · Specialists ${Math.floor(strata.specialists)} · Soldiers ${Math.floor(strata.soldiers)}`}
        />
        <Pill
          icon="♥"
          label="Morale"
          value={`${Math.round(morale)}`}
          tone={morale < 30 ? "bad" : morale < 60 ? "warn" : "good"}
        />
        <Pill
          icon="⚐"
          label="Loyalty"
          value={`${Math.round(loyalty)}`}
          tone={loyalty < 30 ? "bad" : loyalty < 60 ? "warn" : "good"}
          hint="Loyalty to Earth (0-100)"
        />
        <span className="text-space-400">·</span>
        {ORDER.map((r) => {
          const val = resources[r.key] ?? 0;
          const cap = caps[r.key];
          const tone = r.flow ? (val < 0 ? "bad" : val === 0 ? "warn" : "good") : undefined;
          const capLabel = !r.flow && cap !== Infinity ? `/${Math.floor(cap)}` : "";
          const nearCap = !r.flow && cap !== Infinity && val >= cap * 0.95;
          const flow = flows[r.key];
          return (
            <Pill
              key={r.key}
              icon={r.icon}
              label={r.label}
              value={`${fmt(val, r.flow)}${capLabel}`}
              tone={nearCap ? "warn" : tone}
              hint={nearCap ? "Near storage cap — surplus will spoil" : undefined}
              flow={r.flow ? undefined : flow}
            />
          );
        })}
      </div>
      {warnings.length > 0 && (
        <div className="flex flex-wrap gap-1 text-[11px]">
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

function Pill({
  icon,
  label,
  value,
  hint,
  tone,
  flow,
}: {
  icon: string;
  label: string;
  value: string;
  hint?: string;
  tone?: "good" | "warn" | "bad";
  flow?: number;
}) {
  const toneClass =
    tone === "bad"
      ? "text-rose-300"
      : tone === "warn"
        ? "text-amber-300"
        : tone === "good"
          ? "text-emerald-300"
          : "text-space-50";
  const flowTone =
    flow === undefined
      ? ""
      : flow > 0.05
        ? "text-emerald-300/80"
        : flow < -0.05
          ? "text-rose-300/80"
          : "text-space-200";
  return (
    <div
      className="flex items-center gap-1.5 text-[12px] whitespace-nowrap"
      title={hint ?? label}
    >
      <span className="text-mars-200 w-3 text-center">{icon}</span>
      <span className="text-[10px] uppercase tracking-wider text-space-200">{label}</span>
      <span className={`font-mono ${toneClass}`}>{value}</span>
      {flow !== undefined && (
        <span className={`font-mono text-[10px] ${flowTone}`}>{fmtDelta(flow)}</span>
      )}
    </div>
  );
}
