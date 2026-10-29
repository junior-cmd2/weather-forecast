export type CurrentWeather = {
  dt: number;
  temp: number;
  feelsLike: number;
  description: string;
  icon: string;
  humidity: number;
  pressure: number;
  visibility: number;
  windSpeed: number;
  dewPoint: number;
};

export type HourlyWeather = {
  dt: number;
  temp: number;
  description: string;
  icon: string;
  pop: number;
  windSpeed: number;
  humidity: number;
};

export type DailyWeather = {
  dt: number;
  date: string;
  min: number;
  max: number;
  description: string;
  icon: string;
  pop: number;
  humidity: number;
  windSpeed: number;
};

export type TodayPeriods = {
  morning: HourlyWeather | null;
  afternoon: HourlyWeather | null;
  evening: HourlyWeather | null;
};

export type WeatherLocation = {
  name: string;
  country: string;
  timezone: number;
  lat: number;
  lon: number;
  sunrise: number;
  sunset: number;
};

export type WeatherData = {
  location: WeatherLocation;
  current: CurrentWeather;
  hourly: HourlyWeather[];
  today: TodayPeriods;
  daily: DailyWeather[];
  updatedAt: number;
};
