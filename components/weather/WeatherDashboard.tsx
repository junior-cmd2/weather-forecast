"use client";

import type { ReactNode } from "react";
import { Droplets, Eye, Thermometer, Wind, WindArrowDown } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import HourlyWindChart from "@/components/weather/HourlyWindChart";
import { WeatherIcon } from "@/components/weather/WeatherIcon";
import {
  capitalize,
  formatDayLabel,
  formatHour,
  formatPercent,
  formatPressure,
  formatTemperature,
  formatVisibility,
  formatWindSpeed,
} from "@/lib/weatherFormat";
import type { TodayPeriods, WeatherData } from "@/lib/weatherTypes";

const PERIODS: Array<{ key: keyof TodayPeriods; label: string }> = [
  { key: "morning", label: "Morning" },
  { key: "afternoon", label: "Afternoon" },
  { key: "evening", label: "Evening" },
];

export default function WeatherDashboard({ data }: { data: WeatherData }) {
  const { current, daily, hourly, location, today } = data;
  const hourlyLabels = hourly.map((item, index) =>
    index === 0 ? "Now" : formatHour(item.dt, location.timezone)
  );
  const chartData = hourly.map((item, index) => ({
    time: hourlyLabels[index],
    windSpeed: item.windSpeed,
  }));
  const hourlyGridStyle = {
    gridTemplateColumns: `100px repeat(${Math.max(hourly.length, 1)}, minmax(0, 1fr))`,
  };
  const dailyTitle =
    daily.length > 1 ? `${daily.length}-Day Forecast` : "Daily Forecast";

  return (
    <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-3">
      <div className="w-full min-w-0 md:col-span-2">
        <Tabs defaultValue="today" className="flex w-full min-w-0 flex-col">
          <TabsList className="grid h-auto w-full grid-cols-3">
            <TabsTrigger value="today" className="px-1 py-2 text-xs sm:text-sm">
              Today
            </TabsTrigger>
            <TabsTrigger value="hourly" className="px-1 py-2 text-xs sm:text-sm">
              Hourly
            </TabsTrigger>
            <TabsTrigger value="daily" className="px-1 py-2 text-xs sm:text-sm">
              Daily
            </TabsTrigger>
          </TabsList>

          <TabsContent value="today" className="w-full min-w-0">
            <Card className="w-full p-3 sm:p-5">
              <CardTitle className="text-lg sm:text-xl">
                Today&apos;s Forecast
              </CardTitle>
              <CardDescription>
                Conditions across the day in {location.name}.
              </CardDescription>

              <CardContent className="mt-4 grid grid-cols-1 gap-3 p-0 sm:grid-cols-3 sm:gap-4">
                {PERIODS.map((period) => {
                  const forecast = today[period.key];

                  return (
                    <div
                      key={period.key}
                      className="flex flex-col items-center gap-3 rounded-2xl border bg-muted/50 p-4 sm:p-5"
                    >
                      <WeatherIcon
                        code={forecast?.icon}
                        size={26}
                        className="text-amber-500"
                      />
                      <p className="text-sm text-muted-foreground">
                        {period.label}
                      </p>
                      <span className="text-xl font-extrabold">
                        {formatTemperature(forecast?.temp, "°C")}
                      </span>
                      <span className="text-center text-xs text-muted-foreground">
                        {forecast
                          ? capitalize(forecast.description)
                          : "No data available"}
                      </span>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="hourly" className="w-full min-w-0">
            <Card className="w-full min-w-0 overflow-hidden p-3 sm:p-5">
              <CardTitle className="mb-2 text-lg sm:text-xl">
                Hourly Forecast
              </CardTitle>
              <CardDescription>
                Three-hour temperature, rain, and wind forecast.
              </CardDescription>

              <CardContent className="mt-4 min-w-0 p-0">
                <div className="w-full overflow-x-auto">
                  <div className="min-w-[600px]">
                    <div
                      className="grid items-center gap-2 border-b pb-5"
                      style={hourlyGridStyle}
                    >
                      <p className="text-sm font-semibold">Time</p>

                      {hourly.map((item, index) => (
                        <div
                          key={item.dt}
                          className="flex flex-col items-center gap-3"
                        >
                          <p className="text-xs">
                            {index === 0
                              ? "Now"
                              : formatHour(item.dt, location.timezone)}
                          </p>
                          <WeatherIcon
                            code={item.icon}
                            size={20}
                            className="text-sky-500"
                          />
                          <p className="font-extrabold">
                            {formatTemperature(item.temp)}
                          </p>
                        </div>
                      ))}
                    </div>

                    <div
                      className="grid items-center gap-2 border-b py-5"
                      style={hourlyGridStyle}
                    >
                      <p className="text-sm font-medium">Chances of Rain</p>

                      {hourly.map((item) => (
                        <p
                          key={`rain-${item.dt}`}
                          className="text-center text-xs font-extrabold text-blue-700 dark:text-blue-400"
                        >
                          {formatPercent(item.pop)}
                        </p>
                      ))}
                    </div>

                    <div className="pt-5">
                      <p className="text-sm font-medium">Wind (km/h)</p>
                      <HourlyWindChart data={chartData} />
                    </div>
                  </div>
                </div>

                <p className="mt-3 text-xs text-muted-foreground sm:hidden">
                  Swipe horizontally to see more hours.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="daily" className="w-full min-w-0">
            <Card className="w-full min-w-0 p-3 sm:p-5">
              <CardTitle className="text-lg sm:text-xl">{dailyTitle}</CardTitle>
              <CardDescription>
                Daily low, high, and conditions for the coming days.
              </CardDescription>

              <CardContent className="mt-5 space-y-4 p-0">
                {daily.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Daily forecast data is unavailable.
                  </p>
                ) : (
                  daily.map((day) => (
                    <div
                      key={day.date}
                      className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-3 border-b pb-3 last:border-b-0 last:pb-0 sm:grid-cols-[minmax(100px,1fr)_auto_minmax(120px,2fr)_auto_auto]"
                    >
                      <p className="text-sm font-medium">
                        {formatDayLabel(
                          day.dt,
                          current.dt,
                          location.timezone
                        )}
                      </p>
                      <WeatherIcon
                        code={day.icon}
                        size={20}
                        className="text-sky-500"
                      />
                      <p className="hidden text-sm text-muted-foreground sm:block">
                        {capitalize(day.description)}
                      </p>
                      <span className="text-sm text-muted-foreground">
                        {formatTemperature(day.min)}
                      </span>
                      <span className="text-sm font-bold">
                        {formatTemperature(day.max)}
                      </span>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <aside className="w-full md:col-span-1">
        <div className="w-full rounded-2xl border bg-card p-4 text-card-foreground">
          <h2 className="text-lg font-bold">Today&apos;s Weather</h2>

          <div className="mt-5 grid grid-cols-3 gap-2 text-center">
            {PERIODS.map((period) => {
              const forecast = today[period.key];

              return (
                <div
                  key={period.key}
                  className="flex flex-col items-center gap-2 rounded-xl p-2"
                >
                  <span className="text-xs text-muted-foreground">
                    {period.label}
                  </span>
                  <WeatherIcon
                    code={forecast?.icon}
                    size={28}
                    className="text-amber-500"
                  />
                  <span className="text-lg font-extrabold">
                    {formatTemperature(forecast?.temp, "°C")}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="mt-5 space-y-4 rounded-2xl border p-4">
            <DetailRow
              icon={<Thermometer size={18} />}
              label="Feels like"
              value={formatTemperature(current.feelsLike, "°C")}
            />
            <DetailRow
              icon={<Droplets size={18} />}
              label="Humidity"
              value={`${Math.round(current.humidity)}%`}
            />
            <DetailRow
              icon={<WindArrowDown size={18} />}
              label="Pressure"
              value={formatPressure(current.pressure)}
            />
            <DetailRow
              icon={<Eye size={18} />}
              label="Visibility"
              value={formatVisibility(current.visibility)}
            />
            <DetailRow
              icon={<Wind size={18} />}
              label="Wind"
              value={formatWindSpeed(current.windSpeed)}
            />
            <DetailRow
              icon={<Droplets size={18} />}
              label="Dew point"
              value={formatTemperature(current.dewPoint, "°C")}
            />
          </div>
        </div>
      </aside>
    </div>
  );
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2 text-muted-foreground">
        {icon}
        <span>{label}</span>
      </div>
      <span className="font-bold">{value}</span>
    </div>
  );
}
