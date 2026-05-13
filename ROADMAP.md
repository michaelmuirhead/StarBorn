# StarBorn — Roadmap

This is the long-term vision. Items are roughly ordered by what unlocks the most
new gameplay per unit of effort. Numbers in brackets are rough effort tiers
(S = days, M = a week or two, L = a month+, XL = multiple months).

## Phase 1 — Mars MVP (shipped)

- [x] Hex map of Mars with terrain bonuses (ice, ore, ridge)
- [x] Buildings: habitat, solar, water, greenhouse, oxygen, mine, lab, foundry,
      spaceport, storage tank, atmospheric processor
- [x] Tick-based sim (sol), pause / 1x / 2x / 4x
- [x] Population, housing, morale, food/water/oxygen consumption
- [x] Research tree (9 nodes), random events (dust storm, outbreak, etc.)
- [x] localStorage save / load, "new game"
- [x] Vercel-ready deploy
- [x] Storage caps + Storage Tank silos
- [x] Construction time (buildings come online over several sols)
- [x] Adjacency bonuses (solar/lab clusters, greenhouse + water extractor pair,
      habitat clustering for morale)
- [x] Building upgrades (Lvl 1 → 2 → 3 using alloys & minerals)
- [x] Building maintenance (lab/foundry/spaceport/processor light upkeep)
- [x] Predictive depletion warnings ("food runs out in N sols")
- [x] Live tile inspector with per-building output, modifiers, neighbours
- [x] NPC trade ship offers (accept / decline / expire)
- [x] Seasonal Martian storm cycles (clustered dust storms)
- [x] Terraforming endgame: Atmospheric Processor + atmosphere stat +
      victory condition

## Phase 2 — Government, factions, and named leadership [M]

Phase 2 prepares the long arc to a 300-million-citizen planetary power.
**Population is modelled as aggregate strata, not individuals.** Only
leadership roles (governor, ministers, generals, admirals) carry names.
Personality and stakes come from factions, laws, and branching events,
which all scale identically from 12 colonists to billions.

- [ ] **Population strata** — replace the single colonist count with
      Workers / Specialists / Soldiers / Leaders. Buildings demand a
      specific stratum to staff. Strata grow at different rates.
- [ ] **Auto-scaling population units** — UI promotes the label from
      "colonists" → "thousands" → "millions" as totals cross thresholds.
      Underlying math is one continuous number.
- [ ] **Named Governor** — a Head of State with 1–2 traits (Engineer,
      Charismatic, Hawk, Pragmatic, Visionary, Frugal, Ambitious,
      Cautious…). Replaceable via events (death, retirement, recall).
- [ ] **Government type** — Corporate Colony → Provisional Council →
      Martian Republic → … . Each unlocks different policies and
      victory conditions.
- [ ] **Factions** — Earth Loyalists, Labour Coalition, Engineering
      Guild, plus more as the colony grows. Each has influence %,
      happiness, and standing demands.
- [ ] **Laws / policies** — taxation rate, conscription, civil
      liberties, immigration. Each swings faction influence and
      resource flows. This is where the temporary mine-credit trickle
      gets replaced.
- [ ] **Loyalty to Earth** — top-level stat, drifts with policy.
      Thresholds trigger Earth sanctions, then the option to declare
      independence, then a (Phase 3+) war.
- [ ] **Branching events** — events present 2–4 choices that swing
      faction influence, loyalty, resources, or fire follow-up chains.
- [ ] **New win/loss conditions** — Independence Declared (Phase 3+
      hook), Earth Annexation (loyalty bottoms out), Civil War (faction
      stalemate + low morale). Existing terraforming + colony collapse
      remain.
- [ ] **Tutorial overlay** for the first few sols.
- [ ] **Subtle ambient audio**.

## Phase 3 — Off-world expansion [L]

- [ ] System map: Mars, Earth, Luna, Asteroid Belt, Jovian moons
- [ ] Spaceport launches colony ships to other bodies
- [ ] Each colony has its own local hex map + economy
- [ ] Trade routes between colonies (caravans / freighters)
- [ ] Earth as an NPC: tariffs, demands, supply drops, sanctions

## Phase 4 — Military and conflict [L]

- [ ] Armies (ground forces) and Navies (space fleets)
- [ ] Recruitment, upkeep, doctrine
- [ ] Earth-Mars War scenario: independence struggle
- [ ] Civil wars triggered by morale / faction systems
- [ ] Diplomacy: treaties, alliances, embargoes

## Phase 5 — Galactic scope [XL]

- [ ] Interstellar travel (research + special structures)
- [ ] Procedural star systems
- [ ] Breakaway factions form rival civilisations
- [ ] Long-arc galactic wars

## Phase 6 — Multiplayer [XL]

- [ ] Accounts + cloud saves (Vercel Postgres / KV + NextAuth)
- [ ] Async / turn-based shared galaxy
- [ ] Realtime co-op skirmishes

## Visual upgrades (parallel tracks)

These can happen alongside any phase once the gameplay justifies the art cost.

- [ ] **2D pixel art track** — replace SVG icons with sprite sheets; animated
      colonists walking between buildings; tile-based rendering via Canvas or
      Pixi.js. Keep the hex grid; swap the renderer.
- [ ] **3D / WebGL track** — Three.js or @react-three/fiber for a globe view of
      Mars and a system map. Buildings as low-poly props on the planet surface.
      Probably worth doing only after Phase 3 (off-world expansion) — the same
      renderer covers planets and the system map.

## Tech debt to tackle as the game grows

- [ ] Move state out of one Zustand store into slices (colony / research /
      diplomacy / military) once the store grows past ~600 lines.
- [ ] Replace `setTimeout`-debounced localStorage save with IndexedDB once save
      files outgrow ~1 MB.
- [ ] Add a deterministic seeded RNG for the event roller so saves replay
      identically (useful for bug reports).
- [ ] Add a tiny test suite around `runTick` once the math gets non-trivial.
- [ ] Telemetry (opt-in) to balance the economy: which buildings get placed,
      which research gets picked, where colonies die.
