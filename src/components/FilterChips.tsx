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
      <span className="mr-0.5 text-label text-muted uppercase">{label}</span>
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
      className={`rounded-full border px-4 py-2 text-small font-bold transition ${
        active ? 'border-violet bg-violet text-white' : 'border-line2 bg-card text-ink2 hover:border-violet'
      }`}
    >
      {children}
    </button>
  );
}
