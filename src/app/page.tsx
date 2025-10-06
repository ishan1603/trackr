"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Activity, Bell, Settings, Sparkles } from "lucide-react";
import StatsOverview from "@/components/StatsOverview";
import TrendsChart from "@/components/TrendsChart";
import AlertsPanel from "@/components/AlertsPanel";
import RecommendationsPanel from "@/components/RecommendationsPanel";
import MetricForm from "@/components/MetricForm";
import { getMetrics, generateSampleData, saveMetric } from "@/lib/storage";
import { detectAnomalies, generateRecommendations } from "@/lib/analytics";
import { HealthMetric, Alert } from "@/lib/types";
import { Button } from "@/components/ui/button";

export default function Home() {
  const [metrics, setMetrics] = useState<HealthMetric[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    let data = getMetrics();

    // If no data exists, generate sample data for demo
    if (data.length === 0) {
      const sampleData = generateSampleData();
      sampleData.forEach((metric) => saveMetric(metric));
      data = getMetrics();
    }

    setMetrics(data);
    const detectedAlerts = detectAnomalies(data);
    setAlerts(detectedAlerts);
    const recs = generateRecommendations(data, detectedAlerts);
    setRecommendations(recs);
    setIsLoaded(true);
  };

  const handleMetricAdded = () => {
    loadData();
  };

  const handleDismissAlert = (id: string) => {
    setAlerts(alerts.filter((alert) => alert.id !== id));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      {/* Header */}
      <header className="border-b bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3"
            >
              <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
                <Activity className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  HealthTrackr
                </h1>
                <p className="text-xs text-muted-foreground">
                  Your Personal Health Dashboard
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2"
            >
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {alerts.length > 0 && (
                  <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full" />
                )}
              </Button>
              <Button variant="ghost" size="icon">
                <Settings className="h-5 w-5" />
              </Button>
            </motion.div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {isLoaded ? (
          <div className="space-y-8">
            {/* Hero Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
            >
              <div>
                <h2 className="text-3xl font-bold mb-2">Welcome Back!</h2>
                <p className="text-muted-foreground flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  Track your health journey with intelligent insights
                </p>
              </div>
              <MetricForm onMetricAdded={handleMetricAdded} />
            </motion.div>

            {/* Stats Overview */}
            <StatsOverview metrics={metrics} />

            {/* Charts */}
            <TrendsChart metrics={metrics} />

            {/* Alerts and Recommendations */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AlertsPanel alerts={alerts} onDismiss={handleDismissAlert} />
              <RecommendationsPanel recommendations={recommendations} />
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
              <p className="mt-4 text-muted-foreground">
                Loading your health data...
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t mt-16 py-8 bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>HealthTrackr - Built with Next.js, shadcn/ui, and Framer Motion</p>
          <p className="mt-2">
            © 2025 HealthTrackr. For demonstration purposes only. Consult
            healthcare professionals for medical advice.
          </p>
        </div>
      </footer>
    </div>
  );
}
