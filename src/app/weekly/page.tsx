"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Activity, ArrowLeft, Calendar } from "lucide-react";
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
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isWithinInterval,
  addWeeks,
  subWeeks,
} from "date-fns";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import AuroraBackground from "@/components/AuroraBackground";
import { formatMetricNumber } from "@/lib/utils";
import MetricForm from "@/components/MetricForm";

export default function WeeklyDashboard() {
  const { userId: clerkUserId } = useAuth();
  const isFirebaseEnabled = process.env.NEXT_PUBLIC_FIREBASE_ENABLED === "true";
  const userId = isFirebaseEnabled ? clerkUserId : "demo-user";
  const [metrics, setMetrics] = useState<HealthMetric[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date()));

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

  useEffect(() => {
    setWeekStart(startOfWeek(new Date()));
  }, []);

  const weekEnd = endOfWeek(weekStart);
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const weeklyMetrics = metrics.filter((m) =>
    isWithinInterval(m.date, { start: weekStart, end: weekEnd })
  );

  const chartData = weekDays.map((day) => {
    const dayMetrics = weeklyMetrics.filter(
      (m) => format(m.date, "yyyy-MM-dd") === format(day, "yyyy-MM-dd")
    );

    const avgMetric = (field: keyof HealthMetric) => {
      const values = dayMetrics
        .map((m) => m[field])
        .filter((v): v is number => typeof v === "number");
      if (values.length === 0) return null;
      const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
      return field === "sleep" ? Number(avg.toFixed(1)) : avg;
    };

    return {
      day: format(day, "EEE"),
      date: format(day, "MMM dd"),
      steps: avgMetric("steps"),
      sleep: avgMetric("sleep"),
      weight: avgMetric("weight"),
      heartRate: avgMetric("heartRate"),
    };
  });

  const weeklyStats = {
    totalSteps: chartData.reduce((sum, d) => sum + (d.steps || 0), 0),
    avgSleep: (() => {
      const entries = chartData.filter((d) => d.sleep != null);
      if (entries.length === 0) return null;
      return (
        entries.reduce((sum, d) => sum + (d.sleep || 0), 0) / entries.length
      );
    })(),
    avgHeartRate: (() => {
      const entries = chartData.filter((d) => d.heartRate != null);
      if (entries.length === 0) return null;
      return (
        entries.reduce((sum, d) => sum + (d.heartRate || 0), 0) / entries.length
      );
    })(),
    entriesLogged: weeklyMetrics.length,
  };

  const hasData = weeklyMetrics.length > 0;

  const changeWeek = (direction: "back" | "forward") => {
    setWeekStart((prev) =>
      direction === "back"
        ? startOfWeek(subWeeks(prev, 1))
        : startOfWeek(addWeeks(prev, 1))
    );
  };

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
                <h1 className="text-2xl font-bold">Weekly Dashboard</h1>
                <p className="text-xs text-muted-foreground">
                  {format(weekStart, "MMM dd")} -{" "}
                  {format(weekEnd, "MMM dd, yyyy")}
                </p>
              </div>
            </div>
            <div className="hidden items-center gap-2 md:flex">
              <Button
                variant="outline"
                size="sm"
                onClick={() => changeWeek("back")}
                className="border-white/60 bg-white/70 backdrop-blur dark:border-white/10 dark:bg-white/5"
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => changeWeek("forward")}
                className="border-white/60 bg-white/70 backdrop-blur dark:border-white/10 dark:bg-white/5"
              >
                Next
              </Button>
              <MetricForm userId={userId} onMetricAdded={fetchMetrics} />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="mb-6 flex flex-col gap-4 md:hidden">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => changeWeek("back")}
              className="border-white/60 bg-white/80 backdrop-blur dark:border-white/10 dark:bg-white/5"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => changeWeek("forward")}
              className="border-white/60 bg-white/80 backdrop-blur dark:border-white/10 dark:bg-white/5"
            >
              Next
            </Button>
            <MetricForm userId={userId} onMetricAdded={fetchMetrics} />
          </div>
        </div>

        <div className="space-y-6">
          {/* Weekly Summary Cards */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="bg-white/70 shadow-lg shadow-blue-500/10 backdrop-blur dark:bg-gray-950/70">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Steps
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatMetricNumber(weeklyStats.totalSteps)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    This week
                  </p>
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
                    Avg Sleep
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {weeklyStats.avgSleep != null
                      ? `${formatMetricNumber(weeklyStats.avgSleep)} hrs`
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
              transition={{ delay: 0.2 }}
            >
              <Card className="bg-white/70 shadow-lg shadow-blue-500/10 backdrop-blur dark:bg-gray-950/70">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Avg Heart Rate
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {weeklyStats.avgHeartRate != null
                      ? `${formatMetricNumber(weeklyStats.avgHeartRate, {
                          maximumFractionDigits: 0,
                        })} bpm`
                      : "—"}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Resting</p>
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
                    Entries Logged
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {weeklyStats.entriesLogged}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    This week
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {!hasData && !isLoading ? (
            <Card className="border-dashed border-blue-200/60 bg-white/70 p-12 text-center shadow-xl shadow-blue-500/10 backdrop-blur dark:border-blue-500/20 dark:bg-gray-950/60">
              <CardContent className="flex flex-col items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg shadow-purple-500/30">
                  <Activity className="h-7 w-7" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold">
                    No entries yet this week
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Log your daily metrics to unlock weekly analytics, charts,
                    and insights.
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
                  <CardTitle>Daily Steps</CardTitle>
                  <CardDescription>
                    Your step count for each day this week
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip />
                      <Bar
                        dataKey="steps"
                        fill="#3b82f6"
                        radius={[8, 8, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="bg-white/80 shadow-xl shadow-purple-500/10 backdrop-blur dark:bg-gray-950/70">
                <CardHeader>
                  <CardTitle>Sleep &amp; Heart Rate Trends</CardTitle>
                  <CardDescription>Track your recovery metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip />
                      <Legend />
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="sleep"
                        stroke="#8b5cf6"
                        strokeWidth={2}
                        name="Sleep (hrs)"
                      />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="heartRate"
                        stroke="#ec4899"
                        strokeWidth={2}
                        name="Heart Rate (bpm)"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </main>
    </AuroraBackground>
  );
}
