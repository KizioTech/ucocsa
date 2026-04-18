import * as React from "react"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Label,
  Pie,
  PieChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts"

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

// 1. Sparkline for Summary Cards
export function StatSparkline({ 
  data, 
  color = "hsl(var(--primary))" 
}: { 
  data: { value: number }[], 
  color?: string 
}) {
  const chartConfig = {
    value: {
      label: "Value",
      color: color,
    },
  } satisfies ChartConfig

  return (
    <ChartContainer config={chartConfig} className="h-[40px] w-full">
      <AreaChart data={data}>
        <Area
          type="monotone"
          dataKey="value"
          stroke="var(--color-value)"
          fill="var(--color-value)"
          fillOpacity={0.1}
          strokeWidth={2}
          dot={false}
        />
      </AreaChart>
    </ChartContainer>
  )
}

// 2. Bar Chart for Monthly Activity
export function MonthlyActivityChart({ 
  data 
}: { 
  data: { month: string, members: number, prayers: number }[] 
}) {
  const chartConfig = {
    members: {
      label: "New Members",
      color: "hsl(var(--primary))",
    },
    prayers: {
      label: "Prayer Requests",
      color: "hsl(var(--gold, 45 93% 47%))",
    },
  } satisfies ChartConfig

  return (
    <ChartContainer config={chartConfig} className="h-[300px] w-full">
      <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted" />
        <XAxis
          dataKey="month"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          className="text-xs"
        />
        <YAxis axisLine={false} tickLine={false} className="text-xs" />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey="members" fill="var(--color-members)" radius={[4, 4, 0, 0]} />
        <Bar dataKey="prayers" fill="var(--color-prayers)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ChartContainer>
  )
}

// 3. Donut Chart for Distribution
export function DistributionDonutChart({ 
  data 
}: { 
  data: { name: string, value: number, fill: string }[] 
}) {
  const chartConfig = data.reduce((acc, item) => {
    acc[item.name.toLowerCase().replace(/\s+/g, "_")] = {
      label: item.name,
      color: item.fill,
    }
    return acc
  }, {} as ChartConfig)

  return (
    <ChartContainer config={chartConfig} className="h-[300px] w-full">
      <PieChart>
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent hideLabel />}
        />
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          innerRadius={60}
          outerRadius={80}
          strokeWidth={5}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.fill} />
          ))}
          <Label
            content={({ viewBox }) => {
              if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                const totalValue = data.reduce((acc, curr) => acc + curr.value, 0)
                return (
                  <text
                    x={viewBox.cx}
                    y={viewBox.cy}
                    textAnchor="middle"
                    dominantBaseline="middle"
                  >
                    <tspan
                      x={viewBox.cx}
                      y={viewBox.cy}
                      className="fill-foreground text-3xl font-bold"
                    >
                      {totalValue}
                    </tspan>
                    <tspan
                      x={viewBox.cx}
                      y={(viewBox.cy || 0) + 24}
                      className="fill-muted-foreground text-xs uppercase"
                    >
                      Total
                    </tspan>
                  </text>
                )
              }
            }}
          />
        </Pie>
      </PieChart>
    </ChartContainer>
  )
}
