import type { CSSProperties } from 'react';

type RangeProps = {
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  format: (value: number) => string;
  onChange: (value: number) => void;
};

/** Bounded slider of the tuning panels: the bounds are the direction. */
export function Range({ label, min, max, step, value, format, onChange }: RangeProps) {
  const fill = { '--fill': `${((value - min) / (max - min)) * 100}%` } as CSSProperties;
  return (
    <label className="atelier-range">
      <span>{label}</span>
      <span className="atelier-range__track" style={fill}>
        <input type="range" min={min} max={max} step={step} value={value} onChange={(event) => onChange(Number(event.target.value))} />
        <output>{format(value)}</output>
      </span>
    </label>
  );
}
