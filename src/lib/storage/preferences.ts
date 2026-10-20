import type { Preferences } from "@/src/app/(pages)/recommendations/recommend-plants";

const STORAGE_KEY = "garden-preferences";

// The zone comes from the saved location, so only the answers to the questions are stored here
type GardenPreferences = Pick<Preferences, "grow" | "space" | "sun">;

function savePreferences(prefs: GardenPreferences) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
}

function getPreferences(): Partial<GardenPreferences> | null {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw === null) return null;

  try {
    return JSON.parse(raw) as Partial<GardenPreferences>;
  } catch (err) {
    console.error(err);
    return null;
  }
}

export { getPreferences, savePreferences };
export type { GardenPreferences };
