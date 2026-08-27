/** A single-select chip row. Selection lives in the URL, never in component state. */
export function FilterChips<T extends string>({
  label,
  options,
  value,
  onChange,
  allLabel,
}: {
  label: string;
  options: { value: T; label: string }[];
  value: T | undefined;
  onChange: (next: T | undefined) => void;
  allLabel?: string;
}) {
  return (
    <>
      <span className="mr-0.5 font-mono text-[10.5px] tracking-[0.1em] text-muted uppercase">{label}</span>
      {allLabel && (
        <Chip active={value === undefined} onClick={() => onChange(undefined)}>
          {allLabel}
        </Chip>
      )}
      {options.map((option) => (
        <Chip
          key={option.value}
          active={value === option.value}
          onClick={() => onChange(value === option.value ? undefined : option.value)}
        >
          {option.label}
        </Chip>
      ))}
    </>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full border px-3 py-1.5 text-[12.5px] transition ${
        active ? 'border-ink bg-ink text-white' : 'border-line2 bg-card text-ink2 hover:border-ink/30'
      }`}
    >
      {children}
    </button>
  );
}
