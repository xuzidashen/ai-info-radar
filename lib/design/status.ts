import type { NotificationSeverity, QualityLabel, TopicRunStatus, ZoneType } from "@/lib/types";
import type { StatusTone } from "@/components/ui/StatusPill";

export function zoneTone(type: ZoneType): StatusTone {
  if (type === "search") {
    return "info";
  }
  if (type === "analysis") {
    return "warning";
  }
  return "danger";
}

export function runStatusTone(status: TopicRunStatus): StatusTone {
  if (status === "success") {
    return "success";
  }
  if (status === "failed") {
    return "danger";
  }
  if (status === "fallback" || status === "partial_success") {
    return "warning";
  }
  return "info";
}

export function qualityTone(label: QualityLabel | null): StatusTone {
  if (label === "excellent" || label === "good") {
    return "success";
  }
  if (label === "warning") {
    return "warning";
  }
  if (label === "poor") {
    return "danger";
  }
  return "neutral";
}

export function notificationTone(severity: NotificationSeverity): StatusTone {
  if (severity === "success") {
    return "success";
  }
  if (severity === "warning") {
    return "warning";
  }
  if (severity === "danger") {
    return "danger";
  }
  return "info";
}
