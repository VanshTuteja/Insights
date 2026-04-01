import { memo, type ReactNode } from 'react';
import { Link as LinkIcon, Mail, MapPin, Phone } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ResumePreviewData, ResumeTemplateId } from '@/types/resumeAI';

type ResumePreviewProps = {
  resume: ResumePreviewData;
  template: ResumeTemplateId;
  darkTheme: boolean;
  accentColor?: string;
  exportMode?: boolean;
};

const TEMPLATE_STYLES: Record<ResumeTemplateId, { shell: string; badge: string; heading: string; muted: string; sidebar?: string }> = {
  modern: {
    shell: 'text-slate-900 shadow-[0_20px_60px_rgba(15,23,42,0.12)]',
    badge: 'bg-slate-100 text-slate-700 border-slate-200',
    heading: 'text-slate-900 border-slate-200',
    muted: 'text-slate-600',
  },
  minimal: {
    shell: 'text-stone-900 shadow-[0_20px_60px_rgba(41,37,36,0.10)]',
    badge: 'bg-stone-100 text-stone-700 border-stone-200',
    heading: 'text-stone-900 border-stone-300',
    muted: 'text-stone-600',
  },
  professional: {
    shell: 'text-slate-100 shadow-[0_24px_70px_rgba(2,6,23,0.28)]',
    badge: 'bg-slate-900 text-slate-100 border-slate-700',
    heading: 'text-white border-slate-700',
    muted: 'text-slate-300',
  },
  creative: {
    shell: 'text-slate-900 shadow-[0_24px_70px_rgba(15,23,42,0.12)]',
    badge: 'bg-transparent text-white border-white/30',
    heading: 'text-slate-900 border-sky-200',
    muted: 'text-slate-600',
    sidebar: 'bg-slate-950 text-white',
  },
};

function Section({ title, children, className }: { title: string; children: ReactNode; className?: string }) {
  return (
    <section className={cn('resume-section space-y-4 break-inside-avoid', className)}>
      <h3 className="border-b pb-2 text-[11px] font-semibold uppercase tracking-[0.28em]">{title}</h3>
      {children}
    </section>
  );
}

function BulletList({ items, className }: { items: string[]; className?: string }) {
  if (!items.length) return null;
  return (
    <div className={cn('space-y-2.5 text-sm leading-7', className)}>
      {items.map((item) => (
        <div key={item} className="pl-0">{item}</div>
      ))}
    </div>
  );
}

function hexToRgb(color: string) {
  const normalized = color.replace('#', '').trim();
  if (!/^[0-9a-fA-F]{6}$/.test(normalized)) {
    return null;
  }

  return {
    r: Number.parseInt(normalized.slice(0, 2), 16),
    g: Number.parseInt(normalized.slice(2, 4), 16),
    b: Number.parseInt(normalized.slice(4, 6), 16),
  };
}

function rgbaFromHex(color: string, alpha: number) {
  const rgb = hexToRgb(color);
  if (!rgb) {
    return undefined;
  }

  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
}

