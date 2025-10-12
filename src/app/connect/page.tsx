"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  ArrowLeft,
  CheckCircle2,
  CloudDownload,
  FileDown,
  Plug,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import AuroraBackground from "@/components/AuroraBackground";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth, useUser } from "@clerk/nextjs";
import {
  fetchGoogleFitSampleData,
  fetchFitbitSampleData,
  fetchAppleHealthSampleData,
  summarizeWearableData,
  type WearableMetricPayload,
  type WearableProvider,
  type WearableSummary,
  wearableMetricsToCsv,
  WEARABLE_PROVIDER_LABELS,
} from "@/lib/googleFit";
import { saveMetric } from "@/lib/storage";
import { formatDate } from "@/lib/utils";
import { HealthMetric } from "@/lib/types";

interface IntegrationConfig {
  id: WearableProvider;
  name: string;
  description: string;
  highlight: string;
  highlightClass: string;
  iconClass: string;
  fetch: () => Promise<WearableMetricPayload[]>;
  infoBullets: string[];
}

const INTEGRATIONS: IntegrationConfig[] = [
  {
    id: "google-fit",
    name: "Google Fit",
    description:
      "Securely connect your Google Fit account and import the latest wellness trends.",
    highlight:
      "We provide a sandboxed Google Fit connection that imports realistic dummy data so you can explore every insight without external credentials.",
    highlightClass:
      "border-blue-200/60 bg-blue-50/70 text-blue-700 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-200",
    iconClass: "text-blue-500",
    fetch: fetchGoogleFitSampleData,
    infoBullets: [
      "Total steps and active minutes",
      "Sleep duration and resting heart rate",
      "Weight and blood pressure check-ins",
      "Estimated calories and workout notes",
    ],
  },
  {
    id: "fitbit",
    name: "Fitbit",
    description:
      "Sync Fitbit activity, cardio fitness, and recovery signals into your dashboard.",
    highlight:
      "Our Fitbit sandbox mirrors multi-device data—perfect for demoing stacked metrics like zone minutes, cardio score, and weight trends.",
    highlightClass:
      "border-emerald-200/60 bg-emerald-50/70 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200",
    iconClass: "text-emerald-500",
    fetch: fetchFitbitSampleData,
    infoBullets: [
      "Zone minutes and cardio readiness",
      "Daily step streaks with workout details",
      "Heart rate variability snapshots",
      "Weight, calories burned, and hydration cues",
    ],
  },
  {
    id: "apple-health",
    name: "Apple Health",
    description:
      "Import Apple Health summaries to blend mindful habits with movement insights.",
    highlight:
      "The Apple Health sandbox highlights mindful minutes, sleep consistency, and cardio balance to showcase holistic wellness tracking.",
    highlightClass:
      "border-rose-200/60 bg-rose-50/70 text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-200",
    iconClass: "text-rose-500",
    fetch: fetchAppleHealthSampleData,
    infoBullets: [
      "Mindful minutes and sleep regularity",
      "Heart rate trends and blood pressure baselines",
      "Cycling, swimming, and strength workouts",
      "Nutrition and calorie balance cues",
    ],
  },
];

const INTEGRATION_LOOKUP: Record<WearableProvider, IntegrationConfig> =
  INTEGRATIONS.reduce((acc, integration) => {
    acc[integration.id] = integration;
    return acc;
  }, {} as Record<WearableProvider, IntegrationConfig>);

type ProviderState = {
  isConnecting: boolean;
  isConnected: boolean;
  isImporting: boolean;
  error: string | null;
  importedCount: number;
  preview: HealthMetric[];
};

type IntegrationStateMap = Record<WearableProvider, ProviderState>;

function createProviderState(): ProviderState {
  return {
    isConnecting: false,
    isConnected: false,
    isImporting: false,
    error: null,
    importedCount: 0,
    preview: [],
  };
}

function createInitialState(): IntegrationStateMap {
  return INTEGRATIONS.reduce((acc, integration) => {
    acc[integration.id] = createProviderState();
    return acc;
  }, {} as IntegrationStateMap);
}

function toWearablePayload(metric: HealthMetric): WearableMetricPayload {
  const { id, userId, ...rest } = metric;
  void id;
  void userId;
  return rest;
}

