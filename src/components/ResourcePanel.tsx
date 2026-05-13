"use client";

import { useGame } from "@/game/store";
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
  const population = useGame((s) => s.population);
  const housing = useGame((s) => s.housing);
  const morale = useGame((s) => s.morale);

  return (
    <section className="panel px-3 py-2">
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-x-3 gap-y-1.5">
        <Stat icon="☻" label="Pop" value={`${population}/${housing}`} hint="Colonists / Housing" />
        <Stat
          icon="♥"
          label="Morale"
          value={`${Math.round(morale)}`}
          hint="Colony morale (0-100)"
          tone={morale < 30 ? "bad" : morale < 60 ? "warn" : "good"}
        />
        {ORDER.map((r) => {
          const val = resources[r.key] ?? 0;
          const tone = r.flow ? (val < 0 ? "bad" : val === 0 ? "warn" : "good") : undefined;
          return (
            <Stat
              key={r.key}
              icon={r.icon}
              label={r.label}
              value={fmt(val, r.flow)}
              tone={tone}
            />
          );
        })}
      </div>
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
      ? "text-red-300"
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
