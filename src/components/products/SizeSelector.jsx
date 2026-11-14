export default function SizeSelector({ sizes, selected, onSelect, isAvailable = () => true }) {
  return (
    <div className="size-grid" role="radiogroup" aria-label="Select size">
      {sizes.map((s) => {
        const ok = isAvailable(s);
        return (
          <button key={s} type="button" role="radio" aria-checked={selected === s} disabled={!ok} className={`size-btn ${selected === s ? 'on' : ''}`} onClick={() => onSelect(s)}>{s}</button>
        );
      })}
    </div>
  );
}
