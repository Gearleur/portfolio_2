export function BackButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button className="yc-back" type="button" onClick={onClick}>
      <span className="yc-back__arrow" aria-hidden="true">
        ←
      </span>
      <span>{label}</span>
    </button>
  );
}
