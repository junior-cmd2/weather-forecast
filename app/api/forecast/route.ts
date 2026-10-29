import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type {
  CurrentWeather,
  DailyWeather,
  HourlyWeather,
  WeatherData,
} from "@/lib/weatherTypes";

type OpenWeatherCondition = {
  description?: string;
  icon?: string;
};

type OpenWeatherCurrentResponse = {
  dt: number;
  name?: string;
  timezone?: number;
  sys?: {
    country?: string;
    sunrise?: number;
    sunset?: number;
  };
  main?: {
    temp?: number;
    feels_like?: number;
    humidity?: number;
    pressure?: number;
  };
  weather?: OpenWeatherCondition[];
  visibility?: number;
  wind?: {
    speed?: number;
  };
};

type OpenWeatherForecastItem = {
  dt: number;
  main?: {
    temp?: number;
    humidity?: number;
  };
  weather?: OpenWeatherCondition[];
  wind?: {
    speed?: number;
  };
  pop?: number;
};

type OpenWeatherForecastResponse = {
  city?: {
    name?: string;
    country?: string;
    timezone?: number;
  };
  list?: OpenWeatherForecastItem[];
};

export async function GET(request: NextRequest) {
  const latParam = request.nextUrl.searchParams.get("lat");
  const lonParam = request.nextUrl.searchParams.get("lon");
  const lat = latParam === null ? Number.NaN : Number(latParam);
  const lon = lonParam === null ? Number.NaN : Number(lonParam);

  if (
    !Number.isFinite(lat) ||
    lat < -90 ||
    lat > 90 ||
    !Number.isFinite(lon) ||
    lon < -180 ||
    lon > 180
  ) {
    return NextResponse.json(
      { message: "Latitude and longitude must be valid coordinates." },
      { status: 400 }
    );
  }

  const apiKey = process.env.OPENWEATHER_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { message: "Weather service is not configured." },
      { status: 500 }
    );
  }

  const currentUrl = new URL("https://api.openweathermap.org/data/2.5/weather");
  currentUrl.searchParams.set("lat", String(lat));
  currentUrl.searchParams.set("lon", String(lon));
  currentUrl.searchParams.set("units", "metric");
  currentUrl.searchParams.set("appid", apiKey);

  const forecastUrl = new URL("https://api.openweathermap.org/data/2.5/forecast");
  forecastUrl.searchParams.set("lat", String(lat));
  forecastUrl.searchParams.set("lon", String(lon));
  forecastUrl.searchParams.set("units", "metric");
  forecastUrl.searchParams.set("appid", apiKey);

  try {
    const [currentResponse, forecastResponse] = await Promise.all([
      fetch(currentUrl, { cache: "no-store" }),
      fetch(forecastUrl, { cache: "no-store" }),
    ]);

    if (!currentResponse.ok || !forecastResponse.ok) {
      return NextResponse.json(
        { message: "The weather service could not complete the request." },
        { status: 502 }
      );
    }

    const [current, forecast] = (await Promise.all([
      currentResponse.json(),
      forecastResponse.json(),
    ])) as [OpenWeatherCurrentResponse, OpenWeatherForecastResponse];

    const data = buildWeatherData(current, forecast, lat, lon);

    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return NextResponse.json(
      { message: "The weather service is unavailable. Please try again." },
      { status: 502 }
    );
  }
}

function buildWeatherData(
  current: OpenWeatherCurrentResponse,
  forecast: OpenWeatherForecastResponse,
  lat: number,
  lon: number
): WeatherData {
  const timezone = numberOr(current.timezone, numberOr(forecast.city?.timezone, 0));
  const list = Array.isArray(forecast.list) ? forecast.list : [];
  const now = current.dt || Math.floor(Date.now() / 1000);
  const currentTemp = numberOr(
    current.main?.temp,
    numberOr(list[0]?.main?.temp, 0)
  );
  const currentHumidity = numberOr(current.main?.humidity, 0);

  const currentWeather: CurrentWeather = {
    dt: now,
    temp: currentTemp,
    feelsLike: numberOr(current.main?.feels_like, currentTemp),
    description: conditionDescription(current.weather),
    icon: conditionIcon(current.weather),
    humidity: currentHumidity,
    pressure: numberOr(current.main?.pressure, 0),
    visibility: numberOr(current.visibility, 0),
    windSpeed: toKilometersPerHour(numberOr(current.wind?.speed, 0)),
    dewPoint: calculateDewPoint(currentTemp, currentHumidity),
  };

  const upcoming = list.filter((item) => item.dt > now);
  const currentHourly: HourlyWeather = {
    dt: now,
    temp: currentWeather.temp,
    description: currentWeather.description,
    icon: currentWeather.icon,
    pop: clamp(numberOr(upcoming[0]?.pop, 0), 0, 1),
    windSpeed: currentWeather.windSpeed,
    humidity: currentWeather.humidity,
  };

  const hourly = [currentHourly, ...upcoming.map(mapHourly)].slice(0, 10);
  const todayKey = localDateKey(now, timezone);
  const todayItems = list.filter(
    (item) => localDateKey(item.dt, timezone) === todayKey
  );

  return {
    location: {
      name:
        current.name?.trim() ||
        forecast.city?.name?.trim() ||
        "Unknown location",
      country:
        current.sys?.country?.trim() ||
        forecast.city?.country?.trim() ||
        "",
      timezone,
      lat,
      lon,
      sunrise: numberOr(current.sys?.sunrise, 0),
      sunset: numberOr(current.sys?.sunset, 0),
    },
    current: currentWeather,
    hourly,
    today: {
      morning: pickPeriod(todayItems, 6, 11, 9, timezone),
      afternoon: pickPeriod(todayItems, 12, 17, 15, timezone),
      evening: pickPeriod(todayItems, 18, 23, 21, timezone),
    },
    daily: buildDailyForecast(list, timezone),
    updatedAt: now,
  };
}

