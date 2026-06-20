import Link from "next/link";
import {
  ArrowRight,
  BookmarkSimple,
  Compass,
  DeviceMobile,
  House,
  Newspaper,
  User
} from "@phosphor-icons/react/dist/ssr";

import { RedesignShell } from "@/components/redesign/RedesignShell";

const previews = [
  {
    href: "/redesign",
    title: "首页",
    description: "头条、今日简报与个性化推荐流",
    icon: House,
    accent: "bg-[#2878ff]",
    mock: ["h-24 bg-[url('/redesign-assets/hero-city.webp')] bg-cover bg-center", "h-10 bg-[#e9f2ff]", "h-16 bg-white"]
  },
  {
    href: "/redesign/discover",
    title: "发现",
    description: "热榜、精选专题与快速上升内容",
    icon: Compass,
    accent: "bg-[#ff784e]",
    mock: ["h-12 bg-[#fff0e9]", "h-20 bg-white", "h-20 bg-[url('/redesign-assets/ai-chip.webp')] bg-cover bg-center"]
  },
  {
    href: "/redesign/saved",
    title: "收藏",
    description: "收藏、稍后阅读和专题内容归档",
    icon: BookmarkSimple,
    accent: "bg-[#7868e8]",
    mock: ["h-12 bg-[#f0edff]", "h-16 bg-white", "h-16 bg-white"]
  },
  {
    href: "/redesign/profile",
    title: "我的",
    description: "账户、阅读偏好与轻量设置",
    icon: User,
    accent: "bg-[#31b98c]",
    mock: ["h-20 bg-[#e8fbf4]", "h-14 bg-white", "h-24 bg-white"]
  }
];

export default function RedesignPreviewPage() {
  return (
    <RedesignShell showBottomNav={false}>
      <div className="mx-auto max-w-6xl py-3 sm:py-8">
        <header className="rounded-[28px] border border-white bg-white p-6 shadow-[0_14px_38px_rgba(65,91,130,0.09)] sm:p-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#2878ff] text-white"><DeviceMobile size={26} weight="duotone" /></div>
          <p className="mt-5 text-xs font-black uppercase text-[#2878ff]">UI Redesign Preview</p>
          <h1 className="mt-2 text-3xl font-black leading-tight text-[#10213b] sm:text-4xl">更轻、更清楚的信息浏览体验</h1>
          <p className="mt-4 max-w-3xl text-sm font-semibold leading-7 text-[#607089] sm:text-base">以移动端为主，将复杂系统概念收进自然的阅读路径：首页、发现、收藏、我的。下面每个预览都可直接进入真实 Next.js 页面。</p>
          <Link href="/redesign/article/ai-plan-2030" className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-2xl bg-[#2878ff] px-5 text-sm font-black text-white shadow-[0_10px_24px_rgba(40,120,255,0.22)] transition hover:bg-[#1769e8]">打开文章详情 <ArrowRight size={17} /></Link>
        </header>

        <section className="mt-7 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {previews.map((preview) => {
            const Icon = preview.icon;
            return (
              <Link key={preview.href} href={preview.href} className="group rounded-[28px] border border-white bg-white p-4 shadow-[0_12px_34px_rgba(65,91,130,0.09)] transition hover:-translate-y-1 hover:shadow-[0_18px_42px_rgba(65,91,130,0.13)]">
                <div className="mx-auto max-w-[18rem] rounded-[26px] border-[6px] border-[#e5ebf3] bg-[#f3f7fc] p-3 shadow-inner">
                  <div className="mb-3 flex items-center justify-between"><span className="h-2 w-12 rounded-full bg-[#d3dce8]" /><span className="h-2 w-6 rounded-full bg-[#d3dce8]" /></div>
                  <div className="space-y-2">
                    {preview.mock.map((className, index) => <div key={index} className={`rounded-2xl shadow-sm ${className}`} />)}
                  </div>
                  <div className="mt-3 grid grid-cols-4 gap-2 rounded-xl bg-white p-2">
                    {[House, Compass, BookmarkSimple, User].map((NavIcon, index) => <NavIcon key={index} size={15} className={index === previews.indexOf(preview) ? "text-[#2878ff]" : "text-[#a1adbc]"} />)}
                  </div>
                </div>
                <div className="mt-5 flex items-start gap-3 px-1 pb-1">
                  <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-white ${preview.accent}`}><Icon size={21} weight="duotone" /></span>
                  <div className="min-w-0 flex-1">
                    <h2 className="font-black text-[#10213b]">{preview.title}</h2>
                    <p className="mt-1 text-xs font-semibold leading-5 text-[#718096]">{preview.description}</p>
                  </div>
                  <ArrowRight size={18} className="mt-1 shrink-0 text-[#9aa7b8] transition group-hover:translate-x-1 group-hover:text-[#2878ff]" />
                </div>
              </Link>
            );
          })}
        </section>

        <section className="mt-7 grid gap-4 rounded-[28px] border border-[#dce8f8] bg-[#f7faff] p-5 sm:grid-cols-3 sm:p-6">
          {[
            { icon: DeviceMobile, title: "移动优先", text: "390px 宽度下保持完整操作与安全区。" },
            { icon: Newspaper, title: "阅读优先", text: "内容层级清楚，弱化系统和调试术语。" },
            { icon: BookmarkSimple, title: "路径简单", text: "浏览、发现、收藏、偏好四条主路径。" }
          ].map((item) => {
            const Icon = item.icon;
            return <div key={item.title} className="flex gap-3"><Icon size={23} weight="duotone" className="shrink-0 text-[#2878ff]" /><div><h3 className="font-black text-[#10213b]">{item.title}</h3><p className="mt-1 text-xs font-semibold leading-5 text-[#718096]">{item.text}</p></div></div>;
          })}
        </section>
      </div>
    </RedesignShell>
  );
}
