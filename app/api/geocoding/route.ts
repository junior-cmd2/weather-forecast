
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  // 1. Get the city typed by the user
  const urls = new URL(request.url)
  const city = urls.searchParams.get("q") || ""

  // 2. Check if the user entered a valid search term
  if (city.length < 2) {
    return NextResponse.json([]);
  }

  if (city.length > 100) {
    return NextResponse.json(
      { message: "Search query is too long." },
      { status: 400 }
    );
  }

  // 3. Get your API key from .env.local
  const apiKey = process.env.OPENWEATHER_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { message: "API key is missing" },
      { status: 500 }
    );
  }

  // 4. Create the OpenWeather Geocoding URL
  const url = new URL(
    "https://api.openweathermap.org/geo/1.0/direct"
  );

  url.searchParams.set("q", city);
  url.searchParams.set("limit", "5");
  url.searchParams.set("appid", apiKey);

  try {
    // 5. Request matching locations from OpenWeather
    const response = await fetch(url.toString(), {
      cache: "no-store",
    });

    if (!response.ok) {
      return NextResponse.json(
        { message: "Failed to search locations" },
        { status: response.status }
      );
    }

    // 6. Get the matching cities
    const cities = await response.json();

    // 7. Send the cities back to your frontend
    return NextResponse.json(cities);

  } catch {
    return NextResponse.json(
      { message: "Location search failed" },
      { status: 500 }
    );
  }
}
