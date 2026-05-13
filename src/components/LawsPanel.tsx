"use client";

import { useState } from "react";
import { aggregateLawEffects, isLawOptionAvailable, useGame } from "@/game/store";
import { LAWS, LAW_CATEGORY_ORDER, LAW_COOLDOWN_SOLS } from "@/game/laws";
import { applyTraitLawMods } from "@/game/governor";
import { FACTIONS } from "@/game/factions";
import type { FactionId, LawCategoryId, LawOptionDef } from "@/game/types";

function effectsLine(opt: LawOptionDef): string[] {
  const e = opt.effects;
  const lines: string[] = [];
  if (e.creditsPerPop) lines.push(`+${e.creditsPerPop.toFixed(2)} ₡/pop/sol`);
  if (e.conscriptionRate) lines.push(`${(e.conscriptionRate * 100).toFixed(1)}% workers → soldiers/sol`);
  if (e.moraleDelta) lines.push(`${e.moraleDelta > 0 ? "+" : ""}${e.moraleDelta} morale/sol`);
  if (e.populationGrowthMult && e.populationGrowthMult !== 1)
    lines.push(`pop growth ×${e.populationGrowthMult}`);
  if (e.researchMult && e.researchMult !== 1) lines.push(`research ×${e.researchMult}`);
  if (e.productionMult && e.productionMult !== 1) lines.push(`production ×${e.productionMult}`);
  if (e.maintenanceMult && e.maintenanceMult !== 1)
    lines.push(`maintenance ×${e.maintenanceMult}`);
  if (e.loyaltyDrift) lines.push(`${e.loyaltyDrift > 0 ? "+" : ""}${e.loyaltyDrift} loyalty/sol`);
  if (e.earthSupplyMult && e.earthSupplyMult !== 1) lines.push(`Earth supply ×${e.earthSupplyMult}`);
  return lines;
}

export default function LawsPanel() {
  const laws = useGame((s) => s.laws);
  const sol = useGame((s) => s.sol);
  const traits = useGame((s) => s.governor.traits);
  const state = useGame();
  const changeLaw = useGame((s) => s.changeLaw);
  const [expanded, setExpanded] = useState<LawCategoryId | null>(null);
  const effects = aggregateLawEffects(state);

  return (
    <section className="panel p-3 flex flex-col gap-2">
      <h2 className="text-sm uppercase tracking-widest text-mars-200">Laws</h2>
      <div className="text-[11px] text-space-200 -mt-1">
        Pick policies. Each category has a {LAW_COOLDOWN_SOLS}-sol cooldown after a change.
        Your Governor&apos;s traits shape how factions react.
      </div>
      <div className="text-[10px] uppercase tracking-widest text-space-200 pt-1">
        Current per-sol law totals
      </div>
      <div className="grid grid-cols-3 gap-1 text-[11px] font-mono">
        <FactionDeltaPill id="loyalists" value={effects.factionDelta.loyalists} />
        <FactionDeltaPill id="labour" value={effects.factionDelta.labour} />
        <FactionDeltaPill id="engineers" value={effects.factionDelta.engineers} />
      </div>
      <div className="flex flex-col gap-1.5 scrollarea overflow-y-auto max-h-[44vh] pr-1">
        {LAW_CATEGORY_ORDER.map((catId) => {
          const cat = LAWS[catId];
          const currentId = laws.options[catId];
          const current = cat.options.find((o) => o.id === currentId);
          const cooldown = (laws.cooldownUntilSol[catId] ?? 0) - sol;
          const isOpen = expanded === catId;
          return (
            <div key={catId} className="rounded-lg border border-space-400/40 bg-space-700/40">
              <button
                className="w-full text-left p-2"
                onClick={() => setExpanded(isOpen ? null : catId)}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm text-mars-100">{cat.name}</span>
                  <span className="text-[11px] font-mono text-space-200">
                    {current?.name ?? "—"}
                    {cooldown > 0 ? ` · ${cooldown}s` : ""}
                  </span>
                </div>
                <div className="text-[11px] text-space-200 leading-snug">{cat.description}</div>
              </button>
              {isOpen && (
                <div className="px-2 pb-2 flex flex-col gap-1.5">
                  {cat.options.map((opt) => {
                    const isCurrent = opt.id === currentId;
                    const check = isLawOptionAvailable(state, catId, opt.id);
                    const onCooldown = cooldown > 0 && !isCurrent;
                    const disabled = !check.ok || onCooldown || isCurrent;
                    const reaction = applyTraitLawMods(traits, opt.id, opt.factionReaction);
                    return (
                      <button
                        key={opt.id}
                        disabled={disabled}
                        onClick={() => changeLaw(catId, opt.id)}
                        className={`text-left p-2 rounded-md border transition ${
                          isCurrent
                            ? "border-mars-300 bg-mars-700/30"
                            : "border-space-400/30 bg-space-700/30 hover:bg-space-600/50"
                        } ${!check.ok ? "opacity-60" : ""} ${onCooldown ? "opacity-60" : ""}`}
                        title={
                          !check.ok
                            ? check.reason
                            : onCooldown
                              ? `Cooldown: ${cooldown} sols`
                              : opt.description
                        }
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm">{opt.name}</span>
                          {isCurrent && (
                            <span className="text-[10px] uppercase tracking-widest text-mars-100">
                              active
                            </span>
                          )}
                          {!check.ok && (
                            <span className="text-[10px] uppercase tracking-widest text-amber-300">
                              locked
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-space-200 leading-snug">{opt.description}</div>
                        <div className="mt-1 flex flex-wrap gap-x-2 gap-y-0.5 text-[11px] font-mono">
                          {effectsLine(opt).map((line) => (
                            <span key={line} className="text-emerald-200/90">
                              {line}
                            </span>
                          ))}
                          {Object.entries(reaction).map(([f, d]) => {
                            if (!d) return null;
                            const isPos = d > 0;
                            return (
                              <span
                                key={f}
                                className={isPos ? "text-emerald-300" : "text-rose-300"}
                                title={`${FACTIONS[f as FactionId].shortName} happiness ${isPos ? "+" : ""}${d.toFixed(2)}/sol`}
                              >
                                {FACTIONS[f as FactionId].shortName} {isPos ? "+" : ""}
                                {d.toFixed(2)}
                              </span>
                            );
                          })}
                        </div>
                        {!check.ok && check.reason && (
                          <div className="text-[11px] text-amber-300 mt-1">{check.reason}</div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

function FactionDeltaPill({ id, value }: { id: FactionId; value: number }) {
  const tone =
    value > 0 ? "text-emerald-300" : value < 0 ? "text-rose-300" : "text-space-200";
  const def = FACTIONS[id];
  return (
    <div className="flex items-center gap-1" title={`${def.name} happiness ${value.toFixed(2)}/sol from laws`}>
      <span style={{ color: def.color }}>●</span>
      <span className={tone}>
        {value > 0 ? "+" : ""}
        {value.toFixed(2)}
      </span>
    </div>
  );
}
