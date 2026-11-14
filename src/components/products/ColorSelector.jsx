export default function ColorSelector({ colors, selected, onSelect }) {
  return (
    <div className="color-row" role="radiogroup" aria-label="Select colour">
      {colors.map((c) => (
        <button key={c.name} type="button" role="radio" aria-checked={selected === c.name} title={c.name} className={`color-btn ${selected === c.name ? 'on' : ''}`} onClick={() => onSelect(c.name)}>
          <i style={{ background: c.hex }} />
        </button>
      ))}
    </div>
  );
}
