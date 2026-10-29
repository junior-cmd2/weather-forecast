"use client";

import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";

export type HourlyWindPoint = {
  time: string;
  windSpeed: number;
};

export default function HourlyWindChart({
  data,
}: {
  data: HourlyWindPoint[];
}) {
  return (
    <div className="h-[180px] w-full min-w-0 sm:h-[220px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 8, right: 8, left: 8, bottom: 0 }}
        >
          <defs>
            <linearGradient
              id="windGradient"
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.4} />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity={0.02} />
            </linearGradient>
          </defs>

          <XAxis
            dataKey="time"
            orientation="top"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12 }}
          />

          <Tooltip />

          <Area
            type="monotone"
            dataKey="windSpeed"
            name="Wind (km/h)"
            stroke="#38bdf8"
            strokeWidth={2}
            fill="url(#windGradient)"
            dot={{ fill: "#38bdf8", r: 3 }}
            activeDot={{ r: 5 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
