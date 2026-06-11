import { ArrowRight } from "lucide-react";

import { HeroArtwork, type HeroMood } from "@/components/brand/HeroArtwork";
import { ActionButton } from "@/components/ui/ActionButton";

export type CinematicHeroProps = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  description?: string;
  ctaLabel?: string;
  ctaHref?: string;
  mood?: HeroMood;
  compact?: boolean;
  stats?: Array<{ label: string; value: string; hint?: string }>;
};

export function CinematicHero({
  eyebrow,
  title,
  subtitle,
  description,
  ctaLabel,
  ctaHref,
  mood = "home",
  compact = false,
  stats = []
}: CinematicHeroProps) {
  return (
    <HeroArtwork mood={mood} compact={compact} className="shadow-[0_28px_80px_rgba(15,23,42,0.24)]">
      <div className={["flex h-full min-h-[inherit] min-w-0 flex-col justify-between p-6 sm:p-8", compact ? "gap-8" : "gap-12"].join(" ")}>
        <div className="min-w-0 max-w-3xl">
          {eyebrow ? <p className="text-xs font-black uppercase tracking-[0.24em] text-cyan-100/72">{eyebrow}</p> : null}
          <h1 className={["mt-4 max-w-full break-words font-black leading-[1.04] tracking-[0] text-white [overflow-wrap:anywhere]", compact ? "text-2xl min-[420px]:text-3xl sm:text-4xl" : "text-3xl min-[420px]:text-4xl sm:text-6xl"].join(" ")}>
            {title}
          </h1>
          {subtitle ? <p className="mt-4 max-w-full break-words text-base font-black text-cyan-50/86 [overflow-wrap:anywhere] sm:text-2xl">{subtitle}</p> : null}
          {description ? <p className="mt-4 max-w-2xl break-words text-sm leading-7 text-slate-100/72 [overflow-wrap:anywhere] sm:text-base">{description}</p> : null}
          {ctaHref && ctaLabel ? (
            <ActionButton href={ctaHref} size="lg" className="mt-7 border-white/20 bg-white text-slate-950 hover:bg-cyan-50">
              {ctaLabel}
              <ArrowRight className="h-4 w-4" />
            </ActionButton>
          ) : null}
        </div>

        {stats.length > 0 ? (
          <div className="grid min-w-0 gap-3 sm:grid-cols-3">
            {stats.map((stat) => (
              <div key={stat.label} className="min-w-0 rounded-2xl border border-white/12 bg-white/10 p-4 backdrop-blur-xl">
                <p className="break-words text-xs font-bold text-white/58">{stat.label}</p>
                <p className="mt-2 break-words text-2xl font-black text-white [overflow-wrap:anywhere]">{stat.value}</p>
                {stat.hint ? <p className="mt-1 break-words text-xs font-bold text-cyan-50/58">{stat.hint}</p> : null}
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </HeroArtwork>
  );
}
