"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Bell,
  BookOpenText,
  BookmarkSimple,
  Brain,
  Broom,
  Check,
  ClockCounterClockwise,
  DownloadSimple,
  Moon,
  NotePencil,
  Sparkle,
  TextAa,
  UserCircle,
  Wrench
} from "@phosphor-icons/react";
import { useState } from "react";

export function ProfileCard() {
  return (
    <section className="rounded-[28px] border border-white bg-white p-5 shadow-[0_14px_38px_rgba(65,91,130,0.10)] sm:p-6">
      <div className="flex items-center gap-4">
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-[28px] bg-[#e8f1ff]">
          <Image src="/redesign-assets/profile-avatar.webp" alt="用户头像" fill className="object-cover" sizes="80px" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-black text-[#10213b]">未来观察者</h2>
              <p className="mt-1 text-sm font-semibold text-[#718096]">保持好奇，追踪真正重要的变化</p>
            </div>
            <UserCircle size={24} className="shrink-0 text-[#8a96a8]" />
          </div>
          <div className="mt-4 grid grid-cols-3 divide-x divide-[#e5ebf3] text-center">
            {[['1288','阅读'],['356','收藏'],['89','关注']].map(([value,label]) => (
              <div key={label}>
                <strong className="block text-lg font-black text-[#10213b]">{value}</strong>
                <span className="text-xs font-bold text-[#8793a5]">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function AiAssistantCard() {
  return (
    <section className="flex items-center gap-4 rounded-[24px] border border-[#d9e8ff] bg-[#f3f8ff] p-5 shadow-[0_12px_30px_rgba(65,91,130,0.08)]">
      <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[20px] bg-[#2878ff] text-white shadow-[0_10px_24px_rgba(40,120,255,0.22)]">
        <Brain size={29} weight="duotone" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h2 className="font-black text-[#10213b]">信息雷达 AI 助手</h2>
          <span className="rounded-full bg-[#dbe9ff] px-2 py-0.5 text-[0.65rem] font-black text-[#2878ff]">BETA</span>
        </div>
        <p className="mt-1 text-sm font-semibold leading-6 text-[#718096]">个性化推荐、简报和深度问答</p>
      </div>
      <button type="button" className="min-h-10 shrink-0 rounded-full bg-[#2878ff] px-4 text-xs font-black text-white shadow-[0_8px_20px_rgba(40,120,255,0.22)] transition hover:bg-[#1769e8] active:translate-y-px">立即体验</button>
    </section>
  );
}

export function QuickActions() {
  const actions = [
    { label: "阅读历史", icon: ClockCounterClockwise, color: "bg-[#e8f2ff] text-[#2878ff]" },
    { label: "收藏夹", icon: BookmarkSimple, color: "bg-[#fff0e9] text-[#ff784e]" },
    { label: "离线阅读", icon: DownloadSimple, color: "bg-[#e8fbf4] text-[#31b98c]" },
    { label: "我的笔记", icon: NotePencil, color: "bg-[#f0edff] text-[#7868e8]" }
  ];

  return (
    <section className="grid grid-cols-4 rounded-[24px] border border-white bg-white p-4 shadow-[0_12px_30px_rgba(65,91,130,0.08)]">
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <button key={action.label} type="button" className="flex min-w-0 flex-col items-center gap-2 rounded-2xl px-1 py-2 text-center transition hover:bg-[#f6f9fd]">
            <span className={`flex h-11 w-11 items-center justify-center rounded-2xl ${action.color}`}><Icon size={23} weight="duotone" /></span>
            <span className="text-[0.7rem] font-bold text-[#607089] sm:text-xs">{action.label}</span>
          </button>
        );
      })}
    </section>
  );
}

export function PreferenceTagGroup() {
  const tags = ["人工智能", "科技", "商业", "政策", "新能源", "世界"];
  const [selected, setSelected] = useState(["人工智能", "科技"]);

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-black text-[#10213b]">我的资讯偏好</h3>
        <button type="button" className="text-xs font-bold text-[#718096]">编辑偏好</button>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {tags.map((tag) => {
          const active = selected.includes(tag);
          return (
            <button
              key={tag}
              type="button"
              onClick={() => setSelected((current) => active ? current.filter((item) => item !== tag) : [...current, tag])}
              className={`inline-flex min-h-10 items-center gap-1.5 rounded-full border px-4 text-xs font-black transition ${active ? "border-[#5a97f5] bg-[#edf4ff] text-[#1769e8]" : "border-[#e1e8f1] bg-white text-[#718096] hover:border-[#bcd4f6]"}`}
            >
              {tag}
              {active ? <Check size={14} weight="bold" /> : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function SliderSetting({ label, values, initial = 2 }: { label: string; values: string[]; initial?: number }) {
  const [value, setValue] = useState(initial);
  const max = Math.max(values.length - 1, 1);

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-black text-[#10213b]">{label}</h3>
        <span className="rounded-full bg-[#edf4ff] px-3 py-1 text-xs font-black text-[#2878ff]">{values[value]}</span>
      </div>
      <input
        type="range"
        min={0}
        max={max}
        value={value}
        onChange={(event) => setValue(Number(event.target.value))}
        className="mt-4 h-2 w-full cursor-pointer appearance-none rounded-full bg-[#e6edf6] accent-[#2878ff]"
      />
      <div className="mt-2 grid text-center text-[0.65rem] font-bold text-[#8793a5]" style={{ gridTemplateColumns: `repeat(${values.length}, minmax(0, 1fr))` }}>
        {values.map((item) => <span key={item}>{item}</span>)}
      </div>
    </div>
  );
}

export function PreferencePanel() {
  return (
    <section className="space-y-7 rounded-[24px] border border-white bg-white p-5 shadow-[0_12px_30px_rgba(65,91,130,0.08)] sm:p-6">
      <PreferenceTagGroup />
      <SliderSetting label="资讯新鲜度" values={["更早", "较早", "适中", "较新", "最新"]} />
      <SliderSetting label="内容深度" values={["简要", "较浅", "适中", "较深", "深度"]} />
    </section>
  );
}

export function SettingList() {
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const settings = [
    { label: "通知设置", value: notifications ? "已开启重点资讯通知" : "已关闭", icon: Bell, toggle: true, checked: notifications, setChecked: setNotifications },
    { label: "深色模式", value: darkMode ? "已开启" : "跟随系统", icon: Moon, toggle: true, checked: darkMode, setChecked: setDarkMode },
    { label: "字体大小", value: "标准", icon: TextAa },
    { label: "清理缓存", value: "128.6 MB", icon: Broom }
  ];

  return (
    <section className="overflow-hidden rounded-[24px] border border-white bg-white shadow-[0_12px_30px_rgba(65,91,130,0.08)]">
      {settings.map((setting, index) => {
        const Icon = setting.icon;
        return (
          <div key={setting.label} className={`flex min-h-16 items-center gap-3 px-5 ${index ? "border-t border-[#edf1f6]" : ""}`}>
            <Icon size={22} className="shrink-0 text-[#52647e]" />
            <span className="flex-1 font-bold text-[#26364e]">{setting.label}</span>
            <span className="text-xs font-semibold text-[#8a96a8]">{setting.value}</span>
            {setting.toggle ? (
              <button
                type="button"
                role="switch"
                aria-checked={setting.checked}
                onClick={() => setting.setChecked?.(!setting.checked)}
                className={`relative h-7 w-12 rounded-full transition ${setting.checked ? "bg-[#2878ff]" : "bg-[#d8e0eb]"}`}
              >
                <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition ${setting.checked ? "left-6" : "left-1"}`} />
              </button>
            ) : null}
          </div>
        );
      })}
    </section>
  );
}

export function ManagementEntry() {
  return (
    <section className="rounded-[24px] border border-[#dce8f8] bg-[#f7faff] p-5 shadow-[0_12px_30px_rgba(65,91,130,0.07)] sm:p-6">
      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-[#2878ff] shadow-sm">
          <Wrench size={23} weight="duotone" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="font-black text-[#10213b]">管理与更多工具</h2>
          <p className="mt-1 text-sm font-semibold leading-6 text-[#718096]">进入旧版工作台管理专区、Topic、报告、运行记录和系统状态。</p>
        </div>
      </div>
      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        {[
          { href: "/legacy", label: "管理工作台" },
          { href: "/zones", label: "专区与 Topic" },
          { href: "/system/health", label: "系统状态" }
        ].map((item) => (
          <Link key={item.href} href={item.href} className="flex min-h-11 items-center justify-between rounded-2xl border border-[#dfe8f3] bg-white px-4 text-xs font-black text-[#40516a] transition hover:border-[#9fc3ff] hover:text-[#2878ff]">
            {item.label}
            <ArrowRight size={15} />
          </Link>
        ))}
      </div>
    </section>
  );
}

export function ProfileIntro() {
  return (
    <div className="rounded-[24px] border border-[#dce8f8] bg-[#f6f9ff] p-5">
      <Sparkle size={22} weight="fill" className="text-[#2878ff]" />
      <h3 className="mt-3 font-black text-[#10213b]">阅读习惯已同步</h3>
      <p className="mt-2 text-sm font-semibold leading-6 text-[#718096]">手机和网页端使用同一套偏好，后续可接入当前账户与真实收藏数据。</p>
      <div className="mt-4 flex items-center gap-2 text-xs font-black text-[#2878ff]"><BookOpenText size={17} /> 本周阅读 38 篇</div>
    </div>
  );
}
