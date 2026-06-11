"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { CalendarClock, Play, RefreshCw, Save, Trash2 } from "lucide-react";

import { ActionButton } from "@/components/ui/ActionButton";
import { AppContainer } from "@/components/ui/AppContainer";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { MetricCard } from "@/components/ui/MetricCard";
import { PageHeader } from "@/components/ui/PageHeader";
import { SectionCard } from "@/components/ui/SectionCard";
import { StatusPill } from "@/components/ui/StatusPill";
import {
  searchModeLabels,
  topicScheduleFrequencyLabels,
  topicScheduleFrequencies,
  type TopicScheduleDTO,
  type TopicScheduleFrequency,
  type WorkspaceZoneDTO,
  type ZoneDetailDTO,
  type ZoneTopicDTO
} from "@/lib/types";

type ZonesResponse = {
  zones?: WorkspaceZoneDTO[];
  error?: string;
};

type ZoneResponse = {
  zone?: ZoneDetailDTO;
  error?: string;
};

type SchedulesResponse = {
  schedules?: TopicScheduleDTO[];
  error?: string;
};

const dayLabels = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];

function formatDate(value?: string | null) {
  if (!value) {
    return "暂无";
  }

  return new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

export default function SchedulesPage() {
  const [zones, setZones] = useState<WorkspaceZoneDTO[]>([]);
  const [topics, setTopics] = useState<ZoneTopicDTO[]>([]);
  const [schedules, setSchedules] = useState<TopicScheduleDTO[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [zoneId, setZoneId] = useState("");
  const [topicId, setTopicId] = useState("");
  const [name, setName] = useState("");
  const [frequency, setFrequency] = useState<TopicScheduleFrequency>("daily");
  const [hour, setHour] = useState(9);
  const [minute, setMinute] = useState(0);
  const [dayOfWeek, setDayOfWeek] = useState(1);
  const [enabled, setEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [runningDue, setRunningDue] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const activeCount = schedules.filter((schedule) => schedule.enabled).length;
  const dueSoonCount = schedules.filter((schedule) => schedule.nextRunAt && new Date(schedule.nextRunAt).getTime() <= Date.now() + 24 * 60 * 60 * 1000).length;

  const selectedZoneTopics = useMemo(() => topics.filter((topic) => topic.zoneId === zoneId), [topics, zoneId]);

  const loadSchedules = useCallback(async () => {
    const response = await fetch("/api/schedules", { cache: "no-store" });
    const data = (await response.json()) as SchedulesResponse;

    if (!response.ok || !data.schedules) {
      throw new Error(data.error || "读取定时规则失败");
    }

    setSchedules(data.schedules);
  }, []);

  const loadZones = useCallback(async () => {
    const response = await fetch("/api/zones", { cache: "no-store" });
    const data = (await response.json()) as ZonesResponse;

    if (!response.ok || !data.zones) {
      throw new Error(data.error || "读取专区失败");
    }

    setZones(data.zones);
    if (!zoneId && data.zones[0]) {
      setZoneId(data.zones[0].id);
    }
  }, [zoneId]);

  const loadZoneTopics = useCallback(async (targetZoneId: string) => {
    if (!targetZoneId) {
      setTopics([]);
      return;
    }

    const response = await fetch(`/api/zones/${targetZoneId}`, { cache: "no-store" });
    const data = (await response.json()) as ZoneResponse;

    if (!response.ok || !data.zone) {
      throw new Error(data.error || "读取 Topic 失败");
    }

    setTopics(data.zone.topics);
    setTopicId((current) => current || data.zone?.topics[0]?.id || "");
  }, []);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await loadZones();
      await loadSchedules();
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "读取数据失败");
    } finally {
      setLoading(false);
    }
  }, [loadSchedules, loadZones]);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  useEffect(() => {
    if (zoneId) {
      void loadZoneTopics(zoneId).catch((loadError) => setError(loadError instanceof Error ? loadError.message : "读取 Topic 失败"));
    }
  }, [loadZoneTopics, zoneId]);

  function resetForm() {
    setEditingId(null);
    setName("");
    setFrequency("daily");
    setHour(9);
    setMinute(0);
    setDayOfWeek(1);
    setEnabled(true);
  }

  function editSchedule(schedule: TopicScheduleDTO) {
    setEditingId(schedule.id);
    setZoneId(schedule.zoneId);
    setTopicId(schedule.topicId);
    setName(schedule.name);
    setFrequency(schedule.frequency);
    setHour(schedule.hour ?? 9);
    setMinute(schedule.minute ?? 0);
    setDayOfWeek(schedule.dayOfWeek ?? 1);
    setEnabled(schedule.enabled);
  }

  async function submitSchedule(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setMessage(null);
    setError(null);

    try {
      const response = await fetch(editingId ? `/api/schedules/${editingId}` : "/api/schedules", {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          zoneId,
          topicId,
          name,
          enabled,
          frequency,
          hour,
          minute,
          dayOfWeek
        })
      });
      const data = (await response.json().catch(() => ({}))) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error || "保存定时规则失败");
      }

      setMessage(editingId ? "定时规则已更新" : "定时规则已创建");
      resetForm();
      await loadSchedules();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "保存定时规则失败");
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleSchedule(schedule: TopicScheduleDTO) {
    const response = await fetch(`/api/schedules/${schedule.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enabled: !schedule.enabled })
    });

    if (response.ok) {
      await loadSchedules();
    }
  }

  async function deleteScheduleById(id: string) {
    if (!window.confirm("确定删除这条定时规则？删除后不会影响已生成的报告。")) {
      return;
    }

    const response = await fetch(`/api/schedules/${id}`, {
      method: "DELETE"
    });

    if (response.ok) {
      await loadSchedules();
    }
  }

  async function runDue() {
    setRunningDue(true);
    setMessage(null);
    setError(null);

    try {
      const response = await fetch("/api/schedules/run-due", {
        method: "POST"
      });
      const data = (await response.json()) as { total?: number; successCount?: number; failedCount?: number; warning?: string; error?: string };

      if (!response.ok) {
        throw new Error(data.error || "执行 due schedules 失败");
      }

      setMessage(`已执行 ${data.total ?? 0} 个 due schedules，成功 ${data.successCount ?? 0}，失败 ${data.failedCount ?? 0}${data.warning ? `。${data.warning}` : ""}`);
      await loadSchedules();
    } catch (runError) {
      setError(runError instanceof Error ? runError.message : "执行 due schedules 失败");
    } finally {
      setRunningDue(false);
    }
  }

  return (
    <AppContainer size="xl">
      <PageHeader
        eyebrow="Schedules"
        title="定时刷新"
        subtitle="为 Topic 配置每日或每周固定时间刷新。Next.js 不依赖常驻后台进程，实际执行由 API、脚本或系统任务触发。"
        meta={
          <>
            <StatusPill tone="success">{activeCount} enabled</StatusPill>
            <StatusPill tone="warning">{dueSoonCount} due soon</StatusPill>
          </>
        }
        actions={
          <>
            <ActionButton type="button" variant="secondary" onClick={() => void loadAll()}>
              <RefreshCw className="h-4 w-4" />
              刷新
            </ActionButton>
            <ActionButton type="button" loading={runningDue} onClick={() => void runDue()}>
              <Play className="h-4 w-4" />
              运行 due schedules
            </ActionButton>
          </>
        }
      />

      <section className="grid gap-4 md:grid-cols-3">
        <MetricCard label="规则数量" value={schedules.length} icon={<CalendarClock className="h-5 w-5" />} />
        <MetricCard label="启用中" value={activeCount} trend="enabled" status="success" />
        <MetricCard label="24h 内待执行" value={dueSoonCount} trend="next run" status={dueSoonCount > 0 ? "warning" : "neutral"} />
      </section>

      {error ? <ErrorState title="定时任务暂时不可用" description={error} /> : null}
      {message ? <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-bold text-emerald-700">{message}</div> : null}

      <section className="grid gap-5 xl:grid-cols-[0.82fr_1.18fr]">
        <SectionCard title={editingId ? "编辑定时规则" : "创建定时规则"} description="先选择专区和 Topic，再选择刷新频率。manual_only 只保留规则，不会被 run-due 自动执行。">
          <form onSubmit={submitSchedule} className="space-y-4">
            <label className="block">
              <span className="text-sm font-bold text-slate-500">Zone</span>
              <select className="radar-input mt-2" value={zoneId} onChange={(event) => { setZoneId(event.target.value); setTopicId(""); }}>
                {zones.map((zone) => (
                  <option key={zone.id} value={zone.id}>
                    {zone.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-sm font-bold text-slate-500">Topic</span>
              <select className="radar-input mt-2" value={topicId} onChange={(event) => setTopicId(event.target.value)}>
                {selectedZoneTopics.map((topic) => (
                  <option key={topic.id} value={topic.id}>
                    {topic.name} / {searchModeLabels[topic.searchMode]}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-sm font-bold text-slate-500">名称</span>
              <input className="radar-input mt-2" value={name} onChange={(event) => setName(event.target.value)} placeholder="例如：每日早间资讯刷新" />
            </label>
            <div className="grid gap-3 sm:grid-cols-3">
              <label className="block">
                <span className="text-sm font-bold text-slate-500">频率</span>
                <select className="radar-input mt-2" value={frequency} onChange={(event) => setFrequency(event.target.value as TopicScheduleFrequency)}>
                  {topicScheduleFrequencies.map((item) => (
                    <option key={item} value={item}>
                      {topicScheduleFrequencyLabels[item]}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="text-sm font-bold text-slate-500">小时</span>
                <input className="radar-input mt-2" type="number" min={0} max={23} value={hour} onChange={(event) => setHour(Number(event.target.value))} disabled={frequency === "manual_only"} />
              </label>
              <label className="block">
                <span className="text-sm font-bold text-slate-500">分钟</span>
                <input className="radar-input mt-2" type="number" min={0} max={59} value={minute} onChange={(event) => setMinute(Number(event.target.value))} disabled={frequency === "manual_only"} />
              </label>
            </div>
            {frequency === "weekly" ? (
              <label className="block">
                <span className="text-sm font-bold text-slate-500">每周几</span>
                <select className="radar-input mt-2" value={dayOfWeek} onChange={(event) => setDayOfWeek(Number(event.target.value))}>
                  {dayLabels.map((label, index) => (
                    <option key={label} value={index}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}
            <label className="flex items-center gap-2 text-sm font-bold text-slate-600">
              <input type="checkbox" checked={enabled} onChange={(event) => setEnabled(event.target.checked)} />
              启用该规则
            </label>
            <div className="flex flex-wrap gap-2">
              <ActionButton type="submit" loading={submitting} disabled={!zoneId || !topicId || !name.trim()}>
                <Save className="h-4 w-4" />
                {editingId ? "保存修改" : "创建规则"}
              </ActionButton>
              {editingId ? (
                <ActionButton type="button" variant="ghost" onClick={resetForm}>
                  取消编辑
                </ActionButton>
              ) : null}
            </div>
          </form>
        </SectionCard>

        <SectionCard title="定时规则列表" description="单次执行失败不会阻断其他 due schedules。">
          {loading ? (
            <LoadingState title="正在读取定时规则" description="正在加载专区、Topic 和刷新计划。" cards={2} />
          ) : schedules.length > 0 ? (
            <div className="space-y-3">
              {schedules.map((schedule) => (
                <article key={schedule.id} className="rounded-[22px] border border-slate-200/70 bg-slate-50/88 p-4">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusPill tone={schedule.enabled ? "success" : "neutral"}>{schedule.enabled ? "enabled" : "disabled"}</StatusPill>
                        <StatusPill>{topicScheduleFrequencyLabels[schedule.frequency]}</StatusPill>
                      </div>
                      <h2 className="mt-3 text-lg font-black text-slate-950">{schedule.name}</h2>
                      <p className="mt-1 text-sm font-bold text-slate-500">{schedule.topic?.name ?? schedule.topicId} / {schedule.zone?.name ?? schedule.zoneId}</p>
                    </div>
                    <div className="grid gap-2 text-sm sm:grid-cols-2 lg:w-80">
                      <SmallBox label="上次执行" value={formatDate(schedule.lastRunAt)} />
                      <SmallBox label="下次执行" value={formatDate(schedule.nextRunAt)} />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <ActionButton type="button" variant="ghost" size="sm" onClick={() => editSchedule(schedule)}>
                        编辑
                      </ActionButton>
                      <ActionButton type="button" variant="secondary" size="sm" onClick={() => void toggleSchedule(schedule)}>
                        {schedule.enabled ? "停用" : "启用"}
                      </ActionButton>
                      <ActionButton type="button" variant="danger" size="sm" onClick={() => void deleteScheduleById(schedule.id)}>
                        <Trash2 className="h-4 w-4" />
                        删除
                      </ActionButton>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <EmptyState title="暂无定时规则" description="创建 daily 或 weekly 规则后，可由 run-due API 或本地脚本触发。" />
          )}
        </SectionCard>
      </section>
    </AppContainer>
  );
}

function SmallBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2">
      <p className="text-xs font-bold text-slate-400">{label}</p>
      <p className="mt-1 font-black text-slate-950">{value}</p>
    </div>
  );
}
