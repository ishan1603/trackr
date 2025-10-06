"use client";

import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Recommendation } from "@/lib/types";
import { Lightbulb, TrendingUp, Heart, Award } from "lucide-react";

interface RecommendationsPanelProps {
  recommendations: Recommendation[];
}

export default function RecommendationsPanel({
  recommendations,
}: RecommendationsPanelProps) {
  const getPriorityColor = (priority: Recommendation["priority"]) => {
    switch (priority) {
      case "high":
        return "border-l-red-500";
      case "medium":
        return "border-l-yellow-500";
      case "low":
        return "border-l-green-500";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case "sleep":
        return <Lightbulb className="h-5 w-5 text-purple-500" />;
      case "activity":
        return <TrendingUp className="h-5 w-5 text-green-500" />;
      case "wellness":
        return <Heart className="h-5 w-5 text-pink-500" />;
      default:
        return <Award className="h-5 w-5 text-blue-500" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
    >
      <Card>
        <CardHeader>
          <CardTitle>Recommendations</CardTitle>
          <CardDescription>
            Personalized health insights for you
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {recommendations.map((rec, index) => (
            <motion.div
              key={rec.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              className={`border-l-4 ${getPriorityColor(
                rec.priority
              )} rounded-lg p-4 bg-muted/50`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5">{getCategoryIcon(rec.category)}</div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        {rec.category}
                      </span>
                      <h4 className="font-semibold text-sm mt-1">
                        {rec.title}
                      </h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {rec.description}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </CardContent>
      </Card>
    </motion.div>
  );
}
