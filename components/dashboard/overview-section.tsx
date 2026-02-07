"use client"

import { useEffect, useState } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { supabase } from "@/lib/supabase"
import { Area, AreaChart, CartesianGrid, XAxis, Label, PolarGrid, PolarRadiusAxis, RadialBar, RadialBarChart } from "recharts"

const areaChartConfig = {
    blocked: {
        label: "Blocked",
        color: "var(--chart-1)",
    },
} satisfies ChartConfig

const totalRequestsConfig = {
    value: { label: "Requests" },
    total: { label: "Total", color: "var(--chart-1)" },
} satisfies ChartConfig

const blockedConfig = {
    value: { label: "Blocked" },
    blocked: { label: "Blocked", color: "var(--chart-3)" },
} satisfies ChartConfig

const safeConfig = {
    value: { label: "Safe" },
    safe: { label: "Safe", color: "var(--chart-2)" },
} satisfies ChartConfig

const threatConfig = {
    value: { label: "Threat" },
    threat: { label: "Threat", color: "var(--chart-4)" },
} satisfies ChartConfig

export function OverviewSection() {
    const [metrics, setMetrics] = useState({
        total: 0,
        blocked: 0,
        safe: 0,
        threatLevel: 0
    })
    const [areaChartData, setAreaChartData] = useState<any[]>([])

    useEffect(() => {
        fetchData()
        const channel = supabase
            .channel('dashboard-updates')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'requests' }, () => {
                fetchData()
            })
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [])

    const fetchData = async () => {
        const { data: requests } = await supabase
            .from('requests')
            .select('*')
            .order('created_at', { ascending: true })

        if (!requests) return

        const total = requests.length
        const blocked = requests.filter(r => r.action === "BLOCKED").length
        const safe = total - blocked
        const threatLevel = total > 0 ? Math.round((blocked / total) * 100) : 0

        setMetrics({ total, blocked, safe, threatLevel })

        // Process data for area chart
        const hourlyData: { [key: string]: number } = {}
        requests.forEach(r => {
            const hour = new Date(r.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            if (r.action === "BLOCKED") {
                hourlyData[hour] = (hourlyData[hour] || 0) + 1
            } else {
                hourlyData[hour] = hourlyData[hour] || 0
            }
        })

        const areaData = Object.entries(hourlyData).slice(-12).map(([time, count]) => ({
            time,
            blocked: count
        }))
        setAreaChartData(areaData)
    }

    return (
        <div className="space-y-6">
            {/* Radial Charts Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Requests */}
                <Card className="flex flex-col">
                    <CardHeader className="items-center pb-0">
                        <CardTitle className="text-sm">Total Requests</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 pb-0">
                        <ChartContainer
                            config={totalRequestsConfig}
                            className="mx-auto aspect-square max-h-[180px]"
                        >
                            <RadialBarChart
                                data={[{ name: "total", value: metrics.total, fill: "var(--color-total)" }]}
                                startAngle={0}
                                endAngle={Math.min(360, metrics.total * 36)}
                                innerRadius={60}
                                outerRadius={85}
                            >
                                <PolarGrid
                                    gridType="circle"
                                    radialLines={false}
                                    stroke="none"
                                    className="first:fill-muted last:fill-background"
                                    polarRadius={[66, 54]}
                                />
                                <RadialBar dataKey="value" background cornerRadius={10} />
                                <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
                                    <Label
                                        content={({ viewBox }) => {
                                            if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                                                return (
                                                    <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                                                        <tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground text-3xl font-bold">
                                                            {metrics.total}
                                                        </tspan>
                                                        <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 20} className="fill-muted-foreground text-xs">
                                                            Total
                                                        </tspan>
                                                    </text>
                                                )
                                            }
                                        }}
                                    />
                                </PolarRadiusAxis>
                            </RadialBarChart>
                        </ChartContainer>
                    </CardContent>
                </Card>

                {/* Injection Attempts */}
                <Card className="flex flex-col">
                    <CardHeader className="items-center pb-0">
                        <CardTitle className="text-sm">Injection Attempts</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 pb-0">
                        <ChartContainer
                            config={blockedConfig}
                            className="mx-auto aspect-square max-h-[180px]"
                        >
                            <RadialBarChart
                                data={[{ name: "blocked", value: metrics.blocked, fill: "var(--color-blocked)" }]}
                                startAngle={0}
                                endAngle={metrics.total > 0 ? (metrics.blocked / metrics.total) * 360 : 0}
                                innerRadius={60}
                                outerRadius={85}
                            >
                                <PolarGrid
                                    gridType="circle"
                                    radialLines={false}
                                    stroke="none"
                                    className="first:fill-muted last:fill-background"
                                    polarRadius={[66, 54]}
                                />
                                <RadialBar dataKey="value" background cornerRadius={10} />
                                <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
                                    <Label
                                        content={({ viewBox }) => {
                                            if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                                                return (
                                                    <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                                                        <tspan x={viewBox.cx} y={viewBox.cy} className="fill-red-500 text-3xl font-bold">
                                                            {metrics.blocked}
                                                        </tspan>
                                                        <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 20} className="fill-muted-foreground text-xs">
                                                            Blocked
                                                        </tspan>
                                                    </text>
                                                )
                                            }
                                        }}
                                    />
                                </PolarRadiusAxis>
                            </RadialBarChart>
                        </ChartContainer>
                    </CardContent>
                </Card>

                {/* Safe Queries */}
                <Card className="flex flex-col">
                    <CardHeader className="items-center pb-0">
                        <CardTitle className="text-sm">Safe Queries</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 pb-0">
                        <ChartContainer
                            config={safeConfig}
                            className="mx-auto aspect-square max-h-[180px]"
                        >
                            <RadialBarChart
                                data={[{ name: "safe", value: metrics.safe, fill: "var(--color-safe)" }]}
                                startAngle={0}
                                endAngle={metrics.total > 0 ? (metrics.safe / metrics.total) * 360 : 0}
                                innerRadius={60}
                                outerRadius={85}
                            >
                                <PolarGrid
                                    gridType="circle"
                                    radialLines={false}
                                    stroke="none"
                                    className="first:fill-muted last:fill-background"
                                    polarRadius={[66, 54]}
                                />
                                <RadialBar dataKey="value" background cornerRadius={10} />
                                <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
                                    <Label
                                        content={({ viewBox }) => {
                                            if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                                                return (
                                                    <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                                                        <tspan x={viewBox.cx} y={viewBox.cy} className="fill-green-500 text-3xl font-bold">
                                                            {metrics.safe}
                                                        </tspan>
                                                        <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 20} className="fill-muted-foreground text-xs">
                                                            Safe
                                                        </tspan>
                                                    </text>
                                                )
                                            }
                                        }}
                                    />
                                </PolarRadiusAxis>
                            </RadialBarChart>
                        </ChartContainer>
                    </CardContent>
                </Card>

                {/* Threat Level */}
                <Card className="flex flex-col">
                    <CardHeader className="items-center pb-0">
                        <CardTitle className="text-sm">Threat Level</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 pb-0">
                        <ChartContainer
                            config={threatConfig}
                            className="mx-auto aspect-square max-h-[180px]"
                        >
                            <RadialBarChart
                                data={[{ name: "threat", value: metrics.threatLevel, fill: "var(--color-threat)" }]}
                                startAngle={0}
                                endAngle={(metrics.threatLevel / 100) * 360}
                                innerRadius={60}
                                outerRadius={85}
                            >
                                <PolarGrid
                                    gridType="circle"
                                    radialLines={false}
                                    stroke="none"
                                    className="first:fill-muted last:fill-background"
                                    polarRadius={[66, 54]}
                                />
                                <RadialBar dataKey="value" background cornerRadius={10} />
                                <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
                                    <Label
                                        content={({ viewBox }) => {
                                            if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                                                return (
                                                    <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                                                        <tspan x={viewBox.cx} y={viewBox.cy} className={`text-3xl font-bold ${metrics.threatLevel > 20 ? "fill-red-500" :
                                                                metrics.threatLevel > 10 ? "fill-yellow-500" : "fill-green-500"
                                                            }`}>
                                                            {metrics.threatLevel}%
                                                        </tspan>
                                                        <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 20} className="fill-muted-foreground text-xs">
                                                            Threat
                                                        </tspan>
                                                    </text>
                                                )
                                            }
                                        }}
                                    />
                                </PolarRadiusAxis>
                            </RadialBarChart>
                        </ChartContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Area Chart */}
            <Card>
                <CardHeader>
                    <CardTitle>Injection Attempts Over Time</CardTitle>
                    <CardDescription>Real-time visualization of blocked prompts</CardDescription>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={areaChartConfig}>
                        <AreaChart
                            accessibilityLayer
                            data={areaChartData}
                            margin={{ left: 12, right: 12 }}
                        >
                            <CartesianGrid vertical={false} />
                            <XAxis
                                dataKey="time"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                            />
                            <ChartTooltip
                                cursor={false}
                                content={<ChartTooltipContent indicator="line" />}
                            />
                            <Area
                                dataKey="blocked"
                                type="natural"
                                fill="var(--color-blocked)"
                                fillOpacity={0.4}
                                stroke="var(--color-blocked)"
                            />
                        </AreaChart>
                    </ChartContainer>
                </CardContent>
            </Card>
        </div>
    )
}