export default function ConnectionsPage() {
  const { isSignedIn } = useUser();
  const { userId: clerkUserId } = useAuth();
  const isFirebaseEnabled = process.env.NEXT_PUBLIC_FIREBASE_ENABLED === "true";
  const userId = isFirebaseEnabled ? clerkUserId : "demo-user";

  const [integrationState, setIntegrationState] = useState<IntegrationStateMap>(
    () => createInitialState()
  );

  const showAuthWarning = !isSignedIn && isFirebaseEnabled;

  const updateProviderState = useCallback(
    (provider: WearableProvider, patch: Partial<ProviderState>) => {
      setIntegrationState((prev) => ({
        ...prev,
        [provider]: { ...prev[provider], ...patch },
      }));
    },
    []
  );

  const handleConnect = useCallback(
    async (provider: WearableProvider) => {
      if (!userId) return;
      const config = INTEGRATION_LOOKUP[provider];
      updateProviderState(provider, {
        isConnecting: true,
        error: null,
        importedCount: 0,
      });

      try {
        const data = await config.fetch();
        const preview = data.map((metric, idx) => ({
          ...metric,
          id: `${provider}-preview-${idx}`,
          userId,
        }));
        setIntegrationState((prev) => ({
          ...prev,
          [provider]: {
            ...prev[provider],
            isConnecting: false,
            isConnected: true,
            preview,
          },
        }));
      } catch (err) {
        console.error(err);
        updateProviderState(provider, {
          isConnecting: false,
          error: `We couldn't reach ${config.name} right now. Try again shortly.`,
        });
      }
    },
    [userId, updateProviderState]
  );

  const handleImport = useCallback(
    async (provider: WearableProvider) => {
      if (!userId) return;
      const config = INTEGRATION_LOOKUP[provider];
      updateProviderState(provider, {
        isImporting: true,
        error: null,
      });

      try {
        const payload = await config.fetch();
        let imported = 0;
        for (const metric of payload) {
          await saveMetric(userId, {
            ...metric,
            source: provider,
          });
          imported += 1;
        }

        const preview = payload.map((metric, idx) => ({
          ...metric,
          id: `${provider}-preview-${idx}`,
          userId,
        }));

        setIntegrationState((prev) => ({
          ...prev,
          [provider]: {
            ...prev[provider],
            isImporting: false,
            isConnected: true,
            importedCount: imported,
            preview,
          },
        }));
      } catch (err) {
        console.error(err);
        updateProviderState(provider, {
          isImporting: false,
          error: "Import failed. Please try again.",
        });
      }
    },
    [userId, updateProviderState]
  );

  const resetConnection = useCallback((provider: WearableProvider) => {
    setIntegrationState((prev) => ({
      ...prev,
      [provider]: createProviderState(),
    }));
  }, []);

  const handleExport = useCallback(
    (provider: WearableProvider) => {
      const state = integrationState[provider];
      if (!state || state.preview.length === 0) {
        return;
      }

      const payload = state.preview.map((metric) => toWearablePayload(metric));
      const csv = wearableMetricsToCsv(payload);
      const label = WEARABLE_PROVIDER_LABELS[provider] ?? provider;
      const timestamp = new Date().toISOString().split("T")[0];
      const filename = `${provider}-export-${timestamp}.csv`;
      const blob = new Blob([csv], {
        type: "text/csv;charset=utf-8;",
      });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      console.info("[wearables] CSV export", {
        provider,
        label,
        filename,
        rows: state.preview.length,
      });
    },
    [integrationState]
  );

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
              <div className="p-2 bg-gradient-to-br from-green-500 via-blue-500 to-purple-600 rounded-xl shadow-lg shadow-purple-500/30">
                <Plug className="h-6 w-6 text-white drop-shadow" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Connections</h1>
                <p className="text-xs text-muted-foreground">
                  Sync wearable and app data to supercharge your insights
                </p>
              </div>
            </div>
            <Link href="/">
              <Button className="gap-2" variant="outline">
                <Activity className="h-4 w-4" /> Back to dashboard
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]"
        >
          <div className="space-y-6">
            {INTEGRATIONS.map((integration) => {
              const state = integrationState[integration.id];
              const summary = summarizeWearableData(
                state.preview.map(toWearablePayload)
              );

              return (
                <IntegrationCard
                  key={integration.id}
                  config={integration}
                  state={state}
                  summary={summary}
                  showAuthWarning={showAuthWarning}
                  hasUserId={Boolean(userId)}
                  onConnect={() => handleConnect(integration.id)}
                  onImport={() => handleImport(integration.id)}
                  onReset={() => resetConnection(integration.id)}
                  onExport={() => handleExport(integration.id)}
                />
              );
            })}
          </div>

          <aside className="space-y-6">
            <Card className="bg-white/70 shadow-lg shadow-blue-500/10 backdrop-blur dark:bg-gray-950/70">
              <CardHeader>
                <CardTitle className="text-base">What gets imported?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p>
                  Every integration syncs a seven-day snapshot of movement,
                  recovery, and vitals so you can experience anomaly detection
                  and recommendations end to end.
                </p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Steps, active minutes, and calories burned</li>
                  <li>Sleep duration, quality, and heart rate trends</li>
                  <li>Weight, blood pressure, and cardio fitness signals</li>
                  <li>Workout notes plus mindful or recovery sessions</li>
                </ul>
                <p className="rounded-xl border border-purple-200 bg-purple-50 p-3 text-purple-700 dark:border-purple-500/20 dark:bg-purple-500/10 dark:text-purple-200">
                  All datasets are sandboxed—safe for demos while remaining rich
                  enough to light up dashboards and alerts.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/70 shadow-lg shadow-blue-500/10 backdrop-blur dark:bg-gray-950/70">
              <CardHeader>
                <CardTitle className="text-base">Next steps</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p>After importing data you can:</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>
                    Explore the{" "}
                    <Link href="/weekly" className="text-primary underline">
                      Weekly dashboard
                    </Link>{" "}
                    to see fresh momentum charts.
                  </li>
                  <li>
                    Review long-term progress in the{" "}
                    <Link href="/monthly" className="text-primary underline">
                      Monthly view
                    </Link>{" "}
                    and spot trend shifts.
                  </li>
                  <li>Set or update goals based on the imported baselines.</li>
                  <li>
                    Email yourself a snapshot using the weekly report sender.
                  </li>
                </ul>
              </CardContent>
            </Card>
          </aside>
        </motion.section>
      </main>
    </AuroraBackground>
  );
}

