interface BufferViewProps {
  inputLength: number;
}

export default function BufferView({ inputLength }: BufferViewProps) {
  const totalSlots = 12;
  const reservedBuffer = 8;
  const criticalBoundary = 10;

  const slots = Array.from({ length: totalSlots }, (_, index) => {
    let state = "empty";

    if (index < inputLength && index < reservedBuffer) {
      state = "filled";
    } else if (index < inputLength && index >= reservedBuffer) {
      state = "critical";
    }

    if (index >= criticalBoundary && index < inputLength) {
      state = "critical";
    }

    return {
      label: index.toString().padStart(2, "0"),
      state,
    };
  });

  return (
    <div className="buffer-shell">
      <div className="buffer-grid">
        {slots.map((slot) => (
          <div key={slot.label} className={`buffer-slot ${slot.state}`}>
            <span className="buffer-index">{slot.label}</span>
          </div>
        ))}
      </div>

      <div className="buffer-legend">
        <div className="legend-item">
          <span className="legend-box filled" />
          <span>Reserved Buffer</span>
        </div>
        <div className="legend-item">
          <span className="legend-box critical" />
          <span>Critical Region</span>
        </div>
        <div className="legend-item">
          <span className="legend-box empty" />
          <span>Unused</span>
        </div>
      </div>
    </div>
  );
}