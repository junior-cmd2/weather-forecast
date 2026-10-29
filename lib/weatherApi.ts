import type { City } from "@/app/api/geocoding/type";
import type { WeatherData } from "@/lib/weatherTypes";

async function readErrorMessage(
  response: Response,
  fallback: string
): Promise<string> {
  try {
    const body: unknown = await response.json();

    if (
      body &&
      typeof body === "object" &&
      "message" in body &&
      typeof body.message === "string" &&
      body.message.trim().length > 0
    ) {
      return body.message;
    }
  } catch {
    // The response was not JSON.
  }

  return fallback;
}

export async function searchCities(
  city: string,
  signal?: AbortSignal
): Promise<City[]> {
  const response = await fetch(
    `/api/geocoding?q=${encodeURIComponent(city)}`,
    { signal }
  );

  if (!response.ok) {
    throw new Error(
      await readErrorMessage(
        response,
        `City search failed (${response.status}).`
      )
    );
  }

  return response.json() as Promise<City[]>;
}

export async function fetchWeatherByCoordinates(
  lat: number,
  lon: number,
  signal?: AbortSignal
): Promise<WeatherData> {
  const response = await fetch(`/api/forecast?lat=${lat}&lon=${lon}`, {
    signal,
  });

  if (!response.ok) {
    throw new Error(
      await readErrorMessage(
        response,
        `Weather request failed (${response.status}).`
      )
    );
  }

  return response.json() as Promise<WeatherData>;
}
