import type { City } from "@/app/api/geocoding/type";

export function capitalize(value: string): string {
  if (!value) return "";
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function formatTemperature(
  value: number | null | undefined,
  unit = "°"
): string {
  return typeof value === "number" && Number.isFinite(value)
    ? `${Math.round(value)}${unit}`
    : "—";
}

export function formatHour(dt: number, timezone: number): string {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    timeZone: "UTC",
  }).format(new Date((dt + timezone) * 1000));
}

export function formatDayLabel(
  dt: number,
  currentDt: number,
  timezone: number
): string {
  const difference = localDayNumber(dt, timezone) - localDayNumber(currentDt, timezone);

  if (difference === 0) return "Today";
  if (difference === 1) return "Tomorrow";

  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    timeZone: "UTC",
  }).format(new Date((dt + timezone) * 1000));
}

export function formatUpdatedAt(dt: number, timezone: number): string {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "UTC",
  }).format(new Date((dt + timezone) * 1000));
}

export function formatVisibility(meters: number): string {
  if (!Number.isFinite(meters) || meters <= 0) return "—";

  const kilometers = meters / 1000;
  return `${kilometers >= 10 ? Math.round(kilometers) : kilometers.toFixed(1)} km`;
}

export function formatWindSpeed(kilometersPerHour: number): string {
  return Number.isFinite(kilometersPerHour)
    ? `${Math.round(kilometersPerHour)} km/h`
    : "—";
}

export function formatPressure(hectopascals: number): string {
  return Number.isFinite(hectopascals)
    ? `${Math.round(hectopascals)} hPa`
    : "—";
}

export function formatPercent(value: number): string {
  return Number.isFinite(value) ? `${Math.round(value * 100)}%` : "—";
}

export function formatCity(city: City): string {
  return `${city.name}${city.state ? `, ${city.state}` : ""}, ${city.country}`;
}

export function formatCityRegion(city: City): string {
  return city.state ? `${city.state}, ${city.country}` : city.country;
}

function localDayNumber(dt: number, timezone: number): number {
  const local = new Date((dt + timezone) * 1000);
  return Math.floor(
    Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), local.getUTCDate()) /
      86_400_000
  );
}
