"use client";

import * as React from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  type TooltipProps,
} from "recharts";
import { cn } from "@/lib/utils";

type ChartType = "line" | "bar" | "pie" | "area";

interface BaseChartProps {
  type?: ChartType;
  data: Record<string, unknown>[];
  xKey: string;
  yKey?: string;
  categories?: { key: string; color: string; name?: string }[];
  height?: number;
  className?: string;
  showGrid?: boolean;
  showLegend?: boolean;
  showTooltip?: boolean;
  showXAxis?: boolean;
  showYAxis?: boolean;
  loading?: boolean;
}

const CHART_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

const CustomTooltip = ({
  active,
  payload,
  label,
}: TooltipProps<number, string>) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border bg-background p-3 shadow-sm">
      <p className="text-xs font-medium text-muted-foreground mb-1">{label}</p>
      {payload.map((entry, idx) => (
        <p key={idx} className="text-sm font-semibold" style={{ color: entry.color }}>
          {entry.name}: {entry.value?.toLocaleString()}
        </p>
      ))}
    </div>
  );
};

const Chart = React.forwardRef<HTMLDivElement, BaseChartProps>(
  (
    {
      type = "line",
      data,
      xKey,
      categories,
      height = 300,
      className,
      showGrid = true,
      showLegend = true,
      showTooltip = true,
      showXAxis = true,
      showYAxis = true,
      loading = false,
    },
    ref
  ) => {
    const resolvedCategories = categories ?? [{ key: xKey, color: CHART_COLORS[0] ?? "hsl(var(--primary))" }];

    if (loading) {
      return (
        <div
          ref={ref}
          className={cn("flex items-center justify-center rounded-lg border bg-muted/20", className)}
          style={{ height }}
        >
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      );
    }

    const renderChart = () => {
      switch (type) {
        case "line":
          return (
            <LineChart data={data}>
              {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />}
              {showXAxis && <XAxis dataKey={xKey} tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />}
              {showYAxis && <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />}
              {showTooltip && <Tooltip content={<CustomTooltip />} />}
              {showLegend && <Legend />}
              {resolvedCategories.map((cat, idx) => (
                <Line
                  key={cat.key}
                  type="monotone"
                  dataKey={cat.key}
                  stroke={cat.color || CHART_COLORS[idx % CHART_COLORS.length]}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  name={cat.name || cat.key}
                />
              ))}
            </LineChart>
          );

        case "bar":
          return (
            <BarChart data={data}>
              {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />}
              {showXAxis && <XAxis dataKey={xKey} tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />}
              {showYAxis && <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />}
              {showTooltip && <Tooltip content={<CustomTooltip />} />}
              {showLegend && <Legend />}
              {resolvedCategories.map((cat, idx) => (
                <Bar
                  key={cat.key}
                  dataKey={cat.key}
                  fill={cat.color || CHART_COLORS[idx % CHART_COLORS.length]}
                  radius={[4, 4, 0, 0]}
                  name={cat.name || cat.key}
                />
              ))}
            </BarChart>
          );

        case "area":
          return (
            <AreaChart data={data}>
              {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />}
              {showXAxis && <XAxis dataKey={xKey} tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />}
              {showYAxis && <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />}
              {showTooltip && <Tooltip content={<CustomTooltip />} />}
              {showLegend && <Legend />}
              {resolvedCategories.map((cat, idx) => (
                <Area
                  key={cat.key}
                  type="monotone"
                  dataKey={cat.key}
                  stroke={cat.color || CHART_COLORS[idx % CHART_COLORS.length]}
                  fill={cat.color || CHART_COLORS[idx % CHART_COLORS.length]}
                  fillOpacity={0.2}
                  strokeWidth={2}
                  name={cat.name || cat.key}
                />
              ))}
            </AreaChart>
          );

        case "pie":
          return (
            <PieChart>
              <Pie
                data={data}
                dataKey={resolvedCategories[0]?.key || "value"}
                nameKey={xKey}
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {data.map((_, idx) => (
                  <Cell
                    key={idx}
                    fill={CHART_COLORS[idx % CHART_COLORS.length]}
                  />
                ))}
              </Pie>
              {showTooltip && <Tooltip content={<CustomTooltip />} />}
              {showLegend && <Legend />}
            </PieChart>
          );
      }
    };

    return (
      <div ref={ref} className={cn("w-full", className)}>
        <ResponsiveContainer width="100%" height={height}>
          {renderChart()}
        </ResponsiveContainer>
      </div>
    );
  }
);
Chart.displayName = "Chart";

export { Chart, CHART_COLORS, type ChartType };
