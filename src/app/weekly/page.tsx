"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Activity, ArrowLeft, Calendar, TrendingUp } from "lucide-react";
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

export default function WeeklyDashboard() {
  const { userId } = useAuth();
  const [metrics, setMetrics] = useState<HealthMetric[]>([]);
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date()));

  useEffect(() => {
    if (!userId) return;
    const loadData = async () => {
      const data = await getMetrics(userId);
      setMetrics(data);
    };
    loadData();
  }, [userId]);

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
      return values.length > 0
        ? values.reduce((sum, val) => sum + val, 0) / values.length
        : null;
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
    avgSleep:
      chartData
        .filter((d) => d.sleep)
        .reduce((sum, d) => sum + (d.sleep || 0), 0) /
        chartData.filter((d) => d.sleep).length || 0,
    avgHeartRate:
      chartData
        .filter((d) => d.heartRate)
        .reduce((sum, d) => sum + (d.heartRate || 0), 0) /
        chartData.filter((d) => d.heartRate).length || 0,
    entriesLogged: weeklyMetrics.length,
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
                <h1 className="text-2xl font-bold">Weekly Dashboard</h1>
                <p className="text-xs text-muted-foreground">
                  {format(weekStart, "MMM dd")} -{" "}
                  {format(weekEnd, "MMM dd, yyyy")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Weekly Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Steps
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {weeklyStats.totalSteps.toLocaleString()}
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
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Avg Sleep
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {weeklyStats.avgSleep.toFixed(1)} hrs
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
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Avg Heart Rate
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {weeklyStats.avgHeartRate.toFixed(0)} bpm
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
              <Card>
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

          {/* Charts */}
          <Card>
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
                  <Bar dataKey="steps" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sleep & Heart Rate Trends</CardTitle>
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
        </div>
      </main>
    </div>
  );
}
