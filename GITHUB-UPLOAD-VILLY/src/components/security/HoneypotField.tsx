type HoneypotFieldProps = {
  value?: string;
  onChange?: (value: string) => void;
};

/** Hidden field — bots that fill it are rejected server-side. */
export function HoneypotField({ value = "", onChange }: HoneypotFieldProps) {
  return (
    <input
      type="text"
      name="_hp"
      tabIndex={-1}
      autoComplete="off"
      aria-hidden
      value={value}
      onChange={onChange ? (e) => onChange(e.target.value) : undefined}
      className="pointer-events-none absolute -left-[9999px] h-0 w-0 opacity-0"
    />
  );
}