interface IntegrationCardProps {
  config: IntegrationConfig;
  state: ProviderState;
  summary: WearableSummary;
  showAuthWarning: boolean;
  hasUserId: boolean;
  onConnect: () => void;
  onImport: () => void;
  onReset: () => void;
  onExport: () => void;
}

function IntegrationCard({
  config,
  state,
  summary,
  showAuthWarning,
  hasUserId,
  onConnect,
  onImport,
  onReset,
  onExport,
}: IntegrationCardProps) {
  const disableConnect = state.isConnecting || state.isConnected || !hasUserId;
  const disableImport = state.isImporting || !state.isConnected;

  return (
    <Card className="bg-white/80 shadow-xl shadow-blue-500/10 backdrop-blur dark:bg-gray-950/70">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Plug className={`h-5 w-5 ${config.iconClass}`} /> {config.name}
        </CardTitle>
        <CardDescription>{config.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div
          className={`rounded-2xl border border-dashed p-5 text-sm ${config.highlightClass}`}
        >
          {config.highlight}
        </div>

        {showAuthWarning ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-200">
            Sign in to your account to unlock {config.name} syncing.
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <Button
                disabled={disableConnect}
                onClick={onConnect}
                className="gap-2"
              >
                {state.isConnecting ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <CloudDownload className="h-4 w-4" />
                )}
                {state.isConnected ? `Connected` : `Connect ${config.name}`}
              </Button>
              {state.isConnected && (
                <Button
                  variant="secondary"
                  className="gap-2"
                  onClick={onImport}
                  disabled={disableImport}
                >
                  {state.isImporting ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4" />
                  )}
                  {state.isImporting ? "Syncing data" : "Import latest data"}
                </Button>
              )}
              {state.isConnected && (
                <Button variant="ghost" size="sm" onClick={onReset}>
                  Reset
                </Button>
              )}
              <Button
                variant="outline"
                className="gap-2"
                onClick={onExport}
                disabled={state.preview.length === 0}
              >
                <FileDown className="h-4 w-4" /> Download CSV
              </Button>
            </div>

            {state.error ? (
              <p className="text-sm text-red-500">{state.error}</p>
            ) : null}

            {state.importedCount > 0 && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200">
                Successfully imported {state.importedCount} {config.name}{" "}
                entries. Check your dashboard for new insights.
              </div>
            )}
          </div>
        )}

        {state.preview.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Upcoming import preview
            </h3>
            <div className="grid gap-3 sm:grid-cols-3">
              <StatPill
                label="Total steps"
                value={summary.totalSteps.toLocaleString()}
              />
              <StatPill
                label="Avg sleep"
                value={`${summary.avgSleep.toFixed(1)} hrs`}
              />
              <StatPill
                label="Avg weight"
                value={`${summary.avgWeight.toFixed(1)} lbs`}
              />
            </div>
            <div className="rounded-2xl border border-white/60 bg-white/80 p-4 text-sm shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5">
              <p className="mb-2 font-semibold text-muted-foreground">
                Recent entries
              </p>
              <ul className="space-y-2">
                {state.preview.map((metric) => (
                  <li
                    key={metric.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/60 bg-white/70 px-3 py-2 text-xs font-medium shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5"
                  >
                    <span className="text-muted-foreground">
                      {formatDate(metric.date)}
                    </span>
                    <span className="text-slate-600 dark:text-slate-200">
                      {metric.steps?.toLocaleString()} steps •{" "}
                      {metric.sleep ?? "—"} hrs sleep
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p className="font-semibold">What we pull</p>
              <ul className="list-disc space-y-1 pl-5">
                {config.infoBullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/60 bg-white/80 px-4 py-3 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="text-lg font-semibold text-slate-700 dark:text-slate-100">
        {value}
      </p>
    </div>
  );
}
