"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Loader2, Plus, Save, SearchX, X } from "lucide-react";

import { KeywordCard } from "@/components/KeywordCard";
import { categoryHints, categoryLabels, keywordCategories, type KeywordCategory, type KeywordDTO } from "@/lib/types";

type KeywordsResponse = {
  keywords?: KeywordDTO[];
  keyword?: KeywordDTO;
  error?: string;
};

export default function KeywordsPage() {
  const [keywords, setKeywords] = useState<KeywordDTO[]>([]);
  const [name, setName] = useState("");
  const [category, setCategory] = useState<KeywordCategory>("ai-tech");
  const [description, setDescription] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const categoryHint = useMemo(() => categoryHints[category], [category]);
  const isEditing = Boolean(editingId);

  async function loadKeywords() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/keywords", {
        cache: "no-store"
      });
      const data = (await response.json()) as KeywordsResponse;

      if (!response.ok) {
        throw new Error(data.error || "获取关键词失败");
      }

      setKeywords(data.keywords ?? []);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "获取关键词失败");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadKeywords();
  }, []);

  function resetForm() {
    setName("");
    setDescription("");
    setCategory("ai-tech");
    setEditingId(null);
  }

  function startEdit(keyword: KeywordDTO) {
    setEditingId(keyword.id);
    setName(keyword.name);
    setCategory(keyword.category);
    setDescription(keyword.description ?? "");
    setError(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch(editingId ? `/api/keywords/${editingId}` : "/api/keywords", {
        method: editingId ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name,
          category,
          description
        })
      });
      const data = (await response.json()) as KeywordsResponse;

      if (!response.ok || !data.keyword) {
        throw new Error(data.error || (editingId ? "更新关键词失败" : "新增关键词失败"));
      }

      if (editingId) {
        setKeywords((current) => current.map((keyword) => (keyword.id === editingId ? data.keyword! : keyword)));
      } else {
        setKeywords((current) => [data.keyword!, ...current]);
      }

      resetForm();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "保存关键词失败");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    const target = keywords.find((keyword) => keyword.id === id);

    if (!target || !window.confirm(`确认删除关键词“${target.name}”？相关信息卡片、历史简报和 DailySignal 也会删除。`)) {
      return;
    }

    setDeletingId(id);
    setError(null);

    try {
      const response = await fetch(`/api/keywords/${id}`, {
        method: "DELETE"
      });
      const data = (await response.json().catch(() => ({}))) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error || "删除关键词失败");
      }

      setKeywords((current) => current.filter((keyword) => keyword.id !== id));
      if (editingId === id) {
        resetForm();
      }
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "删除关键词失败");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-7">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.22em] text-radar-600">Keyword Console</p>
          <h1 className="mt-2 text-3xl font-black text-ink-950 sm:text-4xl">关键词管理</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-ink-700">
            添加或编辑想持续追踪的主题，后续在详情页生成信息卡片、AI 简报和信息因子信号。
          </p>
        </div>
        <button
          type="button"
          onClick={() => void loadKeywords()}
          disabled={loading}
          className="radar-button border-ink-950/10 bg-white text-ink-900 hover:border-radar-500/35 hover:text-radar-600"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          刷新列表
        </button>
      </div>

      <section className="grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">
        <form onSubmit={handleSubmit} className="radar-card rounded-2xl p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-black text-ink-950">{isEditing ? "编辑关键词" : "新增关键词"}</h2>
            {isEditing ? (
              <button
                type="button"
                onClick={resetForm}
                className="radar-button border-ink-950/10 bg-white px-3 py-2 text-ink-700 hover:text-danger-500"
              >
                <X className="h-4 w-4" />
                取消
              </button>
            ) : null}
          </div>
          <div className="mt-5 space-y-4">
            <label className="block">
              <span className="text-sm font-bold text-ink-700">关键词名称</span>
              <input
                className="radar-input mt-2"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="例如：OpenAI / 中芯国际 / 软件杯 A3"
                maxLength={60}
              />
            </label>

            <label className="block">
              <span className="text-sm font-bold text-ink-700">关键词类型</span>
              <select
                className="radar-input mt-2"
                value={category}
                onChange={(event) => setCategory(event.target.value as KeywordCategory)}
              >
                {keywordCategories.map((item) => (
                  <option key={item} value={item}>
                    {categoryLabels[item]}
                  </option>
                ))}
              </select>
              <span className="mt-2 block text-xs leading-5 text-ink-700">{categoryHint}</span>
            </label>

            <label className="block">
              <span className="text-sm font-bold text-ink-700">描述</span>
              <textarea
                className="radar-input mt-2 min-h-28 resize-y"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="写下你关注它的原因、重点信息源或追踪目标"
                maxLength={240}
              />
            </label>

            <button
              type="submit"
              disabled={submitting || !name.trim()}
              className="radar-button w-full bg-ink-950 text-white hover:bg-ink-800"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : isEditing ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              {isEditing ? "保存修改" : "新增关键词"}
            </button>
          </div>
        </form>

        <section className="space-y-4">
          {error ? (
            <div className="rounded-2xl border border-danger-500/25 bg-danger-500/10 p-4 text-sm font-bold text-danger-500">
              {error}
            </div>
          ) : null}

          {loading ? (
            <div className="radar-card flex min-h-80 items-center justify-center rounded-2xl p-8">
              <div className="flex items-center gap-3 text-sm font-bold text-ink-700">
                <Loader2 className="h-5 w-5 animate-spin text-radar-600" />
                正在读取关键词
              </div>
            </div>
          ) : keywords.length > 0 ? (
            <div className="grid gap-4 xl:grid-cols-2">
              {keywords.map((keyword) => (
                <KeywordCard
                  key={keyword.id}
                  keyword={keyword}
                  onEdit={startEdit}
                  onDelete={handleDelete}
                  deleting={deletingId === keyword.id}
                />
              ))}
            </div>
          ) : (
            <div className="radar-card rounded-2xl p-10 text-center">
              <SearchX className="mx-auto h-11 w-11 text-radar-600" />
              <h2 className="mt-4 text-2xl font-black text-ink-950">还没有关键词</h2>
              <p className="mt-3 text-sm leading-7 text-ink-700">
                从左侧表单添加第一个关键词，然后进入详情页生成第一份简报和因子信号。
              </p>
            </div>
          )}
        </section>
      </section>
    </div>
  );
}

