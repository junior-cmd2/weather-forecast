import {
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudMoon,
  CloudRain,
  CloudSnow,
  CloudSun,
  Moon,
  Sun,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const WEATHER_ICONS: Record<string, LucideIcon> = {
  "01d": Sun,
  "01n": Moon,
  "02d": CloudSun,
  "02n": CloudMoon,
  "03": Cloud,
  "04": Cloud,
  "09": CloudDrizzle,
  "10": CloudRain,
  "11": CloudLightning,
  "13": CloudSnow,
  "50": CloudFog,
};

type WeatherIconProps = {
  code?: string;
  className?: string;
  size?: number;
};

export function WeatherIcon({
  code,
  className,
  size = 24,
}: WeatherIconProps) {
  const Icon =
    WEATHER_ICONS[code ?? ""] ??
    WEATHER_ICONS[(code ?? "").slice(0, 2)] ??
    Cloud;

  return (
    <Icon
      size={size}
      className={cn("shrink-0", className)}
      aria-hidden="true"
    />
  );
}
