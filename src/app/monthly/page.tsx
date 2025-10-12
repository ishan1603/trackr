"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
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
import { useAuth } from "@clerk/nextjs";
import { getMetrics } from "@/lib/storage";
import { HealthMetric } from "@/lib/types";
import Link from "next/link";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachWeekOfInterval,
  isWithinInterval,
  addDays,
  subDays,
} from "date-fns";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import AuroraBackground from "@/components/AuroraBackground";
import { formatMetricNumber } from "@/lib/utils";
import MetricForm from "@/components/MetricForm";

export default function MonthlyDashboard() {
  const { userId: clerkUserId } = useAuth();
  const isFirebaseEnabled = process.env.NEXT_PUBLIC_FIREBASE_ENABLED === "true";
  const userId = isFirebaseEnabled ? clerkUserId : "demo-user";
  const [metrics, setMetrics] = useState<HealthMetric[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMetrics = useCallback(async () => {
    if (!userId) {
      setMetrics([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    const data = await getMetrics(userId);
    setMetrics(data);
    setIsLoading(false);
  }, [userId]);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  const referenceDate = useMemo(
    () => (metrics[0]?.date ? new Date(metrics[0].date) : new Date()),
    [metrics]
  );

  const monthStart = useMemo(
    () => startOfMonth(referenceDate),
    [referenceDate]
  );
  const monthEnd = useMemo(() => endOfMonth(referenceDate), [referenceDate]);

  const weeks = useMemo(
    () => eachWeekOfInterval({ start: monthStart, end: monthEnd }),
    [monthStart, monthEnd]
  );

  const monthlyMetrics = metrics.filter((m) =>
    isWithinInterval(m.date, { start: monthStart, end: monthEnd })
  );

  const chartData = weeks.map((week, index) => {
    const weekEnd = addDays(week, 6);

    const weekMetrics = monthlyMetrics.filter((m) =>
      isWithinInterval(m.date, { start: week, end: weekEnd })
    );

    const avgMetric = (field: keyof HealthMetric) => {
      const values = weekMetrics
        .map((m) => m[field])
        .filter((v): v is number => typeof v === "number");
      if (values.length === 0) return null;
      const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
      return field === "sleep"
        ? Number(avg.toFixed(1))
        : field === "weight"
        ? Number(avg.toFixed(1))
        : avg;
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
    const firstWeekEnd = addDays(monthStart, 6);
    const lastWeekStart = subDays(monthEnd, 6);

    const firstWeek = monthlyMetrics.filter((m) =>
      isWithinInterval(m.date, { start: monthStart, end: firstWeekEnd })
    );
    const lastWeek = monthlyMetrics.filter((m) =>
      isWithinInterval(m.date, { start: lastWeekStart, end: monthEnd })
    );

    const average = (list: HealthMetric[]) => {
      if (list.length === 0) return null;
      const values = list
        .map((m) => m[field])
        .filter((v): v is number => typeof v === "number");
      if (values.length === 0) return null;
      const avg = values.reduce((sum, value) => sum + value, 0) / values.length;
      return field === "sleep"
        ? Number(avg.toFixed(1))
        : field === "weight"
        ? Number(avg.toFixed(1))
        : avg;
    };

    const firstAvg = average(firstWeek);
    const lastAvg = average(lastWeek);

    if (firstAvg == null || lastAvg == null) return null;
    return lastAvg - firstAvg;
  };

  const monthlyStats = {
    avgWeight: (() => {
      const entries = chartData.filter((d) => d.weight != null);
      if (entries.length === 0) return null;
      return (
        entries.reduce((sum, d) => sum + (d.weight || 0), 0) / entries.length
      );
    })(),
    weightChange: calculateChange("weight"),
    avgBP: (() => {
      const entries = chartData.filter((d) => d.bloodPressure != null);
      if (entries.length === 0) return null;
      return (
        entries.reduce((sum, d) => sum + (d.bloodPressure || 0), 0) /
        entries.length
      );
    })(),
    avgSleep: (() => {
      const entries = chartData.filter((d) => d.sleep != null);
      if (entries.length === 0) return null;
      return (
        entries.reduce((sum, d) => sum + (d.sleep || 0), 0) / entries.length
      );
    })(),
    totalEntries: monthlyMetrics.length,
  };

  const hasData = monthlyMetrics.length > 0;

  return (
    <AuroraBackground className="min-h-screen">
      <header className="border-b bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div className="p-2 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 rounded-xl shadow-lg shadow-purple-500/30">
                <Calendar className="h-6 w-6 text-white drop-shadow" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Monthly Dashboard</h1>
                <p className="text-xs text-muted-foreground">
                  {format(referenceDate, "MMMM yyyy")}
                </p>
              </div>
            </div>
            <div className="hidden items-center gap-2 md:flex">
              <MetricForm userId={userId} onMetricAdded={fetchMetrics} />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="mb-6 flex md:hidden">
          <MetricForm userId={userId} onMetricAdded={fetchMetrics} />
        </div>

        <div className="space-y-6">
          {/* Monthly Summary Cards */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="bg-white/70 shadow-lg shadow-blue-500/10 backdrop-blur dark:bg-gray-950/70">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Avg Weight
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {monthlyStats.avgWeight != null
                      ? `${formatMetricNumber(monthlyStats.avgWeight)} lbs`
                      : "—"}
                  </div>
                  <div
                    className={`mt-1 flex items-center gap-1 text-xs ${
                      (monthlyStats.weightChange ?? 0) < 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {(monthlyStats.weightChange ?? 0) < 0 ? (
                      <TrendingDown className="h-3 w-3" />
                    ) : (
                      <TrendingUp className="h-3 w-3" />
                    )}
                    {monthlyStats.weightChange != null
                      ? `${Math.abs(monthlyStats.weightChange).toFixed(
                          1
                        )} lbs this month`
                      : "No change yet"}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="bg-white/70 shadow-lg shadow-blue-500/10 backdrop-blur dark:bg-gray-950/70">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Avg Blood Pressure
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {monthlyStats.avgBP != null
                      ? `${formatMetricNumber(monthlyStats.avgBP, {
                          maximumFractionDigits: 0,
                        })} mmHg`
                      : "—"}
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
              <Card className="bg-white/70 shadow-lg shadow-blue-500/10 backdrop-blur dark:bg-gray-950/70">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Avg Sleep
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {monthlyStats.avgSleep != null
                      ? `${formatMetricNumber(monthlyStats.avgSleep)} hrs`
                      : "—"}
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
              <Card className="bg-white/70 shadow-lg shadow-blue-500/10 backdrop-blur dark:bg-gray-950/70">
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

          {!hasData && !isLoading ? (
            <Card className="border-dashed border-blue-200/60 bg-white/70 p-12 text-center shadow-xl shadow-blue-500/10 backdrop-blur dark:border-blue-500/20 dark:bg-gray-950/60">
              <CardContent className="flex flex-col items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg shadow-purple-500/30">
                  <Calendar className="h-7 w-7" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold">
                    No monthly insights yet
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Log your health data to visualize how your habits trend over
                    longer periods.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : null}

          {hasData && (
            <>
              {/* Charts */}
              <Card className="bg-white/80 shadow-xl shadow-blue-500/10 backdrop-blur dark:bg-gray-950/70">
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

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <Card className="bg-white/80 shadow-xl shadow-red-500/10 backdrop-blur dark:bg-gray-950/70">
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

                <Card className="bg-white/80 shadow-xl shadow-purple-500/10 backdrop-blur dark:bg-gray-950/70">
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
            </>
          )}
        </div>
      </main>
    </AuroraBackground>
  );
}
