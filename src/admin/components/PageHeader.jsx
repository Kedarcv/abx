export default function PageHeader({ title, eyebrow, description, actions }) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-4 mb-8">
      <div>
        {eyebrow && (
          <p className="text-xs uppercase tracking-[0.3em] text-white/40 font-orbitron mb-2">
            {eyebrow}
          </p>
        )}
        <h1 className="text-3xl sm:text-4xl font-bold font-orbitron">{title}</h1>
        {description && <p className="text-sm text-white/55 mt-2">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
}
