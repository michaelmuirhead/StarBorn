import {
  FIRST_OFFER_SOL,
  OFFER_COOLDOWN_MAX,
  OFFER_COOLDOWN_MIN,
  OFFER_DURATION_SOLS,
} from "./constants";
import type { Resources, TradeOffer } from "./types";

type OfferTemplate = {
  flavor: (n: number) => string;
  cost: (n: number) => Partial<Resources>;
  reward: (n: number) => Partial<Resources>;
  // n: a small magnitude used to scale offer size.
  scale: number;
};

const TEMPLATES: OfferTemplate[] = [
  {
    flavor: (n) => `Belt freighter offers ${n} credits for ${Math.floor(n / 2)} minerals.`,
    cost: (n) => ({ minerals: Math.floor(n / 2) }),
    reward: (n) => ({ credits: n }),
    scale: 200,
  },
  {
    flavor: (n) =>
      `Earth purchaser wants ${Math.floor(n / 20)} alloys and will pay ${n} credits.`,
    cost: (n) => ({ alloys: Math.floor(n / 20) }),
    reward: (n) => ({ credits: n }),
    scale: 300,
  },
  {
    flavor: (n) =>
      `Relief caravan sells ${Math.floor(n * 1.2)} food and ${Math.floor(n)} water for ${Math.floor(n * 2)} credits.`,
    cost: (n) => ({ credits: Math.floor(n * 2) }),
    reward: (n) => ({ food: Math.floor(n * 1.2), water: Math.floor(n) }),
    scale: 120,
  },
  {
    flavor: (n) =>
      `Mining cartel sells ${Math.floor(n * 1.5)} minerals for ${Math.floor(n * 1.6)} credits.`,
    cost: (n) => ({ credits: Math.floor(n * 1.6) }),
    reward: (n) => ({ minerals: Math.floor(n * 1.5) }),
    scale: 150,
  },
  {
    flavor: (n) =>
      `Black-market broker offers ${Math.floor(n / 10)} alloys for ${Math.floor(n * 1.2)} credits.`,
    cost: (n) => ({ credits: Math.floor(n * 1.2) }),
    reward: (n) => ({ alloys: Math.floor(n / 10) }),
    scale: 250,
  },
];

export function rollOffer(sol: number): TradeOffer {
  const tpl = TEMPLATES[Math.floor(Math.random() * TEMPLATES.length)];
  const jitter = 0.8 + Math.random() * 0.6;
  const n = Math.max(20, Math.floor(tpl.scale * jitter));
  return {
    id: `offer-${sol}-${Math.floor(Math.random() * 9999)}`,
    flavor: tpl.flavor(n),
    cost: tpl.cost(n),
    reward: tpl.reward(n),
    offeredSol: sol,
    expiresSol: sol + OFFER_DURATION_SOLS,
  };
}

export function nextOfferAfter(sol: number): number {
  if (sol < FIRST_OFFER_SOL) return FIRST_OFFER_SOL;
  const delta =
    OFFER_COOLDOWN_MIN + Math.floor(Math.random() * (OFFER_COOLDOWN_MAX - OFFER_COOLDOWN_MIN + 1));
  return sol + delta;
}
