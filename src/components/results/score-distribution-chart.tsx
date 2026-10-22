"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import type { Bucket } from "@/lib/score-stats";

const config = { count: { label: "Students", color: "var(--chart-2)" } } satisfies ChartConfig;

/**
 * Bar chart of how many students scored in each 10% band (D-061/D-062).
 * The SVG is hidden from screen readers; a visually hidden table carries the same numbers.
 * No animation, so reduced-motion users see nothing move.
 */
export function ScoreDistributionChart({ buckets }: { buckets: Bucket[] }) {
  return (
    <figure className="grid gap-2">
      <figcaption className="text-sm font-medium">Score distribution</figcaption>
      <ChartContainer config={config} className="aspect-auto h-52 w-full" aria-hidden>
        <BarChart data={buckets} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} interval="preserveStartEnd" />
          <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={40} />
          <ChartTooltip cursor={false} content={<ChartTooltipContent hideIndicator />} />
          <Bar dataKey="count" fill="var(--color-count)" radius={[4, 4, 0, 0]} maxBarSize={24} isAnimationActive={false} />
        </BarChart>
      </ChartContainer>
      <table className="sr-only">
        <caption>Students per score band</caption>
        <thead>
          <tr><th scope="col">Score</th><th scope="col">Students</th></tr>
        </thead>
        <tbody>
          {buckets.map((b) => (
            <tr key={b.label}><th scope="row">{b.label}</th><td>{b.count}</td></tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
