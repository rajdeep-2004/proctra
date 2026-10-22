"use client";

import { useSyncExternalStore } from "react";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { formatLocal } from "@/lib/datetime";

export type TrendPoint = { id: string; submittedAt: string; quizTitle: string; percent: number };

const config = { percent: { label: "Score", color: "var(--chart-2)" } } satisfies ChartConfig;
const noSubscribe = () => () => {};
const HEIGHT = "h-52";

/**
 * Score % per released result, oldest → newest (D-061/D-062). Dates are the viewer's local dates, which the server
 * can't know, so the chart only draws after hydration (same trick as LocalTime). A hidden table carries the numbers.
 */
export function ScoreTrendChart({ points }: { points: TrendPoint[] }) {
  const isClient = useSyncExternalStore(noSubscribe, () => true, () => false);
  const data = isClient ? points.map((p) => ({ ...p, date: formatLocal(p.submittedAt, "date") })) : [];
  const lowest = Math.min(0, ...points.map((p) => p.percent));

  return (
    <figure className="grid gap-2">
      <figcaption className="text-sm font-medium">Score over time</figcaption>
      {isClient ? (
        <ChartContainer config={config} className={`aspect-auto ${HEIGHT} w-full`} aria-hidden>
          <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="id" tickFormatter={(id: string) => data.find((d) => d.id === id)?.date ?? ""} tickLine={false} axisLine={false} tickMargin={8} interval="preserveStartEnd" />
            <YAxis domain={[lowest, 100]} tickFormatter={(v: number) => `${v}%`} tickLine={false} axisLine={false} width={48} />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  hideIndicator
                  labelFormatter={(_, payload) => {
                    const p = payload?.[0]?.payload as (TrendPoint & { date: string }) | undefined;
                    return p ? `${p.quizTitle} · ${p.date}` : "";
                  }}
                  formatter={(value) => `${value}%`}
                />
              }
            />
            <Line dataKey="percent" type="linear" stroke="var(--color-percent)" strokeWidth={2} dot={{ r: 4, fill: "var(--color-percent)", stroke: "var(--card)", strokeWidth: 2 }} isAnimationActive={false} />
          </LineChart>
        </ChartContainer>
      ) : (
        <div className={`${HEIGHT} animate-pulse rounded-md bg-muted`} />
      )}
      <table className="sr-only">
        <caption>Score per quiz, oldest first</caption>
        <thead>
          <tr><th scope="col">Quiz</th><th scope="col">Score</th></tr>
        </thead>
        <tbody>
          {points.map((p) => (
            <tr key={p.id}><th scope="row">{p.quizTitle}</th><td>{p.percent}%</td></tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
