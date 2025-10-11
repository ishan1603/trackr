"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BellRing, Send } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const REMINDER_TIME_KEY = "healthtrackr_daily_reminder_time";

function isBrowser() {
  return typeof window !== "undefined";
}

export default function DailyReminderCard() {
  const [permission, setPermission] = useState<NotificationPermission>(
    isBrowser() ? Notification.permission : "default"
  );
  const [reminderTime, setReminderTime] = useState<string>(() => {
    if (!isBrowser()) return "09:00";
    return localStorage.getItem(REMINDER_TIME_KEY) || "09:00";
  });
  const [status, setStatus] = useState<string>("");
  const scheduledTimeout = useRef<number | null>(null);

  useEffect(() => {
    if (!isBrowser()) return;
    localStorage.setItem(REMINDER_TIME_KEY, reminderTime);
    if (permission === "granted") {
      scheduleNextReminder();
    }
    return cancelScheduledReminder;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reminderTime, permission]);

  useEffect(() => {
    if (!isBrowser()) return;
    setPermission(Notification.permission);
  }, []);

  const cancelScheduledReminder = useCallback(() => {
    if (scheduledTimeout.current) {
      window.clearTimeout(scheduledTimeout.current);
      scheduledTimeout.current = null;
    }
  }, []);

  const ensureServiceWorker = useCallback(async () => {
    if (!isBrowser()) return undefined;
    if (!("serviceWorker" in navigator)) return undefined;
    try {
      const existing = await navigator.serviceWorker.getRegistration(
        "/notification-sw.js"
      );
      if (existing) return existing;
      return await navigator.serviceWorker.register("/notification-sw.js");
    } catch (err) {
      console.error("Service worker registration failed", err);
      return undefined;
    }
  }, []);

  const sendNotification = useCallback(
    async (title: string, body: string) => {
      if (!isBrowser()) return;
      if (!("Notification" in window)) {
        setStatus("Notifications are not supported in this browser.");
        return;
      }
      if (Notification.permission !== "granted") {
        setStatus("Enable notifications to receive reminders.");
        return;
      }
      const registration = await ensureServiceWorker();
      if (registration && registration.showNotification) {
        registration.showNotification(title, {
          body,
          icon: "/globe.svg",
          tag: "healthtrackr-daily-reminder",
          data: { url: "/" },
        });
      } else {
        new Notification(title, { body });
      }
      setStatus("Reminder sent");
    },
    [ensureServiceWorker]
  );

  const scheduleNextReminder = useCallback(async () => {
    if (!isBrowser()) return;
    cancelScheduledReminder();
    if (!("Notification" in window) || Notification.permission !== "granted") {
      return;
    }
    const [hour, minute] = reminderTime.split(":").map(Number);
    const now = new Date();
    const next = new Date();
    next.setHours(hour, minute, 0, 0);
    if (next.getTime() <= now.getTime()) {
      next.setDate(next.getDate() + 1);
    }
    const timeout = next.getTime() - now.getTime();
    scheduledTimeout.current = window.setTimeout(async () => {
      await sendNotification(
        "Time to log your health metrics",
        "Keep your streak alive with a quick update."
      );
      scheduleNextReminder();
    }, timeout);
    setStatus(
      `Next reminder scheduled for ${next.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}`
    );
  }, [cancelScheduledReminder, reminderTime, sendNotification]);

  const handleEnable = useCallback(async () => {
    if (!isBrowser()) return;
    if (!("Notification" in window)) {
      setStatus("Notifications are not supported in this browser.");
      return;
    }
    if (Notification.permission === "granted") {
      await ensureServiceWorker();
      scheduleNextReminder();
      setPermission("granted");
      return;
    }
    const result = await Notification.requestPermission();
    setPermission(result);
    if (result === "granted") {
      await ensureServiceWorker();
      scheduleNextReminder();
      setStatus("Daily reminders enabled.");
    } else {
      setStatus("We can't send reminders without notification permission.");
    }
  }, [ensureServiceWorker, scheduleNextReminder]);

  const handleSendNow = useCallback(async () => {
    await sendNotification(
      "Daily reminder",
      "Here’s your nudge to log today’s metrics."
    );
  }, [sendNotification]);

  const permissionDescription = useMemo(() => {
    switch (permission) {
      case "granted":
        return "Notifications are enabled.";
      case "denied":
        return "Notifications are blocked. Enable them from your browser settings.";
      default:
        return "Enable notifications to receive nudges at your chosen time.";
    }
  }, [permission]);

  return (
    <Card className="bg-white/70 shadow-lg shadow-blue-500/10 backdrop-blur dark:bg-gray-950/70">
      <CardHeader className="space-y-2">
        <div className="inline-flex items-center gap-2 rounded-full bg-blue-100/80 px-3 py-1 text-xs font-medium text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">
          <BellRing className="h-3.5 w-3.5" /> Daily reminders
        </div>
        <CardTitle className="text-xl">
          Stay consistent with gentle nudges
        </CardTitle>
        <CardDescription>{permissionDescription}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-600 dark:text-slate-200">
            Reminder time
          </label>
          <input
            type="time"
            value={reminderTime}
            onChange={(event) => setReminderTime(event.target.value)}
            className={cn(
              "w-full max-w-[220px] rounded-xl border border-white/60 bg-white/90 px-4 py-2 text-sm shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-white/10 dark:bg-white/5",
              permission !== "granted" && "opacity-60"
            )}
            disabled={permission !== "granted"}
          />
        </div>
        <div className="flex flex-wrap gap-3">
          <Button onClick={handleEnable} className="gap-2">
            <BellRing className="h-4 w-4" />
            {permission === "granted"
              ? "Reschedule reminder"
              : "Enable reminders"}
          </Button>
          <Button
            variant="secondary"
            onClick={handleSendNow}
            disabled={permission !== "granted"}
            className="gap-2"
          >
            <Send className="h-4 w-4" /> Send reminder now
          </Button>
        </div>
        {status && <p className="text-xs text-muted-foreground">{status}</p>}
      </CardContent>
    </Card>
  );
}
