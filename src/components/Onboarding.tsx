"use client";

import { useEffect, useRef, useState } from "react";
import { useGame } from "@/game/store";

type Phase = "title" | "naming" | "animation";

const ANIMATION_MS = 7000;

const NARRATION = [
  { at: 0, text: "AD 2099. The Aresward boosts out of Earth orbit." },
  { at: 0.32, text: "Six months in transit. The crew sleeps in shifts." },
  { at: 0.66, text: "Mars approaches. Aerobrake. Burn. Touchdown." },
  { at: 0.9, text: "The first colonists step onto the regolith." },
];

export default function Onboarding() {
  const finish = useGame((s) => s.finishOnboarding);
  const governor = useGame((s) => s.governor);
  const [phase, setPhase] = useState<Phase>("title");
  const [name, setName] = useState("Aresward");
  const [animProgress, setAnimProgress] = useState(0);
  const rafRef = useRef(0);
  const startRef = useRef(0);

  useEffect(() => {
    if (phase !== "animation") return;
    startRef.current = performance.now();
    const loop = (now: number) => {
      const t = Math.min(1, (now - startRef.current) / ANIMATION_MS);
      setAnimProgress(t);
      if (t < 1) rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [phase]);

  const currentNarration = (() => {
    let line = NARRATION[0].text;
    for (const n of NARRATION) if (animProgress >= n.at) line = n.text;
    return line;
  })();

  const landReady = animProgress >= 0.9;
  const finalName = name.trim() || "Aresward";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-space-900/95">
      <div className="starfield" aria-hidden />
      <div className="relative z-10 w-full max-w-2xl panel p-6 flex flex-col gap-4">
        {phase === "title" && (
          <>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-mars-300 via-mars-500 to-mars-800 shadow-inner shadow-black/40" />
              <div>
                <div className="font-display tracking-[0.3em] text-xl text-mars-100">
                  STARBORN
                </div>
                <div className="text-[11px] uppercase tracking-[0.25em] text-space-200">
                  A colony across the stars
                </div>
              </div>
            </div>
            <p className="text-sm text-space-50 leading-relaxed">
              Earth has spent a century preparing for this morning. A consortium
              of nations and corporations pools its hopes into one ship and
              twelve colonists, bound for Mars. The settlement they build will
              decide whether humanity is a one-world species or many.
            </p>
            <p className="text-sm text-space-50 leading-relaxed">
              You are{" "}
              <span className="text-mars-100">
                Director {governor.name}
              </span>
              . Your remit: keep them alive. After that, anything.
            </p>
            <div className="flex justify-end pt-2">
              <button className="btn btn-primary" onClick={() => setPhase("naming")}>
                Begin
              </button>
            </div>
          </>
        )}

        {phase === "naming" && (
          <>
            <div className="text-[11px] uppercase tracking-[0.25em] text-space-200">
              Step 1 of 2
            </div>
            <h2 className="text-lg text-mars-100">Name your first Martian city</h2>
            <p className="text-sm text-space-200 leading-relaxed">
              The colonists will found a single settlement at the Aresward landing
              site. Later you may expand to other cities on Mars and beyond.
            </p>
            <input
              autoFocus
              type="text"
              value={name}
              maxLength={28}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && name.trim().length > 0) setPhase("animation");
              }}
              placeholder="Aresward"
              className="bg-space-700/70 border border-space-400/40 rounded-md px-3 py-2 text-mars-100 focus:outline-none focus:border-mars-300"
            />
            <div className="flex items-center justify-between pt-2">
              <button className="btn" onClick={() => setPhase("title")}>
                Back
              </button>
              <button
                className="btn btn-primary"
                disabled={name.trim().length === 0}
                onClick={() => setPhase("animation")}
              >
                Continue
              </button>
            </div>
          </>
        )}

        {phase === "animation" && (
          <>
            <div className="text-[11px] uppercase tracking-[0.25em] text-space-200">
              Step 2 of 2 · The crossing
            </div>
            <div className="relative h-[200px] w-full overflow-hidden rounded-md border border-space-400/30 bg-space-900/60">
              <svg viewBox="0 0 600 200" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
                <defs>
                  <radialGradient id="onbEarth" cx="40%" cy="40%" r="60%">
                    <stop offset="0%" stopColor="#9bd0ff" />
                    <stop offset="60%" stopColor="#2d6fbf" />
                    <stop offset="100%" stopColor="#0a2244" />
                  </radialGradient>
                  <radialGradient id="onbMars" cx="35%" cy="35%" r="75%">
                    <stop offset="0%" stopColor="#ff9056" />
                    <stop offset="60%" stopColor="#a3370f" />
                    <stop offset="100%" stopColor="#2e1006" />
                  </radialGradient>
                </defs>
                {Array.from({ length: 60 }).map((_, i) => {
                  const x = (i * 97) % 600;
                  const y = (i * 53) % 200;
                  const r = (i % 3) * 0.4 + 0.4;
                  const o = 0.3 + ((i * 7) % 10) / 20;
                  return <circle key={i} cx={x} cy={y} r={r} fill="#fff" opacity={o} />;
                })}
                <g>
                  <circle cx="60" cy="100" r="40" fill="url(#onbEarth)" />
                  <circle cx="60" cy="100" r="46" fill="#9bd0ff" opacity="0.08" />
                </g>
                <g>
                  <circle cx="540" cy="100" r="34" fill="url(#onbMars)" />
                  <circle cx="540" cy="100" r="40" fill="#ff9056" opacity="0.1" />
                </g>
                <g
                  transform={`translate(${100 + animProgress * 380}, ${
                    100 + Math.sin(animProgress * Math.PI) * -18
                  })`}
                >
                  <line
                    x1="-22"
                    y1="0"
                    x2="-6"
                    y2="0"
                    stroke="#ffe9c5"
                    strokeOpacity={0.55}
                    strokeWidth="1.5"
                  />
                  <line
                    x1="-30"
                    y1="0"
                    x2="-14"
                    y2="0"
                    stroke="#ff9056"
                    strokeOpacity={0.4}
                    strokeWidth="1"
                  />
                  <polygon
                    points="-6,-3 6,0 -6,3"
                    fill="#fff1d6"
                    stroke="#ffd9bd"
                    strokeWidth="0.5"
                  />
                </g>
              </svg>
              <div className="absolute bottom-2 left-3 right-3 text-[12px] text-space-50">
                {currentNarration}
              </div>
              <div className="absolute top-2 right-3 text-[10px] font-mono text-space-200">
                {Math.floor(animProgress * 100)}%
              </div>
            </div>
            <div className="flex items-center justify-between pt-2">
              <button className="btn" onClick={() => setPhase("naming")}>
                Back
              </button>
              <button
                className="btn btn-primary"
                disabled={!landReady}
                onClick={() => finish(finalName)}
              >
                {landReady ? `Land at ${finalName}` : "Crossing…"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
