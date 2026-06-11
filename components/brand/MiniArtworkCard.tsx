import { HeroArtwork, type HeroMood } from "@/components/brand/HeroArtwork";

export function MiniArtworkCard({
  mood = "home",
  label,
  value,
  className = ""
}: {
  mood?: HeroMood;
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <HeroArtwork mood={mood} compact className={`min-h-[12rem] ${className}`}>
      <div className="flex min-h-[12rem] flex-col justify-end p-5">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-white/55">{label}</p>
        <p className="mt-2 text-2xl font-black leading-tight text-white">{value}</p>
      </div>
    </HeroArtwork>
  );
}
