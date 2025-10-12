"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  Bell,
  Sparkles,
  Calendar,
  TrendingUp,
  Plug,
} from "lucide-react";
import StatsOverview from "@/components/StatsOverview";
import TrendsChart from "@/components/TrendsChart";
import AlertsPanel from "@/components/AlertsPanel";
import RecommendationsPanel from "@/components/RecommendationsPanel";
import MetricForm from "@/components/MetricForm";
import OnboardingFlow from "@/components/OnboardingFlow";
import GoalsProgress from "@/components/GoalsProgress";
import DailyReminderCard from "@/components/DailyReminderCard";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  useAuth,
  UserButton,
  SignedIn,
  SignedOut,
  SignInButton,
} from "@clerk/nextjs";
import { getMetrics, getProfile, getGoals } from "@/lib/storage";
import { detectAnomalies, generateRecommendations } from "@/lib/analytics";
import { HealthMetric, Alert, Goal, Recommendation } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import AuroraBackground from "@/components/AuroraBackground";
import { formatDate, formatTime } from "@/lib/utils";

const LOCAL_USER_ID = "demo-user";

function Dashboard() {
  const { userId: clerkUserId } = useAuth();
  const isFirebaseEnabled = process.env.NEXT_PUBLIC_FIREBASE_ENABLED === "true";
  const userId = isFirebaseEnabled ? clerkUserId : LOCAL_USER_ID;
  const [metrics, setMetrics] = useState<HealthMetric[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [goals, setGoals] = useState<Goal[]>([]);

  const onboardingFlagKey = userId
    ? `healthtrackr_onboarded_${userId}`
    : undefined;

  const hasCompletedOnboarding = useCallback(() => {
    if (!onboardingFlagKey || typeof window === "undefined") return false;
    return window.localStorage.getItem(onboardingFlagKey) === "true";
  }, [onboardingFlagKey]);

  const markOnboardingComplete = useCallback(() => {
    if (!onboardingFlagKey || typeof window === "undefined") return;
    window.localStorage.setItem(onboardingFlagKey, "true");
  }, [onboardingFlagKey]);

  const urgentAlerts = useMemo(
    () =>
      alerts.filter(
        (alert) => alert.type === "critical" || alert.type === "warning"
      ),
    [alerts]
  );

  const urgentBadgeClass = (type: Alert["type"]): string => {
    switch (type) {
      case "critical":
        return "bg-red-500";
      case "warning":
        return "bg-amber-500";
      default:
        return "bg-blue-500";
    }
  };

  const loadData = useCallback(async () => {
    if (!userId) return;
    setIsLoaded(false);
    const [data, activeGoals] = await Promise.all([
      getMetrics(userId),
      getGoals(userId),
    ]);

    setMetrics(data);
    setGoals(activeGoals);

    const detectedAlerts = data.length > 0 ? detectAnomalies(data) : [];
    setAlerts(detectedAlerts);
    const recs =
      data.length > 0 ? generateRecommendations(data, detectedAlerts) : [];
    setRecommendations(recs);
    setIsLoaded(true);
  }, [userId]);

  useEffect(() => {
    if (!userId) return;

    const init = async () => {
      const profile = await getProfile(userId);
      const completedLocally = hasCompletedOnboarding();

      if (!profile && !completedLocally) {
        setShowOnboarding(true);
        setIsLoaded(true);
        return;
      }

      if (completedLocally && !profile) {
        setShowOnboarding(false);
      }

      await loadData();
    };
    init();
  }, [userId, loadData, hasCompletedOnboarding]);

  const handleMetricAdded = () => {
    loadData();
  };

  const handleOnboardingComplete = () => {
    markOnboardingComplete();
    setShowOnboarding(false);
    loadData();
  };

  const handleDismissAlert = (id: string) => {
    setAlerts(alerts.filter((alert) => alert.id !== id));
  };

  return (
    <AuroraBackground className="min-h-screen">
      <div className="min-h-screen">
        {showOnboarding ? (
          <OnboardingFlow onComplete={handleOnboardingComplete} />
        ) : (
          <>
            {/* Header */}
            <header className="border-b bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl sticky top-0 z-50">
              <div className="container mx-auto px-4 py-4">
                <div className="flex items-center justify-between">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-3"
                  >
                    <div className="p-2 bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-500 rounded-xl shadow-lg shadow-purple-500/30">
                      <Activity className="h-6 w-6 text-white drop-shadow-sm" />
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-violet-500 to-purple-600 bg-clip-text text-transparent">
                        HealthTrackr
                      </h1>
                      <p className="text-xs text-muted-foreground">
                        Intelligent insights for your everyday wellness
                      </p>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-2"
                  >
                    <Link href="/weekly">
                      <Button variant="outline" size="sm" className="gap-2">
                        <Calendar className="h-4 w-4" />
                        Weekly
                      </Button>
                    </Link>
                    <Link href="/monthly">
                      <Button variant="outline" size="sm" className="gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Monthly
                      </Button>
                    </Link>
                    <Link href="/connect">
                      <Button variant="outline" size="sm" className="gap-2">
                        <Plug className="h-4 w-4" />
                        Connections
                      </Button>
                    </Link>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="relative"
                        >
                          <Bell className="h-5 w-5" />
                          {urgentAlerts.length > 0 && (
                            <span className="absolute top-1 right-1 inline-flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
                              {urgentAlerts.length}
                            </span>
                          )}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="w-80 p-0"
                        sideOffset={12}
                      >
                        <DropdownMenuLabel className="px-4 py-3 text-base">
                          Urgent alerts
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <div className="max-h-72 overflow-y-auto">
                          {urgentAlerts.length === 0 ? (
                            <div className="px-4 py-6 text-sm text-muted-foreground">
                              All clear. Critical metrics are within safe
                              ranges.
                            </div>
                          ) : (
                            urgentAlerts.map((alert) => (
                              <div
                                key={alert.id}
                                className="flex items-start gap-3 px-4 py-3 transition hover:bg-accent/40"
                              >
                                <span
                                  className={`mt-1 h-2.5 w-2.5 flex-none rounded-full ${urgentBadgeClass(
                                    alert.type
                                  )}`}
                                />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-semibold leading-tight line-clamp-1">
                                    {alert.metric}
                                  </p>
                                  <p className="text-xs text-muted-foreground leading-snug line-clamp-2">
                                    {alert.message}
                                  </p>
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                  <span className="text-[10px] font-medium text-muted-foreground">
                                    {formatTime(alert.date)}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => handleDismissAlert(alert.id)}
                                    className="text-[11px] font-semibold text-primary/80 hover:text-primary"
                                  >
                                    Dismiss
                                  </button>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                        <DropdownMenuSeparator />
                        <div className="px-4 py-2">
                          <Link
                            href="#alerts-panel"
                            className="text-xs font-semibold text-primary hover:underline"
                          >
                            View full alerts center
                          </Link>
                        </div>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <ThemeToggle />
                    <UserButton afterSignOutUrl="/" />
                  </motion.div>
                </div>
              </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-12">
              {isLoaded ? (
                <div className="space-y-10">
                  <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="grid gap-6 rounded-3xl border bg-white/70 p-8 shadow-xl shadow-blue-500/5 backdrop-blur dark:bg-gray-950/70"
                  >
                    <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                      <div className="max-w-2xl space-y-4">
                        <div className="inline-flex items-center gap-2 rounded-full bg-blue-100/80 px-4 py-1 text-xs font-medium text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">
                          <Sparkles className="h-3 w-3" /> Personalized wellness
                          command center
                        </div>
                        <h2 className="text-4xl font-semibold tracking-tight text-gray-900 dark:text-white md:text-5xl">
                          Welcome back, let’s elevate your health today
                        </h2>
                        <p className="text-base text-muted-foreground md:text-lg">
                          Monitor trends, stay ahead of anomalies, and unlock
                          curated recommendations crafted around your latest
                          metrics.
                        </p>
                        {metrics[0]?.date && (
                          <p className="text-sm text-muted-foreground">
                            Last entry logged on {formatDate(metrics[0].date)}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col gap-3 md:items-end">
                        <MetricForm
                          userId={userId}
                          onMetricAdded={handleMetricAdded}
                        />
                        <p className="text-xs text-muted-foreground max-w-xs md:text-right">
                          Logging daily keeps insights sharp. Add the latest
                          vitals in seconds.
                        </p>
                      </div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                      {[
                        "Health scoring",
                        "Realtime anomaly detection",
                        "Goal tracking",
                        "Predictive insights",
                      ].map((feature) => (
                        <div
                          key={feature}
                          className="rounded-2xl border border-white/60 bg-gradient-to-br from-white/80 to-transparent px-4 py-3 text-sm font-medium text-slate-600 shadow-sm backdrop-blur dark:border-white/5 dark:from-white/5 dark:text-slate-200"
                        >
                          {feature}
                        </div>
                      ))}
                    </div>
                  </motion.section>

                  {metrics.length === 0 ? (
                    <>
                      <EmptyDashboardState
                        userId={userId}
                        onCreateMetric={handleMetricAdded}
                      />
                      <DailyReminderCard />
                    </>
                  ) : (
                    <>
                      <GoalsProgress goals={goals} metrics={metrics} />
                      <StatsOverview metrics={metrics} />
                      <TrendsChart metrics={metrics} />
                      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.1fr_0.9fr]">
                        <div id="alerts-panel" className="space-y-6">
                          <AlertsPanel
                            alerts={alerts}
                            onDismiss={handleDismissAlert}
                          />
                        </div>
                        <div className="space-y-6">
                          <RecommendationsPanel
                            recommendations={recommendations}
                          />
                          <DailyReminderCard />
                        </div>
                      </div>
                    </>
                  )}
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
                <p>
                  HealthTrackr - Built with Next.js, shadcn/ui, and Framer
                  Motion
                </p>
                <p className="mt-2">
                  © 2025 HealthTrackr. For demonstration purposes only. Consult
                  healthcare professionals for medical advice.
                </p>
              </div>
            </footer>
          </>
        )}
      </div>
    </AuroraBackground>
  );
}

export default function Home() {
  return (
    <>
      <SignedIn>
        <Dashboard />
      </SignedIn>
      <SignedOut>
        <SignedOutLanding />
      </SignedOut>
    </>
  );
}

function EmptyDashboardState({
  userId,
  onCreateMetric,
}: {
  userId?: string | null;
  onCreateMetric: () => void;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="grid gap-6 rounded-3xl border border-dashed border-blue-200/70 bg-white/70 p-10 text-center shadow-lg shadow-blue-500/5 backdrop-blur dark:border-blue-500/20 dark:bg-gray-950/60"
    >
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/40">
        <Sparkles className="h-8 w-8" />
      </div>
      <div className="space-y-3">
        <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Let’s capture your first health metrics
        </h3>
        <p className="max-w-xl mx-auto text-base text-muted-foreground">
          Your dashboard updates live as soon as you log metrics. Add an entry
          to unlock analytics, goal tracking, and personalized insights tailored
          to you.
        </p>
      </div>
      <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
        <MetricForm userId={userId} onMetricAdded={onCreateMetric} />
        <div className="rounded-2xl border border-white/60 bg-white/80 px-6 py-5 text-left shadow-md shadow-blue-500/10 backdrop-blur dark:border-white/10 dark:bg-white/5">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-100">
            Why log metrics?
          </p>
          <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
            <li>• Detects anomalies before they escalate</li>
            <li>• Keeps goals aligned with your trends</li>
            <li>• Powers tailored recommendations every day</li>
          </ul>
        </div>
      </div>
    </motion.section>
  );
}

function SignedOutLanding() {
  return (
    <AuroraBackground className="min-h-screen">
      <div className="relative flex min-h-screen items-center justify-center px-6 py-16">
        <div className="mx-auto grid max-w-6xl gap-16 lg:grid-cols-[1.1fr_0.9fr]">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="space-y-10"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/70 px-4 py-1 text-xs font-medium uppercase tracking-wide text-slate-600 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
              <Sparkles className="h-3 w-3" /> Health intelligence for humans
            </div>
            <div className="space-y-6">
              <h1 className="text-4xl font-semibold leading-tight text-gray-900 md:text-5xl lg:text-6xl dark:text-white">
                Own your health data with real-time insights and predictive
                coaching.
              </h1>
              <p className="max-w-2xl text-lg text-slate-600 dark:text-slate-300">
                HealthTrackr visualizes your vitals, surfaces early warnings,
                and guides you with actionable recommendations. Designed for
                modern lifestyles with privacy-first architecture.
              </p>
            </div>
            <div className="flex flex-col gap-4 sm:flex-row">
              <SignInButton mode="modal">
                <Button size="lg" className="h-12 px-8 text-base font-semibold">
                  Launch your dashboard
                </Button>
              </SignInButton>
              <Button
                size="lg"
                variant="outline"
                className="h-12 border-white/50 bg-white/70 px-8 text-base backdrop-blur dark:border-white/10 dark:bg-white/5"
              >
                Explore features
              </Button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                {
                  title: "Anomaly detection",
                  description:
                    "AI-assisted monitoring catches out-of-range vitals instantly.",
                },
                {
                  title: "Habit intelligence",
                  description:
                    "Weekly and monthly analytics reveal patterns you can act on.",
                },
                {
                  title: "Personal goals",
                  description:
                    "Set targets and watch progress with celebratory milestones.",
                },
                {
                  title: "Privacy ready",
                  description:
                    "Your data stays encrypted with secure sync to the cloud.",
                },
              ].map((feature) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="rounded-2xl border border-white/50 bg-white/60 p-5 shadow-lg shadow-blue-500/10 backdrop-blur dark:border-white/10 dark:bg-white/5"
                >
                  <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-100">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85 }}
            className="relative"
          >
            <div className="relative rounded-3xl border border-white/60 bg-white/70 p-6 shadow-2xl shadow-blue-500/20 backdrop-blur dark:border-white/5 dark:bg-white/10">
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 p-3 text-white shadow-lg shadow-purple-500/40">
                    <Activity className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-widest text-blue-500">
                      Live preview
                    </p>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Dynamic health snapshot
                    </h3>
                  </div>
                </div>
                <div className="grid gap-4">
                  {[
                    "Adaptive charts",
                    "Mood-aware recommendations",
                    "Goal celebrations",
                  ].map((item) => (
                    <div
                      key={item}
                      className="flex items-center gap-3 rounded-2xl border border-white/60 bg-white/80 p-4 text-sm font-medium text-slate-600 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
                    >
                      <span className="h-2.5 w-2.5 rounded-full bg-gradient-to-br from-violet-500 to-blue-500" />
                      {item}
                    </div>
                  ))}
                </div>
                <div className="rounded-2xl border border-dashed border-slate-200/80 bg-slate-50/80 p-5 text-sm text-slate-600 shadow-inner dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
                  &ldquo;The dashboard has transformed the way I monitor my
                  wellness. The insights are uncanny.&rdquo; &mdash; Beta tester
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </AuroraBackground>
  );
}
