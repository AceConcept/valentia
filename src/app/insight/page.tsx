"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Dashboard } from "@/components/Dashboard";
import {
  readInsightViewPayload,
  type InsightViewPayload,
} from "@/lib/insight-view-payload";

export default function InsightPage() {
  const router = useRouter();
  const [payload, setPayload] = useState<InsightViewPayload | null>(null);

  useEffect(() => {
    const p = readInsightViewPayload();
    if (!p) {
      router.replace("/");
      return;
    }
    setPayload(p);
  }, [router]);

  if (payload === null) {
    return null;
  }

  return (
    <Dashboard
      chartSource="snapshot"
      snapshot={payload.chart}
      articleDetail={payload.article}
    />
  );
}
