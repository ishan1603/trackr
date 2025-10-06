"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar, TrendingDown, TrendingUp } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getMetrics } from "@/lib/storage";
import { HealthMetric } from "@/lib/types";
import Link from "next/link";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachWeekOfInterval,
  isWithinInterval,
} from "date-fns";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

export default function MonthlyDashboard() {
  const [metrics, setMetrics] = useState<HealthMetric[]>([]);
  const [monthStart, setMonthStart] = useState(startOfMonth(new Date()));

  useEffect(() => {
    const data = getMetrics();
    setMetrics(data);
  }, []);

  const monthEnd = endOfMonth(monthStart);
  const weeks = eachWeekOfInterval({ start: monthStart, end: monthEnd });

  const monthlyMetrics = metrics.filter((m) =>
    isWithinInterval(m.date, { start: monthStart, end: monthEnd })
  );

  const chartData = weeks.map((week, index) => {
    const weekEnd = new Date(week);
    weekEnd.setDate(week.getDate() + 6);

    const weekMetrics = monthlyMetrics.filter((m) =>
      isWithinInterval(m.date, { start: week, end: weekEnd })
    );

    const avgMetric = (field: keyof HealthMetric) => {
      const values = weekMetrics
        .map((m) => m[field])
        .filter((v): v is number => typeof v === "number");
      return values.length > 0
        ? values.reduce((sum, val) => sum + val, 0) / values.length
        : null;
    };

    return {
      week: `Week ${index + 1}`,
      weight: avgMetric("weight"),
      bloodPressure: avgMetric("bloodPressureSystolic"),
      bloodSugar: avgMetric("bloodSugar"),
      sleep: avgMetric("sleep"),
      steps: avgMetric("steps"),
    };
  });

  const calculateChange = (
    field: "weight" | "bloodPressureSystolic" | "sleep"
  ) => {
    const firstWeek = monthlyMetrics.filter(
      (m) => m.date >= monthStart && m.date.getDate() <= 7
    );
    const lastWeek = monthlyMetrics.filter(
      (m) => m.date >= monthEnd && m.date.getDate() > monthEnd.getDate() - 7
    );

    const firstAvg =
      firstWeek.reduce((sum, m) => sum + (m[field] || 0), 0) /
        firstWeek.length || 0;
    const lastAvg =
      lastWeek.reduce((sum, m) => sum + (m[field] || 0), 0) / lastWeek.length ||
      0;

    return lastAvg - firstAvg;
  };

  const monthlyStats = {
    avgWeight:
      chartData
        .filter((d) => d.weight)
        .reduce((sum, d) => sum + (d.weight || 0), 0) /
        chartData.filter((d) => d.weight).length || 0,
    weightChange: calculateChange("weight"),
    avgBP:
      chartData
        .filter((d) => d.bloodPressure)
        .reduce((sum, d) => sum + (d.bloodPressure || 0), 0) /
        chartData.filter((d) => d.bloodPressure).length || 0,
    avgSleep:
      chartData
        .filter((d) => d.sleep)
        .reduce((sum, d) => sum + (d.sleep || 0), 0) /
        chartData.filter((d) => d.sleep).length || 0,
    totalEntries: monthlyMetrics.length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <header className="border-b bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Monthly Dashboard</h1>
                <p className="text-xs text-muted-foreground">
                  {format(monthStart, "MMMM yyyy")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Monthly Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Avg Weight
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {monthlyStats.avgWeight.toFixed(1)} lbs
                  </div>
                  <div
                    className={`flex items-center gap-1 text-xs mt-1 ${
                      monthlyStats.weightChange < 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {monthlyStats.weightChange < 0 ? (
                      <TrendingDown className="h-3 w-3" />
                    ) : (
                      <TrendingUp className="h-3 w-3" />
                    )}
                    {Math.abs(monthlyStats.weightChange).toFixed(1)} lbs this
                    month
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Avg Blood Pressure
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {monthlyStats.avgBP.toFixed(0)} mmHg
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Systolic average
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Avg Sleep
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {monthlyStats.avgSleep.toFixed(1)} hrs
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Per night
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Entries
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {monthlyStats.totalEntries}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    This month
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Charts */}
          <Card>
            <CardHeader>
              <CardTitle>Weight Trend</CardTitle>
              <CardDescription>
                Weekly average weight throughout the month
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="weight"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.3}
                    name="Weight (lbs)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Blood Pressure Trend</CardTitle>
                <CardDescription>Systolic BP over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="bloodPressure"
                      stroke="#ef4444"
                      fill="#ef4444"
                      fillOpacity={0.3}
                      name="BP (mmHg)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sleep Pattern</CardTitle>
                <CardDescription>Average sleep duration</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="sleep"
                      stroke="#8b5cf6"
                      fill="#8b5cf6"
                      fillOpacity={0.3}
                      name="Sleep (hrs)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