function mapHourly(item: OpenWeatherForecastItem): HourlyWeather {
  return {
    dt: item.dt,
    temp: numberOr(item.main?.temp, 0),
    description: conditionDescription(item.weather),
    icon: conditionIcon(item.weather),
    pop: clamp(numberOr(item.pop, 0), 0, 1),
    windSpeed: toKilometersPerHour(numberOr(item.wind?.speed, 0)),
    humidity: numberOr(item.main?.humidity, 0),
  };
}

function pickPeriod(
  items: OpenWeatherForecastItem[],
  startHour: number,
  endHour: number,
  targetHour: number,
  timezone: number
): HourlyWeather | null {
  const candidates = items.filter((item) => {
    const hour = localHour(item.dt, timezone);
    return hour >= startHour && hour <= endHour;
  });

  if (candidates.length === 0) return null;

  const closest = candidates.reduce((best, item) => {
    const distance = Math.abs(localHour(item.dt, timezone) - targetHour);
    const bestDistance = Math.abs(localHour(best.dt, timezone) - targetHour);
    return distance < bestDistance ? item : best;
  });

  return mapHourly(closest);
}

function buildDailyForecast(
  items: OpenWeatherForecastItem[],
  timezone: number
): DailyWeather[] {
  const groups = new Map<string, OpenWeatherForecastItem[]>();

  for (const item of items) {
    const key = localDateKey(item.dt, timezone);
    const group = groups.get(key);

    if (group) {
      group.push(item);
    } else {
      groups.set(key, [item]);
    }
  }

  return [...groups.entries()].slice(0, 7).map(([date, group]) => {
    const temperatures = group.map((item) =>
      numberOr(item.main?.temp, 0)
    );
    const representative = group.reduce((best, item) => {
      const distance = Math.abs(localHour(item.dt, timezone) - 12);
      const bestDistance = Math.abs(localHour(best.dt, timezone) - 12);
      return distance < bestDistance ? item : best;
    });
    const pop = Math.max(...group.map((item) => numberOr(item.pop, 0)));
    const humidity =
      group.reduce(
        (total, item) => total + numberOr(item.main?.humidity, 0),
        0
      ) / group.length;
    const windSpeed =
      group.reduce(
        (total, item) =>
          total + toKilometersPerHour(numberOr(item.wind?.speed, 0)),
        0
      ) / group.length;

    return {
      dt: representative.dt,
      date,
      min: Math.min(...temperatures),
      max: Math.max(...temperatures),
      description: conditionDescription(representative.weather),
      icon: conditionIcon(representative.weather),
      pop: clamp(pop, 0, 1),
      humidity: Math.round(humidity),
      windSpeed,
    };
  });
}

function conditionDescription(
  weather: OpenWeatherCondition[] | undefined
): string {
  const description = weather?.[0]?.description?.trim();
  return description || "Weather unavailable";
}

function conditionIcon(
  weather: OpenWeatherCondition[] | undefined
): string {
  return weather?.[0]?.icon?.trim() || "01d";
}

function numberOr(value: number | undefined, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function toKilometersPerHour(metersPerSecond: number): number {
  return metersPerSecond * 3.6;
}

function calculateDewPoint(
  temperatureCelsius: number,
  humidity: number
): number {
  if (
    !Number.isFinite(temperatureCelsius) ||
    !Number.isFinite(humidity) ||
    humidity <= 0
  ) {
    return temperatureCelsius;
  }

  const clampedHumidity = clamp(humidity, 1, 100);
  const a = 17.27;
  const b = 237.7;
  const alpha =
    (a * temperatureCelsius) / (b + temperatureCelsius) +
    Math.log(clampedHumidity / 100);

  return (b * alpha) / (a - alpha);
}

function localDateKey(dt: number, timezone: number): string {
  return new Date((dt + timezone) * 1000).toISOString().slice(0, 10);
}

function localHour(dt: number, timezone: number): number {
  return new Date((dt + timezone) * 1000).getUTCHours();
}