function ResumePreviewComponent({ resume, template, darkTheme, accentColor = '#334155', exportMode = false }: ResumePreviewProps) {
  const useDarkSurface = darkTheme && !exportMode;
  const creativeSidebarColor =
    exportMode
      ? accentColor
      : darkTheme
      ? `${accentColor}CC`
      : `${accentColor}2B`;
  const creativeChipBackground = rgbaFromHex(accentColor, exportMode ? 0.16 : 0.18) ?? (exportMode ? 'rgba(255,255,255,0.16)' : 'rgba(255,255,255,0.18)');
  const creativeChipBorder = rgbaFromHex(accentColor, exportMode ? 0.32 : 0.3) ?? 'rgba(255,255,255,0.28)';
  const creativeChipText = exportMode ? accentColor : '#ffffff';
  const creativeHeaderSoft = rgbaFromHex(accentColor, exportMode ? 0.08 : 0.16) ?? 'rgba(255,255,255,0.12)';
  const accentLine = rgbaFromHex(accentColor, 0.26) ?? '#cbd5e1';
  const baseStyle = TEMPLATE_STYLES[template];
  const style = {
    ...baseStyle,
    shell: exportMode ? 'text-slate-900 shadow-none' : useDarkSurface ? 'text-slate-100 shadow-[0_24px_70px_rgba(2,6,23,0.28)]' : baseStyle.shell,
    badge: exportMode ? 'bg-slate-100 text-slate-700 border-slate-200' : useDarkSurface ? 'bg-slate-800 text-slate-100 border-slate-700' : baseStyle.badge,
    heading: exportMode ? 'text-slate-900 border-slate-300' : useDarkSurface ? 'text-slate-100 border-slate-700' : baseStyle.heading,
    muted: exportMode ? 'text-slate-600' : useDarkSurface ? 'text-slate-300' : baseStyle.muted,
  };
  const contactItems = [
    { icon: Mail, label: 'Email', value: resume.personal.email },
    { icon: Phone, label: 'Phone', value: resume.personal.phone },
    { icon: MapPin, label: 'Location', value: resume.personal.location },
    { icon: LinkIcon, label: 'Link', value: resume.personal.linkedin || resume.personal.portfolio },
  ].filter((item) => item.value);

  const renderSkills = (items: string[]) => (
    exportMode ? (
      <p className={cn('text-sm leading-7', style.muted)}>{items.join(', ')}</p>
    ) : (
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <span
            key={item}
            className={cn(
              'border px-3 py-1.5 text-xs',
              template === 'creative' ? 'rounded-full' : template === 'modern' ? 'rounded-xl shadow-sm' : template === 'minimal' ? 'rounded-none border-x-0 border-t-0 bg-transparent px-0 pb-1 pt-0' : 'rounded-md',
              template === 'creative' ? '' : style.badge
            )}
            style={
              template === 'creative'
                ? {
                    backgroundColor: creativeChipBackground,
                    color: creativeChipText,
                    borderColor: creativeChipBorder,
                  }
                : template === 'modern'
                ? {
                    backgroundColor: rgbaFromHex(accentColor, darkTheme ? 0.16 : 0.08) ?? undefined,
                    borderColor: rgbaFromHex(accentColor, darkTheme ? 0.24 : 0.14) ?? undefined,
                  }
                : template === 'minimal'
                ? {
                    backgroundColor: 'transparent',
                  }
                : undefined
            }
          >
            {item}
          </span>
        ))}
      </div>
    )
  );

  const renderContactRow = (Icon: typeof Mail, label: string, value: string, iconClassName: string) =>
    exportMode ? (
      <div className="text-sm leading-7">
        <span className="font-semibold">{label}:</span> {value}
      </div>
    ) : (
      <div className="grid grid-cols-[18px_1fr] items-center gap-2.5 leading-6">
        <span className="flex w-[18px] items-center justify-center">
          <Icon className={iconClassName} />
        </span>
        <span className="break-words">{value}</span>
      </div>
    );

  const renderStandardHeader = () => {
    if (template === 'modern') {
      return (
        <header className="space-y-6 border-b pb-7" style={{ borderColor: accentLine }}>
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div className="space-y-3">
              <div className="h-1.5 w-20 rounded-full" style={{ backgroundColor: accentColor }} />
              <div className="space-y-2">
                <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">{resume.personal.name || 'Your Name'}</h1>
                <p className={cn('text-base', style.muted)}>{resume.personal.headline || 'Professional headline'}</p>
              </div>
            </div>
            <div className={cn('grid gap-2 text-sm', style.muted)}>
              {contactItems.map(({ icon: Icon, label, value }) => (
                <div key={value}>
                  {renderContactRow(Icon, label, value, cn('h-4 w-4 shrink-0', exportMode ? 'text-slate-500' : darkTheme ? 'text-slate-400' : 'text-slate-500'))}
                </div>
              ))}
            </div>
          </div>
        </header>
      );
    }

    if (template === 'minimal') {
      return (
        <header className="space-y-4 border-b pb-6" style={{ borderColor: darkTheme ? '#334155' : '#d6d3d1' }}>
          <h1 className="text-4xl font-light tracking-[0.02em]">{resume.personal.name || 'Your Name'}</h1>
          <p className={cn('text-sm uppercase tracking-[0.22em]', style.muted)}>{resume.personal.headline || 'Professional headline'}</p>
          <div className={cn('flex flex-wrap gap-x-6 gap-y-2 text-sm', style.muted)}>
            {contactItems.map(({ value }) => (
              <span key={value}>{value}</span>
            ))}
          </div>
        </header>
      );
    }

    if (template === 'professional') {
      return (
        <header className="space-y-6 rounded-[24px] border p-6 md:p-7" style={{ borderColor: darkTheme && !exportMode ? '#334155' : '#1e293b', backgroundColor: exportMode ? '#f8fafc' : undefined }}>
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div className="space-y-2">
              <p className={cn('text-xs uppercase tracking-[0.32em]', exportMode ? 'text-slate-500' : 'text-slate-400')}>Executive Profile</p>
              <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">{resume.personal.name || 'Your Name'}</h1>
              <p className={cn('text-base', style.muted)}>{resume.personal.headline || 'Professional headline'}</p>
            </div>
            <div className={cn('grid gap-2 text-sm', style.muted)}>
              {contactItems.map(({ icon: Icon, label, value }) => (
                <div key={value}>
                  {renderContactRow(Icon, label, value, cn('h-4 w-4 shrink-0', exportMode ? 'text-slate-500' : 'text-slate-400'))}
                </div>
              ))}
            </div>
          </div>
        </header>
      );
    }

    return (
      <header className="space-y-6">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <p className={cn('text-xs uppercase tracking-[0.32em]', exportMode ? 'text-slate-500' : darkTheme ? 'text-slate-400' : 'text-slate-500')}>
              AI Resume Platform
            </p>
            <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">{resume.personal.name || 'Your Name'}</h1>
            <p className={cn('text-base', style.muted)}>{resume.personal.headline || 'Professional headline'}</p>
          </div>
          <div className={cn('grid gap-2 text-sm', style.muted)}>
            {contactItems.map(({ icon: Icon, label, value }) => (
              <div key={value}>
                {renderContactRow(Icon, label, value, cn('h-4 w-4 shrink-0', exportMode ? 'text-slate-500' : darkTheme ? 'text-slate-400' : 'text-slate-500'))}
              </div>
            ))}
          </div>
        </div>
      </header>
    );
  };

  const mainContent = (
    <>
      <Section title="Professional Summary" className={style.heading}>
        <p className={cn('text-sm leading-7', style.muted)}>{resume.summary || 'Your summary will appear here.'}</p>
      </Section>

      {!!resume.skills.length && (
        <Section title="Core Skills" className={style.heading}>
          {renderSkills(resume.skills)}
        </Section>
      )}

      {!!resume.technicalSkills.length && (
        <Section title="Technical Skills" className={style.heading}>
          {renderSkills(resume.technicalSkills)}
        </Section>
      )}

      {!!resume.tools.length && (
        <Section title="Tools & Platforms" className={style.heading}>
          {renderSkills(resume.tools)}
        </Section>
      )}

      {!!resume.experience.length && (
        <Section title="Experience" className={style.heading}>
          <div className="space-y-6">
            {resume.experience.map((item) => (
              <div key={item.id} className="resume-block space-y-2 break-inside-avoid">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-base font-semibold">{item.title}</p>
                    <p className={cn('text-sm', style.muted)}>{item.subtitle}</p>
                  </div>
                  <p className={cn('text-sm', style.muted)}>{item.meta}</p>
                </div>
                <BulletList items={item.bullets} className={style.muted} />
              </div>
            ))}
          </div>
        </Section>
      )}

      {(resume.projects.length > 0 || resume.education.length > 0) && (
        <div className={cn('grid gap-8', exportMode ? 'grid-cols-1' : 'md:grid-cols-2')}>
          {!!resume.projects.length && (
            <Section title="Projects" className={style.heading}>
              <div className="space-y-5">
                {resume.projects.map((item) => (
                  <div key={item.id} className="resume-block space-y-2 break-inside-avoid">
                    <p className="text-base font-semibold">{item.title}</p>
                    <p className={cn('text-sm', style.muted)}>{item.subtitle}</p>
                    <p className={cn('text-sm', style.muted)}>{item.meta}</p>
                    <BulletList items={item.bullets} className={style.muted} />
                  </div>
                ))}
              </div>
            </Section>
          )}

          {!!resume.education.length && (
            <Section title="Education" className={style.heading}>
              <div className="space-y-4">
                {resume.education.map((item) => (
                  <div key={item.id} className="resume-block break-inside-avoid">
                    <p className="text-base font-semibold">{item.title}</p>
                    <p className={cn('text-sm', style.muted)}>{item.subtitle}</p>
                    <p className={cn('text-sm', style.muted)}>{item.meta}</p>
                  </div>
                ))}
              </div>
            </Section>
          )}
        </div>
      )}

      {(resume.certifications.length > 0 || resume.achievements.length > 0) && (
        <div className={cn('grid gap-8', exportMode ? 'grid-cols-1' : 'md:grid-cols-2')}>
          {!!resume.certifications.length && (
            <Section title="Certifications" className={style.heading}>
              <div className="space-y-4">
                {resume.certifications.map((item) => (
                  <div key={item.id} className="resume-block break-inside-avoid">
                    <p className="text-base font-semibold">{item.title}</p>
                    <p className={cn('text-sm', style.muted)}>{item.subtitle}</p>
                    <p className={cn('text-sm', style.muted)}>{item.meta}</p>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {!!resume.achievements.length && (
            <Section title="Achievements" className={style.heading}>
              <BulletList items={resume.achievements} className={style.muted} />
            </Section>
          )}
        </div>
      )}

      {(resume.languages.length > 0 || resume.interests.length > 0) && (
        <div className={cn('grid gap-8', exportMode ? 'grid-cols-1' : 'md:grid-cols-2')}>
          {!!resume.languages.length && (
            <Section title="Languages" className={style.heading}>
              {renderSkills(resume.languages)}
            </Section>
          )}
          {!!resume.interests.length && (
            <Section title="Interests" className={style.heading}>
              {renderSkills(resume.interests)}
            </Section>
          )}
        </div>
      )}

      {resume.customSections.map((section) => (
        <Section key={section.id} title={section.title || 'Custom Section'} className={style.heading}>
          <BulletList items={section.items} className={style.muted} />
        </Section>
      ))}
    </>
  );

  if (template === 'creative') {
    if (exportMode) {
      return (
        <div className="min-h-[1180px] overflow-hidden rounded-none bg-white text-slate-900 shadow-none">
          <div className="space-y-8 px-8 py-8 md:px-10">
            <header className="resume-section break-inside-avoid border-b pb-8" style={{ borderColor: rgbaFromHex(accentColor, 0.22) ?? '#d8b4fe' }}>
              <div className="overflow-hidden rounded-[24px] border" style={{ borderColor: rgbaFromHex(accentColor, 0.18) ?? '#e9d5ff' }}>
                <div className="grid" style={{ gridTemplateColumns: '18px minmax(0, 1fr)' }}>
                  <div style={{ backgroundColor: accentColor }} />
                  <div className="space-y-6 px-7 py-7" style={{ backgroundColor: creativeHeaderSoft }}>
                    <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                      <div className="space-y-2">
                        <p className="text-xs uppercase tracking-[0.3em]" style={{ color: accentColor }}>Professional Resume</p>
                        <h1 className="text-3xl font-semibold leading-tight">{resume.personal.name || 'Your Name'}</h1>
                        <p className="text-base text-slate-700">{resume.personal.headline || 'Professional headline'}</p>
                      </div>
                      <div className="grid gap-2 text-sm text-slate-700">
                        {contactItems.map(({ label, value }) => (
                          <div key={value} className="leading-6">
                            <span className="font-semibold" style={{ color: accentColor }}>{label}:</span> {value}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid gap-5 md:grid-cols-[1.2fr_0.8fr]">
                      <div className="space-y-2">
                        <p className="text-xs font-semibold uppercase tracking-[0.28em]" style={{ color: accentColor }}>Profile Snapshot</p>
                        <p className="text-base leading-8 text-slate-700">{resume.summary || 'Your summary will appear here.'}</p>
                      </div>

                      <div className="space-y-2">
                        <p className="text-xs font-semibold uppercase tracking-[0.28em]" style={{ color: accentColor }}>Skills</p>
                        <p className="text-sm leading-7 text-slate-700">{resume.skills.join(', ')}</p>
                      </div>
                    </div>

                    {!!resume.technicalSkills.length && (
                      <div className="space-y-2">
                        <p className="text-xs font-semibold uppercase tracking-[0.28em]" style={{ color: accentColor }}>Technical Skills</p>
                        <p className="text-sm leading-7 text-slate-700">{resume.technicalSkills.join(', ')}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </header>

            {mainContent}
          </div>
        </div>
      );
    }

    return (
      <div className={cn('grid min-h-[1180px] overflow-hidden', exportMode ? 'rounded-none shadow-none bg-white text-slate-900 lg:grid-cols-1' : 'rounded-[32px]', style.shell, !exportMode && darkTheme ? 'bg-slate-950' : 'bg-white', exportMode ? '' : 'lg:grid-cols-[280px_1fr]')}>
        <aside
          className={cn('space-y-8 p-8', style.sidebar, exportMode ? 'resume-creative-sidebar text-white' : '', exportMode || darkTheme ? 'text-white' : 'text-slate-900')}
          style={{ backgroundColor: creativeSidebarColor }}
        >
          <div className="space-y-3">
            <p className={cn('text-xs uppercase tracking-[0.3em]', exportMode || darkTheme ? 'text-white/75' : 'text-slate-700')}>Professional Resume</p>
            <h1 className="text-3xl font-semibold leading-tight">{resume.personal.name || 'Your Name'}</h1>
            <p className={cn('text-sm', exportMode || darkTheme ? 'text-white/92' : 'text-slate-700')}>{resume.personal.headline || 'Professional headline'}</p>
          </div>

          <div className={cn('grid gap-3 text-sm', exportMode || darkTheme ? 'text-white/92' : 'text-slate-700')}>
            {contactItems.map(({ icon: Icon, label, value }) => (
              <div key={value}>
                {renderContactRow(Icon, label, value, 'h-4 w-4 shrink-0')}
              </div>
            ))}
          </div>

          {!!resume.skills.length && <Section title="Skills">{renderSkills(resume.skills)}</Section>}
        </aside>
        <div className={cn('space-y-8 p-8 md:p-10', exportMode ? 'pt-10 resume-creative-main' : '')}>{mainContent}</div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'min-h-[1180px] p-8 md:p-10',
        exportMode ? 'rounded-none shadow-none' : 'rounded-[32px]',
        style.shell,
        exportMode ? 'bg-white text-slate-900' : darkTheme ? 'bg-slate-950' : template === 'minimal' ? 'bg-stone-50' : 'bg-white',
        useDarkSurface && template === 'professional' ? 'ring-1 ring-white/10' : ''
      )}
    >
      {renderStandardHeader()}

      <div className={cn('mt-8 space-y-8', exportMode ? 'pb-6' : '')}>{mainContent}</div>
    </div>
  );
}

export const ResumePreview = memo(ResumePreviewComponent);
