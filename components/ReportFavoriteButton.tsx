"use client";

import { useRouter } from "next/navigation";
import { Star } from "lucide-react";
import { useState } from "react";

import { ActionButton } from "@/components/ui/ActionButton";

export function ReportFavoriteButton({ reportId, favorite, compact = false }: { reportId: string; favorite?: boolean; compact?: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function toggleFavorite() {
    setLoading(true);
    try {
      await fetch(`/api/reports/${reportId}/favorite`, {
        method: favorite ? "DELETE" : "POST"
      });
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <ActionButton
      type="button"
      variant={favorite ? "success" : "ghost"}
      size={compact ? "sm" : "md"}
      loading={loading}
      onClick={() => void toggleFavorite()}
    >
      <Star className={favorite ? "h-4 w-4 fill-current" : "h-4 w-4"} />
      {favorite ? "已收藏" : "收藏"}
    </ActionButton>
  );
}
