"use client";

import { cn } from "@/lib/utils";
import { PropsWithChildren } from "react";

interface AuroraBackgroundProps {
  className?: string;
  overlayClassName?: string;
}

export default function AuroraBackground({
  className,
  overlayClassName,
  children,
}: PropsWithChildren<AuroraBackgroundProps>) {
  return (
    <div className={cn("relative isolate overflow-hidden", className)}>
      <div
        className={cn(
          "pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_#4f46e533,_transparent_55%),_radial-gradient(circle_at_bottom,_#06b6d433,_transparent_55%)]",
          "dark:bg-[radial-gradient(circle_at_top,_#6366f15a,_transparent_60%),_radial-gradient(circle_at_bottom,_#0ea5e95a,_transparent_60%)]",
          overlayClassName
        )}
      />
      <div className="absolute -top-32 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-purple-300/40 blur-3xl dark:bg-purple-500/20" />
      <div className="absolute top-1/2 -left-24 h-56 w-56 -translate-y-1/2 rounded-full bg-cyan-300/30 blur-3xl dark:bg-cyan-400/10" />
      <div className="absolute bottom-0 right-0 h-72 w-72 translate-x-1/4 translate-y-1/4 rounded-full bg-pink-300/30 blur-3xl dark:bg-pink-500/10" />
      <div className="relative">{children}</div>
    </div>
  );
}
