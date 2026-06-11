import { getTemplateById, summaryTemplates } from "@/lib/templates/summaryTemplates";

export function TemplatePreview({ templateId }: { templateId?: string | null }) {
  const template = getTemplateById(templateId) ?? summaryTemplates[0];

  return (
    <section className="rounded-[22px] border border-white/80 bg-white/88 p-4 shadow-[0_14px_34px_rgba(15,23,42,0.07)] backdrop-blur-xl">
      <p className="text-xs font-black uppercase tracking-[0.16em] text-radar-500">Template</p>
      <h3 className="mt-2 font-black text-slate-950">{template.name}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-500">{template.description}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {template.sections.map((section) => (
          <span key={section} className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-bold text-slate-600">
            【{section}】
          </span>
        ))}
      </div>
    </section>
  );
}
