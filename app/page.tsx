"use client";

import { useEffect, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight, Loader2, MapPin, Search, X } from "lucide-react";
import type { City } from "@/app/api/geocoding/type";
import { Button } from "@/components/ui/button";
import ThunderstormAnimation from "@/components/weather/ThunderstormAnimation";
import WeatherDashboard from "@/components/weather/WeatherDashboard";
import { WeatherIcon } from "@/components/weather/WeatherIcon";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { readSavedCity, saveCity } from "@/lib/cityStorage";
import { fetchWeatherByCoordinates, searchCities } from "@/lib/weatherApi";
import {
  capitalize,
  formatCity,
  formatCityRegion,
  formatTemperature,
  formatUpdatedAt,
} from "@/lib/weatherFormat";

const defaultCity: City = {
  name: "Lagos",
  country: "NG",
  state: "Ikeja",
  lat: 6.5244,
  lon: 3.3792,
};

export default function Home() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [searchHint, setSearchHint] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState<City>(defaultCity);
  const [isReady, setIsReady] = useState(false);
  const debouncedSearch = useDebouncedValue(searchInput, 300);

  const weatherQuery = useQuery({
    queryKey: ["weather", selectedCity.lat, selectedCity.lon],
    queryFn: ({ signal }) =>
      fetchWeatherByCoordinates(
        selectedCity.lat,
        selectedCity.lon,
        signal
      ),
    enabled: isReady,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const searchTerm = searchInput.trim();
  const debouncedTerm = debouncedSearch.trim();

  const suggestionsQuery = useQuery({
    queryKey: ["geocoding", debouncedTerm],
    queryFn: ({ signal }) => searchCities(debouncedTerm, signal),
    enabled: searchOpen && debouncedTerm.length >= 2,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const weather = weatherQuery.data;
  const current = weather?.current;
  const suggestions = suggestionsQuery.data ?? [];
  const isSearchPending =
    searchTerm.length >= 2 &&
    (searchTerm !== debouncedTerm || suggestionsQuery.isFetching);
  const visibleSuggestions = isSearchPending ? [] : suggestions;
  const showSuggestions = searchOpen && searchTerm.length > 0;

  useEffect(() => {
    const savedCity = readSavedCity();
    const timer = window.setTimeout(() => {
      if (savedCity) {
        setSelectedCity(savedCity);
      }

      setIsReady(true);
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!searchOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [searchOpen]);

  useEffect(() => {
    if (!searchOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setSearchOpen(false);
        setSearchInput("");
        setSearchHint(null);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [searchOpen]);

  function openSearch() {
    setSearchOpen(true);
    setSearchInput(selectedCity.name);
    setSearchHint(null);
  }

  function closeSearch() {
    setSearchOpen(false);
    setSearchInput("");
    setSearchHint(null);
  }

  function selectCity(city: City) {
    setSelectedCity(city);
    saveCity(city);
    setSearchInput(formatCity(city));
    setSearchOpen(false);
    setSearchHint(null);
  }

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (searchTerm.length === 0) {
      closeSearch();
      return;
    }

    if (searchTerm.length < 2) {
      setSearchHint("Type at least 2 characters to search.");
      return;
    }

    if (isSearchPending) {
      setSearchHint("Still searching. Please wait a moment.");
      return;
    }

    const firstSuggestion = visibleSuggestions[0];

    if (firstSuggestion) {
      selectCity(firstSuggestion);
      return;
    }

    setSearchHint(
      suggestionsQuery.isError
        ? "City search failed. Please try again."
        : "Select a city from the suggestions below."
    );
  }

  return (
    <main className="flex flex-1 flex-col bg-zinc-50 p-4 text-foreground dark:bg-black sm:p-6 lg:p-10">
      {searchOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
          onClick={closeSearch}
          aria-hidden="true"
        />
      )}

      {searchOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Search for a city"
          className="fixed inset-x-0 top-0 z-50 w-full border-b border-zinc-200 bg-white px-3 py-4 text-black shadow-xl dark:border-slate-800 dark:bg-slate-950 dark:text-white sm:px-5 sm:py-5"
        >
          <div className="mx-auto w-full max-w-3xl">
            <h2 className="sr-only">Search for a city</h2>

            <div className="relative w-full">
              <div className="flex w-full items-center gap-2 sm:gap-3">
                <form
                  onSubmit={handleSearchSubmit}
                  className="flex min-w-0 flex-1 items-center gap-1 rounded-xl border border-zinc-300 bg-white transition-all focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100 dark:border-slate-700 dark:bg-slate-900 dark:focus-within:ring-indigo-950 sm:gap-2"
                >
                  <div className="relative min-w-0 flex-1">
                    <input
                      type="text"
                      id="city"
                      placeholder=" "
                      autoComplete="off"
                      autoFocus
                      value={searchInput}
                      onChange={(event) => {
                        setSearchInput(event.target.value);
                        setSearchHint(null);
                      }}
                      onFocus={(event) => event.currentTarget.select()}
                      role="combobox"
                      aria-autocomplete="list"
                      aria-controls={
                        showSuggestions ? "city-suggestions" : undefined
                      }
                      aria-expanded={showSuggestions}
                      className="peer w-full rounded-xl bg-transparent px-3 pb-2.5 pt-5 text-sm outline-none sm:px-4 sm:text-base"
                    />

                    <label
                      htmlFor="city"
                      className="pointer-events-none absolute left-3 top-1.5 text-xs text-zinc-500 transition-all duration-200 peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-focus:top-1.5 peer-focus:text-xs peer-focus:text-indigo-600 dark:text-slate-400 sm:left-4"
                    >
                      Search city, country, or region
                    </label>
                  </div>

                  <button
                    type="submit"
                    aria-label="Search location"
                    aria-busy={isSearchPending}
                    className="mr-1 flex shrink-0 items-center justify-center rounded-lg p-2.5 text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-indigo-600 dark:text-slate-300 dark:hover:bg-slate-800 sm:mr-1.5"
                  >
                    {isSearchPending ? (
                      <Loader2 size={20} className="animate-spin" />
                    ) : (
                      <Search size={20} />
                    )}
                  </button>
                </form>

                <button
                  type="button"
                  onClick={closeSearch}
                  aria-label="Close search"
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-zinc-200 text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white sm:h-12 sm:w-12"
                >
                  <X size={21} />
                </button>
              </div>

              {searchHint && (
                <p
                  role="alert"
                  className="mt-2 text-sm text-destructive"
                >
                  {searchHint}
                </p>
              )}

              {showSuggestions && (
                <div
                  id="city-suggestions"
                  className="absolute left-0 right-12 top-full z-50 mt-2 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900 sm:right-[60px]"
                >
                  <div className="border-b border-slate-100 px-4 py-3 dark:border-slate-800">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      {isSearchPending ? "Searching locations" : "Suggested locations"}
                    </p>
                  </div>

                  <div className="max-h-[55vh] overflow-y-auto overscroll-contain sm:max-h-[60vh]">
                    {searchTerm.length < 2 ? (
                      <StatusRow>Type at least 2 characters.</StatusRow>
                    ) : isSearchPending ? (
                      <StatusRow>Searching cities...</StatusRow>
                    ) : suggestionsQuery.isError ? (
                      <StatusRow>
                        Could not search cities. Please try again.
                      </StatusRow>
                    ) : visibleSuggestions.length === 0 ? (
                      <StatusRow>
                        No cities found for &ldquo;{searchInput}&rdquo;.
                      </StatusRow>
                    ) : (
                      visibleSuggestions.map((city) => (
                        <button
                          key={`${city.name}-${city.country}-${city.lat}-${city.lon}`}
                          type="button"
                          onClick={() => selectCity(city)}
                          className="group flex w-full items-center gap-3 border-b border-slate-100 px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-slate-50 focus-visible:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-500 dark:border-slate-800 dark:hover:bg-slate-800 dark:focus-visible:bg-slate-800 sm:px-5 sm:py-3.5"
                        >
                          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 transition-colors group-hover:bg-indigo-100 dark:bg-indigo-950 dark:text-indigo-400 dark:group-hover:bg-slate-700">
                            <MapPin size={18} />
                          </span>

                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-semibold text-slate-800 dark:text-slate-100 sm:text-base">
                              {city.name}
                            </span>

                            <span className="mt-0.5 block truncate text-xs text-slate-500 dark:text-slate-400 sm:text-sm">
                              {formatCityRegion(city)}
                            </span>
                          </span>

                          <ChevronRight
                            size={18}
                            className="shrink-0 text-slate-400 transition-transform group-hover:translate-x-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400"
                          />
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {(!isReady || weatherQuery.isLoading) && <ThunderstormAnimation />}

      {weather && current && (
        <section className="mt-6 flex flex-col gap-4 rounded-2xl border bg-card p-5 text-card-foreground shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-5">
            <WeatherIcon
              code={current.icon}
              size={56}
              className="text-amber-500"
            />

            <div>
              <p className="text-4xl font-extrabold">
                {formatTemperature(current.temp)}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {capitalize(current.description)} · Feels like{" "}
                {formatTemperature(current.feelsLike, "°C")}
              </p>
            </div>
          </div>

          <div className="sm:text-right">
            <p className="text-2xl font-extrabold">{selectedCity.name}</p>
            <p className="text-sm text-muted-foreground">
              {formatCityRegion(selectedCity)}
            </p>

            <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground sm:justify-end">
              <span>
                Updated{" "}
                {formatUpdatedAt(
                  weather.updatedAt,
                  weather.location.timezone
                )}
              </span>

              <button
                type="button"
                onClick={openSearch}
                className="inline-flex items-center gap-1 font-medium text-indigo-600 hover:underline dark:text-indigo-400"
              >
                <MapPin size={16} /> Change location
              </button>
            </div>
          </div>
        </section>
      )}

      {weatherQuery.isError && !weather && (
        <section
          role="alert"
          className="mt-6 rounded-2xl border border-destructive/30 bg-destructive/5 p-6"
        >
          <h2 className="text-lg font-bold">Could not load the weather</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {weatherQuery.error instanceof Error
              ? weatherQuery.error.message
              : "Please try again."}
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            <Button onClick={() => void weatherQuery.refetch()}>
              Try again
            </Button>
            <Button variant="outline" onClick={openSearch}>
              Change location
            </Button>
          </div>
        </section>
      )}

      {weatherQuery.isError && weather && (
        <div
          role="alert"
          className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm"
        >
          <span>Could not refresh the weather. Showing the last update.</span>
          <button
            type="button"
            onClick={() => void weatherQuery.refetch()}
            className="font-semibold underline"
          >
            Retry
          </button>
        </div>
      )}

      {weather && weatherQuery.isFetching && !weatherQuery.isLoading && (
        <p
          role="status"
          className="mt-2 text-right text-xs text-muted-foreground"
        >
          Updating...
        </p>
      )}

      {weather && <WeatherDashboard data={weather} />}
    </main>
  );
}

function StatusRow({ children }: { children: ReactNode }) {
  return (
    <p
      role="status"
      className="px-4 py-4 text-sm text-muted-foreground sm:px-5"
    >
      {children}
    </p>
  );
}
