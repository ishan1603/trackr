import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

interface SendReportPayload {
  to?: string;
  summary?: string;
  recommendations?: Array<{
    id: string;
    title: string;
    description: string;
    priority: string;
    category?: string;
  }>;
  anomalies?: Array<{
    id: string;
    metric: string;
    message: string;
    type: string;
    date: string;
  }>;
  range?: {
    start?: string;
    end?: string;
  };
}

type Transporter = ReturnType<typeof nodemailer.createTransport>;

let cachedTransporter: Transporter | null = null;

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function getTransporter(): Transporter {
  if (cachedTransporter) return cachedTransporter;
  const user = process.env.GMAIL_SMTP_USER;
  const pass = process.env.GMAIL_SMTP_PASS;

  if (!user || !pass) {
    throw new Error(
      "Missing Gmail SMTP credentials. Set GMAIL_SMTP_USER and GMAIL_SMTP_PASS."
    );
  }

  cachedTransporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user,
      pass,
    },
  });
  return cachedTransporter;
}

function buildHtmlBody(payload: SendReportPayload) {
  const summaryLines = (payload.summary || "")
    .split("\n")
    .filter(Boolean)
    .map((line) => `<li>${escapeHtml(line)}</li>`)
    .join("");

  const recommendationItems = (payload.recommendations || [])
    .map((rec) => {
      const priority = rec.priority ? rec.priority.toUpperCase() : "";
      const category = rec.category ? ` · ${rec.category}` : "";
      return `<li><strong>${escapeHtml(
        rec.title
      )}</strong><br/><small>${escapeHtml(
        `${priority}${category}`
      )}</small><br/>${escapeHtml(rec.description)}</li>`;
    })
    .join("");

  const anomalyItems = (payload.anomalies || [])
    .map((alert) => {
      const date = alert.date ? new Date(alert.date).toLocaleString() : "";
      return `<li><strong>${escapeHtml(alert.metric)}</strong> · ${escapeHtml(
        alert.type
      )}<br/>${escapeHtml(alert.message)}<br/><small>${escapeHtml(
        date
      )}</small></li>`;
    })
    .join("");

  return `
    <div style="font-family: 'Helvetica Neue', Arial, sans-serif; color: #0f172a;">
      <h1 style="margin-bottom: 0.5rem;">Your HealthTrackr Weekly Report</h1>
      <p style="margin-top: 0; color: #475569;">Here is your summary for the past week.</p>
      ${
        summaryLines
          ? `<h2 style="margin-top: 1.5rem;">Snapshot</h2><ul>${summaryLines}</ul>`
          : ""
      }
      ${
        recommendationItems
          ? `<h2 style="margin-top: 1.5rem;">Recommendations</h2><ul>${recommendationItems}</ul>`
          : ""
      }
      ${
        anomalyItems
          ? `<h2 style="margin-top: 1.5rem;">Alerts to review</h2><ul>${anomalyItems}</ul>`
          : ""
      }
      <p style="margin-top: 2rem; font-size: 0.875rem; color: #64748b;">
        Stay consistent and keep logging your metrics for richer insights.
      </p>
    </div>
  `;
}

function buildTextBody(payload: SendReportPayload) {
  const lines = [payload.summary || "Weekly summary unavailable."];
  if (payload.recommendations?.length) {
    lines.push("\nRecommendations:");
    payload.recommendations.forEach((rec) => {
      lines.push(`- ${rec.title}: ${rec.description}`);
    });
  }
  if (payload.anomalies?.length) {
    lines.push("\nAlerts:");
    payload.anomalies.forEach((alert) => {
      lines.push(`- ${alert.metric} (${alert.type}): ${alert.message}`);
    });
  }
  return lines.join("\n");
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as SendReportPayload;
    if (!payload.to || typeof payload.to !== "string") {
      return NextResponse.json(
        { success: false, error: "Recipient email is required." },
        { status: 400 }
      );
    }

    const transporter = getTransporter();
    const user = process.env.GMAIL_SMTP_USER as string;

    const periodLabel =
      payload.range?.start && payload.range?.end
        ? `${new Date(payload.range.start).toLocaleDateString()} - ${new Date(
            payload.range.end
          ).toLocaleDateString()}`
        : "Weekly summary";

    await transporter.sendMail({
      from: `HealthTrackr Reports <${user}>`,
      to: payload.to,
      subject: `HealthTrackr weekly insights (${periodLabel})`,
      text: buildTextBody(payload),
      html: buildHtmlBody(payload),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to send weekly report", error);
    return NextResponse.json(
      { success: false, error: "Unable to send weekly report." },
      { status: 500 }
    );
  }
}
