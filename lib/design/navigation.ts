import {
  Activity,
  Bell,
  CalendarClock,
  FileText,
  FlaskConical,
  Gauge,
  Heart,
  History,
  Home,
  Network,
  Settings,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Workflow
} from "lucide-react";
import type { ComponentType, SVGProps } from "react";

export type NavIcon = ComponentType<SVGProps<SVGSVGElement>>;

export type NavigationItem = {
  href: string;
  label: string;
  icon: NavIcon;
  match?: string[];
};

export type NavigationGroup = {
  title: string;
  items: NavigationItem[];
};

export const desktopNavigationGroups: NavigationGroup[] = [
  {
    title: "工作台",
    items: [
      { href: "/", label: "首页", icon: Home },
      { href: "/zones", label: "专区", icon: Workflow },
      { href: "/linkage", label: "联合分析", icon: Network }
    ]
  },
  {
    title: "信息",
    items: [
      { href: "/reports", label: "报告中心", icon: FileText },
      { href: "/notifications", label: "通知中心", icon: Bell },
      { href: "/reports?favorite=1", label: "收藏夹", icon: Heart, match: ["/reports?favorite=1"] }
    ]
  },
  {
    title: "运营",
    items: [
      { href: "/runs", label: "运行日志", icon: History },
      { href: "/schedules", label: "定时刷新", icon: CalendarClock },
      { href: "/quality", label: "质量监控", icon: Activity }
    ]
  },
  {
    title: "系统",
    items: [
      { href: "/mobile-preview", label: "移动预览", icon: Smartphone },
      { href: "/system/health", label: "系统健康", icon: ShieldCheck },
      { href: "/provider-lab", label: "Provider Lab", icon: FlaskConical },
      { href: "/design-preview", label: "设计预览", icon: Sparkles },
      { href: "/settings", label: "设置", icon: Settings }
    ]
  }
];

export const mobileNavigationItems: NavigationItem[] = [
  { href: "/", label: "首页", icon: Home },
  { href: "/zones", label: "专区", icon: Workflow },
  { href: "/reports", label: "报告", icon: FileText },
  { href: "/runs", label: "运行", icon: Gauge },
  { href: "/settings", label: "我的", icon: Settings }
];

export function isNavActive(pathname: string, href: string) {
  const cleanHref = href.split("?")[0];

  if (cleanHref === "/") {
    return pathname === "/";
  }

  return pathname === cleanHref || pathname.startsWith(`${cleanHref}/`);
}
