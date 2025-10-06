"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Activity,
  Heart,
  Weight,
  Droplet,
  Moon,
  TrendingUp,
} from "lucide-react";
import { HealthMetric } from "@/lib/types";

interface StatsOverviewProps {
  metrics: HealthMetric[];
}

export default function StatsOverview({ metrics }: StatsOverviewProps) {
  const latestMetric = metrics[0];

  const stats = [
    {
      title: "Blood Pressure",
      value:
        latestMetric?.bloodPressureSystolic &&
        latestMetric?.bloodPressureDiastolic
          ? `${latestMetric.bloodPressureSystolic}/${latestMetric.bloodPressureDiastolic}`
          : "N/A",
      unit: "mmHg",
      icon: Activity,
      color: "text-red-500",
      bgColor: "bg-red-50 dark:bg-red-950/20",
    },
    {
      title: "Heart Rate",
      value: latestMetric?.heartRate || "N/A",
      unit: "bpm",
      icon: Heart,
      color: "text-pink-500",
      bgColor: "bg-pink-50 dark:bg-pink-950/20",
    },
    {
      title: "Weight",
      value: latestMetric?.weight || "N/A",
      unit: "lbs",
      icon: Weight,
      color: "text-blue-500",
      bgColor: "bg-blue-50 dark:bg-blue-950/20",
    },
    {
      title: "Blood Sugar",
      value: latestMetric?.bloodSugar || "N/A",
      unit: "mg/dL",
      icon: Droplet,
      color: "text-orange-500",
      bgColor: "bg-orange-50 dark:bg-orange-950/20",
    },
    {
      title: "Sleep",
      value: latestMetric?.sleep || "N/A",
      unit: "hrs",
      icon: Moon,
      color: "text-purple-500",
      bgColor: "bg-purple-50 dark:bg-purple-950/20",
    },
    {
      title: "Steps",
      value: latestMetric?.steps ? latestMetric.steps.toLocaleString() : "N/A",
      unit: "steps",
      icon: TrendingUp,
      color: "text-green-500",
      bgColor: "bg-green-50 dark:bg-green-950/20",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring" as const,
        stiffness: 100,
      },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
    >
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <motion.div key={stat.title} variants={itemVariants}>
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-full ${stat.bgColor}`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stat.value}
                  {stat.value !== "N/A" && (
                    <span className="text-sm font-normal text-muted-foreground ml-2">
                      {stat.unit}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
