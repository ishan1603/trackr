"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { User, UserProfile, Goal, MetricType } from "@/lib/types";
import { saveProfile, saveUser, saveGoal } from "@/lib/storage";
import { ArrowRight, ArrowLeft, Check } from "lucide-react";

interface OnboardingProps {
  onComplete: () => void;
}

const availableMetrics: {
  value: MetricType;
  label: string;
  description: string;
}[] = [
  {
    value: "bloodPressure",
    label: "Blood Pressure",
    description: "Monitor your BP levels",
  },
  {
    value: "heartRate",
    label: "Heart Rate",
    description: "Track your heart health",
  },
  { value: "weight", label: "Weight", description: "Monitor weight changes" },
  {
    value: "bloodSugar",
    label: "Blood Sugar",
    description: "Track glucose levels",
  },
  { value: "sleep", label: "Sleep", description: "Log sleep duration" },
  { value: "steps", label: "Steps", description: "Daily step counter" },
  {
    value: "waterIntake",
    label: "Water Intake",
    description: "Hydration tracking",
  },
  { value: "exercise", label: "Exercise", description: "Workout duration" },
  { value: "calories", label: "Calories", description: "Calorie tracking" },
  { value: "mood", label: "Mood", description: "Emotional wellbeing" },
];

export default function OnboardingFlow({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    age: "",
    gender: "other" as "male" | "female" | "other",
    height: "",
    currentWeight: "",
    targetWeight: "",
    activityLevel: "moderate" as
      | "sedentary"
      | "light"
      | "moderate"
      | "active"
      | "very-active",
    medicalConditions: "",
    selectedMetrics: [
      "bloodPressure",
      "heartRate",
      "weight",
      "sleep",
      "steps",
    ] as MetricType[],
    goals: {
      weight: { enabled: false, target: "" },
      steps: { enabled: false, target: "" },
      sleep: { enabled: false, target: "" },
      exercise: { enabled: false, target: "" },
      water: { enabled: false, target: "" },
    },
  });

  const totalSteps = 4;

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleComplete = () => {
    // Save user data
    const user: User = {
      id: `user-${Date.now()}`,
      name: formData.name,
      email: formData.email,
      age: parseInt(formData.age),
      gender: formData.gender,
      height: parseFloat(formData.height),
      currentWeight: parseFloat(formData.currentWeight),
      onboardingCompleted: true,
      createdAt: new Date(),
      activeMetrics: formData.selectedMetrics,
    };
    saveUser(user);

    // Save profile
    const profile: UserProfile = {
      userId: user.id,
      height: parseFloat(formData.height),
      currentWeight: parseFloat(formData.currentWeight),
      targetWeight: formData.targetWeight
        ? parseFloat(formData.targetWeight)
        : undefined,
      age: parseInt(formData.age),
      gender: formData.gender,
      activityLevel: formData.activityLevel,
      medicalConditions: formData.medicalConditions
        ? [formData.medicalConditions]
        : undefined,
    };
    saveProfile(profile);

    // Save goals
    Object.entries(formData.goals).forEach(([type, goalData]) => {
      if (goalData.enabled && goalData.target) {
        saveGoal({
          userId: user.id,
          type: type as any,
          targetValue: parseFloat(goalData.target),
          currentValue:
            type === "weight" ? parseFloat(formData.currentWeight) : 0,
          status: "active",
        });
      }
    });

    onComplete();
  };

  const toggleMetric = (metric: MetricType) => {
    setFormData((prev) => ({
      ...prev,
      selectedMetrics: prev.selectedMetrics.includes(metric)
        ? prev.selectedMetrics.filter((m) => m !== metric)
        : [...prev.selectedMetrics, metric],
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl"
      >
        <Card className="border-2">
          <CardHeader>
            <div className="flex items-center justify-between mb-4">
              <div>
                <CardTitle className="text-2xl">
                  Welcome to HealthTrackr! 🎉
                </CardTitle>
                <CardDescription className="mt-2">
                  Let's personalize your health journey
                </CardDescription>
              </div>
              <div className="text-sm text-muted-foreground">
                Step {step} of {totalSteps}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-secondary rounded-full h-2">
              <motion.div
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${(step / totalSteps) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </CardHeader>

          <CardContent className="pt-6">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <h3 className="font-semibold text-lg mb-4">
                    Basic Information
                  </h3>

                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="John Doe"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      placeholder="john@example.com"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="age">Age *</Label>
                      <Input
                        id="age"
                        type="number"
                        value={formData.age}
                        onChange={(e) =>
                          setFormData({ ...formData, age: e.target.value })
                        }
                        placeholder="30"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="gender">Gender</Label>
                      <select
                        id="gender"
                        value={formData.gender}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            gender: e.target.value as any,
                          })
                        }
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      >
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <h3 className="font-semibold text-lg mb-4">Health Profile</h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="height">Height (cm) *</Label>
                      <Input
                        id="height"
                        type="number"
                        value={formData.height}
                        onChange={(e) =>
                          setFormData({ ...formData, height: e.target.value })
                        }
                        placeholder="170"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="currentWeight">
                        Current Weight (lbs) *
                      </Label>
                      <Input
                        id="currentWeight"
                        type="number"
                        value={formData.currentWeight}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            currentWeight: e.target.value,
                          })
                        }
                        placeholder="150"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="targetWeight">Target Weight (lbs)</Label>
                    <Input
                      id="targetWeight"
                      type="number"
                      value={formData.targetWeight}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          targetWeight: e.target.value,
                        })
                      }
                      placeholder="145"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="activityLevel">Activity Level</Label>
                    <select
                      id="activityLevel"
                      value={formData.activityLevel}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          activityLevel: e.target.value as any,
                        })
                      }
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      <option value="sedentary">
                        Sedentary (little to no exercise)
                      </option>
                      <option value="light">Light (1-3 days/week)</option>
                      <option value="moderate">Moderate (3-5 days/week)</option>
                      <option value="active">Active (6-7 days/week)</option>
                      <option value="very-active">
                        Very Active (intense daily)
                      </option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="medicalConditions">
                      Medical Conditions (Optional)
                    </Label>
                    <Textarea
                      id="medicalConditions"
                      value={formData.medicalConditions}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          medicalConditions: e.target.value,
                        })
                      }
                      placeholder="List any medical conditions or medications..."
                      rows={3}
                    />
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <h3 className="font-semibold text-lg mb-2">
                    Choose Your Metrics
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Select the health metrics you want to track
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {availableMetrics.map((metric) => (
                      <div
                        key={metric.value}
                        onClick={() => toggleMetric(metric.value)}
                        className={`flex items-start space-x-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                          formData.selectedMetrics.includes(metric.value)
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <Checkbox
                          checked={formData.selectedMetrics.includes(
                            metric.value
                          )}
                          onCheckedChange={() => toggleMetric(metric.value)}
                        />
                        <div className="flex-1">
                          <div className="font-medium text-sm">
                            {metric.label}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {metric.description}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {step === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <h3 className="font-semibold text-lg mb-2">
                    Set Your Goals 🎯
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Define your health targets (optional but recommended)
                  </p>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-lg border">
                      <div className="flex items-center space-x-3 flex-1">
                        <Checkbox
                          checked={formData.goals.weight.enabled}
                          onCheckedChange={(checked) =>
                            setFormData({
                              ...formData,
                              goals: {
                                ...formData.goals,
                                weight: {
                                  ...formData.goals.weight,
                                  enabled: !!checked,
                                },
                              },
                            })
                          }
                        />
                        <div className="flex-1">
                          <Label>Weight Goal (lbs)</Label>
                          <Input
                            type="number"
                            placeholder="145"
                            value={formData.goals.weight.target}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                goals: {
                                  ...formData.goals,
                                  weight: {
                                    ...formData.goals.weight,
                                    target: e.target.value,
                                  },
                                },
                              })
                            }
                            disabled={!formData.goals.weight.enabled}
                            className="mt-2"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-lg border">
                      <div className="flex items-center space-x-3 flex-1">
                        <Checkbox
                          checked={formData.goals.steps.enabled}
                          onCheckedChange={(checked) =>
                            setFormData({
                              ...formData,
                              goals: {
                                ...formData.goals,
                                steps: {
                                  ...formData.goals.steps,
                                  enabled: !!checked,
                                },
                              },
                            })
                          }
                        />
                        <div className="flex-1">
                          <Label>Daily Steps Goal</Label>
                          <Input
                            type="number"
                            placeholder="10000"
                            value={formData.goals.steps.target}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                goals: {
                                  ...formData.goals,
                                  steps: {
                                    ...formData.goals.steps,
                                    target: e.target.value,
                                  },
                                },
                              })
                            }
                            disabled={!formData.goals.steps.enabled}
                            className="mt-2"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-lg border">
                      <div className="flex items-center space-x-3 flex-1">
                        <Checkbox
                          checked={formData.goals.sleep.enabled}
                          onCheckedChange={(checked) =>
                            setFormData({
                              ...formData,
                              goals: {
                                ...formData.goals,
                                sleep: {
                                  ...formData.goals.sleep,
                                  enabled: !!checked,
                                },
                              },
                            })
                          }
                        />
                        <div className="flex-1">
                          <Label>Sleep Goal (hours)</Label>
                          <Input
                            type="number"
                            placeholder="8"
                            step="0.5"
                            value={formData.goals.sleep.target}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                goals: {
                                  ...formData.goals,
                                  sleep: {
                                    ...formData.goals.sleep,
                                    target: e.target.value,
                                  },
                                },
                              })
                            }
                            disabled={!formData.goals.sleep.enabled}
                            className="mt-2"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-lg border">
                      <div className="flex items-center space-x-3 flex-1">
                        <Checkbox
                          checked={formData.goals.exercise.enabled}
                          onCheckedChange={(checked) =>
                            setFormData({
                              ...formData,
                              goals: {
                                ...formData.goals,
                                exercise: {
                                  ...formData.goals.exercise,
                                  enabled: !!checked,
                                },
                              },
                            })
                          }
                        />
                        <div className="flex-1">
                          <Label>Exercise Goal (min/day)</Label>
                          <Input
                            type="number"
                            placeholder="30"
                            value={formData.goals.exercise.target}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                goals: {
                                  ...formData.goals,
                                  exercise: {
                                    ...formData.goals.exercise,
                                    target: e.target.value,
                                  },
                                },
                              })
                            }
                            disabled={!formData.goals.exercise.enabled}
                            className="mt-2"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-lg border">
                      <div className="flex items-center space-x-3 flex-1">
                        <Checkbox
                          checked={formData.goals.water.enabled}
                          onCheckedChange={(checked) =>
                            setFormData({
                              ...formData,
                              goals: {
                                ...formData.goals,
                                water: {
                                  ...formData.goals.water,
                                  enabled: !!checked,
                                },
                              },
                            })
                          }
                        />
                        <div className="flex-1">
                          <Label>Water Goal (glasses/day)</Label>
                          <Input
                            type="number"
                            placeholder="8"
                            value={formData.goals.water.target}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                goals: {
                                  ...formData.goals,
                                  water: {
                                    ...formData.goals.water,
                                    target: e.target.value,
                                  },
                                },
                              })
                            }
                            disabled={!formData.goals.water.enabled}
                            className="mt-2"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex justify-between mt-8 pt-6 border-t">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={step === 1}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>

              <Button
                onClick={handleNext}
                disabled={
                  (step === 1 &&
                    (!formData.name || !formData.email || !formData.age)) ||
                  (step === 2 &&
                    (!formData.height || !formData.currentWeight)) ||
                  (step === 3 && formData.selectedMetrics.length === 0)
                }
              >
                {step === totalSteps ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Complete
                  </>
                ) : (
                  <>
                    Next
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
