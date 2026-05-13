# StarBorn

A browser-based grand-strategy game. You lead a group of colonists from Earth to
Mars, build a colony, research new tech, weather dust storms and outbreaks, and
(eventually) expand to other celestial bodies and fight galactic wars.

This repo is the MVP: a single-player **Mars colony tycoon** vertical slice that
forms the foundation for everything else on the roadmap.

## Stack

- [Next.js 14](https://nextjs.org/) (App Router) + React 18 + TypeScript
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Zustand](https://github.com/pmndrs/zustand) for game state
- SVG hex map (lightweight, no canvas/WebGL dependency yet)
- localStorage persistence (auto-saves every action and every sol)

## Run locally

```bash
npm install
npm run dev
```

Open <http://localhost:3000>.

## Deploy

This project is ready for **Vercel**:

1. Push this repo to GitHub.
2. In Vercel, "Add New Project" → import the repo.
3. Framework preset is auto-detected as Next.js. No env vars required.
4. Deploy. Subsequent pushes to `main` redeploy automatically.

The `vercel.json` at the repo root pins the framework so detection is reliable.

## How to play

You start on Sol 1 with 12 colonists and a small resource buffer. Build solar,
water, food, oxygen — quickly. Colonists eat, drink, breathe, and need housing.
Research unlocks better buildings and a Spaceport that will (in future updates)
let you launch off Mars.

- **Pause / 1x / 2x / 4x** controls game speed.
- Click a tile to inspect it. Pick a building from the left panel, then click an
  empty tile to place it.
- Demolish from the tile inspector. You get back 50% of the build cost.
- Save/Load is automatic via your browser's localStorage. "New game" wipes it.

## Project structure

```
src/
  app/                Next.js App Router pages + global styles
  components/         UI: top bar, resource strip, map, panels, log
  game/
    constants.ts      Tunable numbers
    types.ts          Shared types
    buildings.ts      Building catalog
    research.ts       Research catalog
    events.ts         Random event catalog
    map.ts            Hex grid + terrain
    store.ts          Zustand store + tick / save / load
```

## Roadmap

See [ROADMAP.md](./ROADMAP.md) for the long-term plan (off-world expansion,
armies, navies, civil wars, galactic wars, multiplayer, visual upgrades).
