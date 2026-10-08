import { articleCards, authorCards, categoryCards, collections, heroes, homepages, images } from "./catalogue-data.ts";

export type HomeSlot = "INTRO" | "LEAD" | "POSTS" | "CATEGORIES" | "LATEST";
// Section rows remain content authority; these recipes only order shared visual slots.
export const HOME_SLOTS: Readonly<Record<keyof typeof homepages, readonly HomeSlot[]>> = {
  "HOME-01": ["INTRO", "LEAD", "POSTS", "CATEGORIES", "LATEST"],
  "HOME-02": ["INTRO", "LEAD", "CATEGORIES", "POSTS", "LATEST"],
  "HOME-03": ["INTRO", "LEAD", "POSTS", "CATEGORIES", "LATEST"],
  "HOME-04": ["INTRO", "LEAD", "LATEST", "POSTS", "CATEGORIES"],
  "HOME-05": ["INTRO", "LEAD", "LATEST", "POSTS", "CATEGORIES"],
  "HOME-06": ["INTRO", "LEAD", "CATEGORIES", "POSTS", "LATEST"],
  "HOME-07": ["LEAD", "INTRO", "POSTS", "CATEGORIES", "LATEST"],
  "HOME-08": ["INTRO", "CATEGORIES", "LEAD", "POSTS", "LATEST"],
  "HOME-09": ["INTRO", "LATEST", "POSTS", "CATEGORIES", "LEAD"],
  "HOME-10": ["LEAD", "INTRO", "POSTS", "CATEGORIES", "LATEST"],
  "HOME-11": ["LEAD", "POSTS", "CATEGORIES", "LATEST", "INTRO"],
  "HOME-12": ["INTRO", "LEAD", "POSTS", "CATEGORIES", "LATEST"],
  "HOME-13": ["INTRO", "LEAD", "POSTS", "CATEGORIES", "LATEST"],
  "HOME-14": ["INTRO", "LEAD", "POSTS", "CATEGORIES", "LATEST"],
  "HOME-15": ["INTRO", "LEAD", "LATEST", "POSTS", "CATEGORIES"],
  "HOME-16": ["INTRO", "CATEGORIES", "POSTS", "LEAD", "LATEST"],
  "HOME-17": ["INTRO", "LEAD", "POSTS", "CATEGORIES", "LATEST"],
  "HOME-18": ["LEAD", "CATEGORIES", "INTRO", "LATEST", "POSTS"],
  "HOME-19": ["INTRO", "LEAD", "POSTS", "CATEGORIES", "LATEST"],
  "HOME-20": ["INTRO", "LEAD", "POSTS", "LATEST", "CATEGORIES"],
  "HOME-21": ["LEAD", "INTRO", "POSTS", "LATEST", "CATEGORIES"],
  "HOME-22": ["LEAD", "INTRO", "POSTS", "CATEGORIES", "LATEST"],
  "HOME-23": ["INTRO", "LEAD", "POSTS", "CATEGORIES", "LATEST"],
  "HOME-24": ["INTRO", "LATEST", "POSTS", "CATEGORIES", "LEAD"],
  "HOME-25": ["LEAD", "POSTS", "CATEGORIES", "LATEST", "INTRO"],
};

export function articleCardLayout(id: keyof typeof articleCards): "vertical" | "horizontal" | "reverse" | "overlay" | "text" {
  if (["CARD-06", "CARD-07", "CARD-08", "CARD-11", "CARD-29", "CARD-30"].includes(id)) return "horizontal";
  if (["CARD-09", "CARD-10", "CARD-12"].includes(id)) return "reverse";
  if (["CARD-13", "CARD-14"].includes(id)) return "overlay";
  if (["CARD-15", "CARD-16", "CARD-17", "CARD-20", "CARD-22", "CARD-27"].includes(id)) return "text";
  return "vertical";
}
export function cardNeedsMedia(id: keyof typeof articleCards): boolean { return id === "CARD-13" || id === "CARD-14"; }
export function heroLayout(id: keyof typeof heroes): "split" | "reverse" | "stacked" | "overlay" | "text" | "feature" {
  if (["HERO-04", "HERO-16"].includes(id)) return "reverse";
  if (["HERO-05", "HERO-06"].includes(id)) return "overlay";
  if (["HERO-07", "HERO-08", "HERO-13", "HERO-26"].includes(id)) return "stacked";
  if (["HERO-09", "HERO-14", "HERO-25"].includes(id)) return "text";
  if (["HERO-10", "HERO-11", "HERO-12", "HERO-20", "HERO-21", "HERO-24"].includes(id)) return "feature";
  return "split";
}
export function leadVariant(id: keyof typeof heroes): "SPLIT_MEDIA" | "TEXT_FIRST" | "FEATURED_PANEL" | "COMPACT" {
  if (["HERO-09", "HERO-14", "HERO-25"].includes(id)) return "TEXT_FIRST";
  if (["HERO-10", "HERO-11", "HERO-12", "HERO-20", "HERO-24"].includes(id)) return "FEATURED_PANEL";
  if (["HERO-18", "HERO-21"].includes(id)) return "COMPACT";
  return "SPLIT_MEDIA";
}
export function collectionLayout(id: keyof typeof collections): "grid" | "list" | "magazine" | "compact" {
  if (["COL-04", "COL-05", "COL-06", "COL-10"].includes(id)) return "list";
  if (["COL-07", "COL-09", "COL-12"].includes(id)) return "magazine";
  if (["COL-03", "COL-08"].includes(id)) return "compact";
  return "grid";
}
export function categoryLayout(id: keyof typeof categoryCards): "tile" | "list" | "pill" | "banner" {
  if (["CAT-04", "CAT-14", "CAT-16", "CAT-17", "CAT-25"].includes(id)) return "list";
  if (id === "CAT-15") return "pill";
  if (["CAT-19", "CAT-20"].includes(id)) return "banner";
  return "tile";
}
export function authorLayout(id: keyof typeof authorCards): "row" | "stack" | "text" {
  if (["AUTH-02", "AUTH-08", "AUTH-17"].includes(id)) return "stack";
  if (["AUTH-05", "AUTH-10", "AUTH-18", "AUTH-24"].includes(id)) return "text";
  return "row";
}
export function imageTreatment(id: keyof typeof images): { ratio: string; fit: "contain" | "cover"; edge: boolean } {
  const ratio = ({ "IMG-02": "4 / 3", "IMG-03": "16 / 9", "IMG-04": "2 / 1", "IMG-05": "1", "IMG-06": "4 / 5", "IMG-07": "3 / 4" } as Record<string, string>)[id] ?? "auto";
  return { ratio, fit: id === "IMG-01" || id === "IMG-08" || id === "IMG-11" ? "contain" : "cover", edge: id === "IMG-12" };
}
