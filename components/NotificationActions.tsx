"use client";

import { useRouter } from "next/navigation";
import { CheckCheck, CheckCircle2 } from "lucide-react";
import { useState } from "react";

import { ActionButton } from "@/components/ui/ActionButton";

export function MarkNotificationReadButton({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function markRead() {
    setLoading(true);
    try {
      await fetch(`/api/notifications/${id}/read`, { method: "PATCH" });
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <ActionButton type="button" variant="ghost" size="sm" loading={loading} onClick={() => void markRead()}>
      <CheckCircle2 className="h-4 w-4" />
      标记已读
    </ActionButton>
  );
}

export function MarkAllNotificationsReadButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function markAllRead() {
    setLoading(true);
    try {
      await fetch("/api/notifications/read-all", { method: "POST" });
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <ActionButton type="button" variant="secondary" loading={loading} onClick={() => void markAllRead()}>
      <CheckCheck className="h-4 w-4" />
      全部已读
    </ActionButton>
  );
}
