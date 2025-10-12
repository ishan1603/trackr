"use client";

import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Goal, HealthMetric } from "@/lib/types";
import { formatMetricNumber } from "@/lib/utils";
import { Target, TrendingUp, Award, Zap } from "lucide-react";

interface GoalsProgressProps {
  goals: Goal[];
  metrics: HealthMetric[];
}

const encouragingMessages = {
  0: "🚀 Just getting started! You've got this!",
  25: "💪 Great start! Keep pushing forward!",
  50: "🎯 Halfway there! You're doing amazing!",
  75: "🔥 Almost there! Don't give up now!",
  90: "⭐ So close! Final push!",
  100: "🎉 Goal achieved! Congratulations!",
};

function getEncouragingMessage(progress: number): string {
  if (progress >= 100) return encouragingMessages[100];
  if (progress >= 90) return encouragingMessages[90];
  if (progress >= 75) return encouragingMessages[75];
  if (progress >= 50) return encouragingMessages[50];
  if (progress >= 25) return encouragingMessages[25];
  return encouragingMessages[0];
}

export default function GoalsProgress({ goals, metrics }: GoalsProgressProps) {
  const activeGoals = goals.filter((g) => g.status === "active");

  if (activeGoals.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Goals 🎯</CardTitle>
          <CardDescription>No active goals set</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Set goals in your profile to track your progress here!
          </p>
        </CardContent>
      </Card>
    );
  }

  const calculateProgress = (goal: Goal): number => {
    if (goal.type === "weight") {
      const latestMetric = metrics[0];
      if (!latestMetric?.weight) return 0;

      const startWeight = goal.currentValue;
      const currentWeight = latestMetric.weight;
      const targetWeight = goal.targetValue;

      if (startWeight === targetWeight) return 100;

      const totalChange = Math.abs(targetWeight - startWeight);
      const currentChange = Math.abs(startWeight - currentWeight);

      return Math.min(100, Math.max(0, (currentChange / totalChange) * 100));
    }

    // For other goals, compare current to target
    const percentage = (goal.currentValue / goal.targetValue) * 100;
    return Math.min(100, Math.max(0, percentage));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Your Goals Progress
          </CardTitle>
          <CardDescription>Track your journey to better health</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {activeGoals.map((goal, index) => {
            const progress = calculateProgress(goal);
            const message = getEncouragingMessage(progress);

            return (
              <motion.div
                key={goal.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {progress >= 100 ? (
                      <Award className="h-4 w-4 text-green-500" />
                    ) : progress >= 50 ? (
                      <TrendingUp className="h-4 w-4 text-blue-500" />
                    ) : (
                      <Zap className="h-4 w-4 text-orange-500" />
                    )}
                    <span className="font-medium capitalize">
                      {goal.type === "bloodPressure"
                        ? "Blood Pressure"
                        : goal.type}
                    </span>
                  </div>
                  <span className="text-sm font-semibold">
                    {progress.toFixed(0)}%
                  </span>
                </div>

                <Progress value={progress} className="h-3" />

                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    Current: {formatMetricNumber(goal.currentValue)} → Target:{" "}
                    {formatMetricNumber(goal.targetValue)}
                  </span>
                  <span className="text-xs font-medium text-primary">
                    {message.split(" ")[0]}
                  </span>
                </div>

                <p className="text-xs text-muted-foreground italic">
                  {message}
                </p>
              </motion.div>
            );
          })}

          {activeGoals.every((g) => calculateProgress(g) >= 100) && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20 rounded-lg border-2 border-green-200 dark:border-green-800"
            >
              <div className="flex items-center gap-3">
                <Award className="h-8 w-8 text-green-600 dark:text-green-400" />
                <div>
                  <h4 className="font-semibold text-green-900 dark:text-green-100">
                    All Goals Achieved! 🎉
                  </h4>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    Incredible work! Ready to set new goals?
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
