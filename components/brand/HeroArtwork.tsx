import type { ReactNode } from "react";

export type HeroMood = "home" | "search" | "analysis" | "linkage" | "report" | "mobile";

const moodStyles: Record<
  HeroMood,
  {
    sky: string;
    glow: string;
    line: string;
    orb: string;
    horizon: string;
  }
> = {
  home: {
    sky: "from-slate-950 via-[#0d1b2f] to-[#14243a]",
    glow: "bg-cyan-300/28",
    line: "border-cyan-200/35",
    orb: "bg-[radial-gradient(circle_at_45%_40%,rgba(125,211,252,0.95),rgba(14,165,233,0.38)_42%,transparent_70%)]",
    horizon: "from-cyan-200/50 via-sky-400/20 to-transparent"
  },
  search: {
    sky: "from-slate-950 via-[#0b2236] to-[#10344a]",
    glow: "bg-sky-300/25",
    line: "border-sky-200/35",
    orb: "bg-[radial-gradient(circle_at_40%_35%,rgba(186,230,253,0.9),rgba(56,189,248,0.32)_40%,transparent_68%)]",
    horizon: "from-sky-200/50 via-cyan-300/20 to-transparent"
  },
  analysis: {
    sky: "from-slate-950 via-[#111a38] to-[#1c254f]",
    glow: "bg-indigo-300/24",
    line: "border-indigo-200/35",
    orb: "bg-[radial-gradient(circle_at_48%_38%,rgba(199,210,254,0.95),rgba(99,102,241,0.34)_40%,transparent_70%)]",
    horizon: "from-indigo-200/45 via-sky-300/18 to-transparent"
  },
  linkage: {
    sky: "from-slate-950 via-[#0d2132] to-[#22183f]",
    glow: "bg-violet-300/22",
    line: "border-cyan-200/30",
    orb: "bg-[radial-gradient(circle_at_46%_42%,rgba(165,243,252,0.9),rgba(139,92,246,0.26)_44%,transparent_72%)]",
    horizon: "from-violet-200/40 via-cyan-300/18 to-transparent"
  },
  report: {
    sky: "from-slate-950 via-[#102033] to-[#213044]",
    glow: "bg-slate-200/24",
    line: "border-slate-100/35",
    orb: "bg-[radial-gradient(circle_at_48%_40%,rgba(226,232,240,0.9),rgba(56,189,248,0.22)_42%,transparent_70%)]",
    horizon: "from-slate-100/45 via-sky-300/16 to-transparent"
  },
  mobile: {
    sky: "from-slate-950 via-[#0d2632] to-[#102d42]",
    glow: "bg-teal-300/24",
    line: "border-teal-100/35",
    orb: "bg-[radial-gradient(circle_at_46%_40%,rgba(153,246,228,0.9),rgba(45,212,191,0.25)_42%,transparent_72%)]",
    horizon: "from-teal-100/45 via-sky-300/18 to-transparent"
  }
};

type HeroArtworkProps = {
  mood?: HeroMood;
  compact?: boolean;
  children?: ReactNode;
  className?: string;
};

export function HeroArtwork({ mood = "home", compact = false, children, className = "" }: HeroArtworkProps) {
  const style = moodStyles[mood];

  return (
    <div
      className={[
        "relative isolate w-full max-w-full overflow-hidden rounded-[28px] bg-gradient-to-br text-white",
        style.sky,
        compact ? "min-h-[14rem]" : "min-h-[22rem]",
        className
      ].join(" ")}
    >
      <div aria-hidden="true" className={`absolute -left-24 -top-24 h-72 w-72 rounded-full blur-3xl ${style.glow}`} />
      <div aria-hidden="true" className="absolute -right-20 top-10 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
      <div aria-hidden="true" className={`absolute left-1/2 top-[12%] h-[24rem] w-[24rem] -translate-x-1/2 rounded-full opacity-75 blur-[1px] ${style.orb}`} />
      <div aria-hidden="true" className={`absolute left-1/2 top-[22%] h-[25rem] w-[42rem] -translate-x-1/2 rounded-[50%] border ${style.line} opacity-55`} />
      <div aria-hidden="true" className="absolute inset-x-0 bottom-[18%] h-px bg-white/24" />
      <div aria-hidden="true" className={`absolute inset-x-0 bottom-[14%] h-28 bg-gradient-to-t ${style.horizon}`} />
      <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-[38%] bg-[linear-gradient(180deg,transparent_0%,rgba(2,6,23,0.55)_100%)]" />
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-[30%] opacity-80 [clip-path:polygon(0_72%,12%_50%,23%_63%,34%_35%,47%_58%,61%_30%,75%_54%,88%_38%,100%_64%,100%_100%,0_100%)] bg-slate-950/72"
      />
      <div aria-hidden="true" className="absolute inset-0 opacity-[0.18] [background-image:radial-gradient(circle_at_16%_22%,white_0_1px,transparent_1.6px),radial-gradient(circle_at_82%_18%,white_0_1px,transparent_1.7px),radial-gradient(circle_at_72%_58%,white_0_1px,transparent_1.6px),radial-gradient(circle_at_35%_70%,white_0_1px,transparent_1.6px)]" />
      <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.12)_0%,transparent_26%,transparent_75%,rgba(255,255,255,0.08)_100%)]" />
      <div className="relative z-10 h-full">{children}</div>
    </div>
  );
}
