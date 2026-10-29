import type { City } from "@/app/api/geocoding/type";

const STORAGE_KEY = "savedCityDetails";

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

export function isCity(value: unknown): value is City {
  if (!value || typeof value !== "object") return false;

  const city = value as Record<string, unknown>;

  return (
    typeof city.name === "string" &&
    city.name.trim().length > 0 &&
    typeof city.country === "string" &&
    city.country.trim().length > 0 &&
    isFiniteNumber(city.lat) &&
    isFiniteNumber(city.lon) &&
    (city.state === undefined || typeof city.state === "string")
  );
}

export function readSavedCity(): City | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed: unknown = JSON.parse(raw);
    return isCity(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function saveCity(city: City): void {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(city));
  } catch {
    // Storage can be unavailable (private mode, quota). The app still works.
  }
}
