"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  ArrowLeft,
  CheckCircle2,
  CloudDownload,
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
  summarizeGoogleFitData,
} from "@/lib/googleFit";
import { saveMetric } from "@/lib/storage";
import { formatDate } from "@/lib/utils";
import { HealthMetric } from "@/lib/types";

export default function ConnectionsPage() {
  const { isSignedIn } = useUser();
  const { userId: clerkUserId } = useAuth();
  const isFirebaseEnabled = process.env.NEXT_PUBLIC_FIREBASE_ENABLED === "true";
  const userId = isFirebaseEnabled ? clerkUserId : "demo-user";

  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [importedCount, setImportedCount] = useState(0);
  const [previewData, setPreviewData] = useState<HealthMetric[]>([]);

  const previewSummary = useMemo(
    () =>
      summarizeGoogleFitData(
        previewData.map((metric) => {
          const { id, userId, ...rest } = metric;
          void id;
          void userId;
          return rest;
        })
      ),
    [previewData]
  );

  const handleConnect = async () => {
    if (!userId) return;
    setError(null);
    setIsConnecting(true);
    try {
      const data = await fetchGoogleFitSampleData();
      setPreviewData(
        data.map((metric, idx) => ({
          ...metric,
          id: `preview-${idx}`,
          userId,
        }))
      );
      setIsConnected(true);
    } catch (err) {
      console.error(err);
      setError("We couldn't reach Google Fit right now. Try again shortly.");
    } finally {
      setIsConnecting(false);
    }
  };

  const handleImport = async () => {
    if (!userId) return;
    setError(null);
    setIsImporting(true);
    try {
      const payload = await fetchGoogleFitSampleData();
      let imported = 0;
      for (const metric of payload) {
        await saveMetric(userId, {
          ...metric,
          source: "google-fit",
        });
        imported += 1;
      }
      setImportedCount(imported);
    } catch (err) {
      console.error(err);
      setError("Import failed. Please try again.");
    } finally {
      setIsImporting(false);
    }
  };

  const resetConnection = () => {
    setIsConnected(false);
    setPreviewData([]);
    setImportedCount(0);
  };

  const showAuthWarning = !isSignedIn && isFirebaseEnabled;

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
          <Card className="bg-white/80 shadow-xl shadow-blue-500/10 backdrop-blur dark:bg-gray-950/70">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Plug className="h-5 w-5 text-blue-500" /> Google Fit
              </CardTitle>
              <CardDescription>
                Securely connect your Google Fit account and import the latest
                wellness trends.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="rounded-2xl border border-dashed border-blue-200/60 bg-blue-50/70 p-5 text-sm text-blue-700 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-200">
                We provide a sandboxed Google Fit connection that imports
                high-quality dummy data so you can explore the insight flows
                without external credentials.
              </div>

              {showAuthWarning ? (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-700">
                  Sign in to your account to unlock Google Fit syncing.
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <Button
                      disabled={isConnecting || isConnected || !userId}
                      onClick={handleConnect}
                      className="gap-2"
                    >
                      {isConnecting ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <CloudDownload className="h-4 w-4" />
                      )}
                      {isConnected ? "Connected" : "Connect Google Fit"}
                    </Button>
                    {isConnected && (
                      <Button
                        variant="secondary"
                        className="gap-2"
                        onClick={handleImport}
                        disabled={isImporting}
                      >
                        {isImporting ? (
                          <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                          <CheckCircle2 className="h-4 w-4" />
                        )}
                        {isImporting ? "Syncing data" : "Import latest data"}
                      </Button>
                    )}
                    {isConnected && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={resetConnection}
                      >
                        Reset
                      </Button>
                    )}
                  </div>

                  {error ? (
                    <p className="text-sm text-red-500">{error}</p>
                  ) : null}

                  {importedCount > 0 && (
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-700">
                      Successfully imported {importedCount} Google Fit entries.
                      Check your dashboard for new insights.
                    </div>
                  )}
                </div>
              )}

              {isConnected && previewData.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    Upcoming import preview
                  </h3>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <StatPill
                      label="Total steps"
                      value={previewSummary.totalSteps.toLocaleString()}
                    />
                    <StatPill
                      label="Avg sleep"
                      value={`${previewSummary.avgSleep.toFixed(1)} hrs`}
                    />
                    <StatPill
                      label="Avg weight"
                      value={`${previewSummary.avgWeight.toFixed(1)} lbs`}
                    />
                  </div>
                  <div className="rounded-2xl border border-white/60 bg-white/80 p-4 text-sm shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5">
                    <p className="font-semibold text-muted-foreground mb-2">
                      Recent entries
                    </p>
                    <ul className="space-y-2">
                      {previewData.map((metric) => (
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
                </div>
              )}
            </CardContent>
          </Card>

          <aside className="space-y-6">
            <Card className="bg-white/70 shadow-lg shadow-blue-500/10 backdrop-blur dark:bg-gray-950/70">
              <CardHeader>
                <CardTitle className="text-base">What gets imported?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p>
                  We mirror Google Fit summaries for the past 7 days including:
                </p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Total steps and active minutes</li>
                  <li>Sleep duration and average resting heart rate</li>
                  <li>Weight and blood pressure check-ins</li>
                  <li>Estimated calories and workout notes</li>
                </ul>
                <p className="rounded-xl border border-purple-200 bg-purple-50 p-3 text-purple-700 dark:border-purple-500/20 dark:bg-purple-500/10 dark:text-purple-200">
                  Imported metrics automatically unlock anomaly detection and
                  recommendations across your dashboards.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/70 shadow-lg shadow-blue-500/10 backdrop-blur dark:bg-gray-950/70">
              <CardHeader>
                <CardTitle className="text-base">Next steps</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p>Once data is synced you can:</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>
                    Return to the{" "}
                    <Link href="/weekly" className="text-primary underline">
                      Weekly dashboard
                    </Link>{" "}
                    for momentum trends.
                  </li>
                  <li>
                    Visit the{" "}
                    <Link href="/monthly" className="text-primary underline">
                      Monthly view
                    </Link>{" "}
                    to analyse progress.
                  </li>
                  <li>Set goals that align with your imported baseline.</li>
                </ul>
              </CardContent>
            </Card>
          </aside>
        </motion.section>
      </main>
    </AuroraBackground>
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
