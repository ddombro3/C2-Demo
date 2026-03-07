interface BufferViewProps {
  inputLength: number;
}

export default function BufferView({ inputLength }: BufferViewProps) {
  const totalSlots = 12;
  const reservedBuffer = 8;

  const slots = Array.from({ length: totalSlots }, (_, index) => {
    let state = "empty";
    let region = "";

    if (index <= 7) {
      region = "Local Buffer";
    } else if (index <= 9) {
      region = "Saved Frame Pointer";
    } else {
      region = "Return Address";
    }

    if (index < inputLength && index < reservedBuffer) {
      state = "filled";
    } else if (index < inputLength && index >= reservedBuffer) {
      state = "critical";
    }

    return {
      label: index.toString().padStart(2, "0"),
      state,
      region,
    };
  });

  return (
    <div className="buffer-shell">
      <div className="buffer-grid">
        {slots.map((slot) => (
          <div
            key={slot.label}
            className={`buffer-slot ${slot.state}`}
            title={`${slot.label} - ${slot.region}`}
          >
            <span className="buffer-index">{slot.label}</span>
            <span className="buffer-role">{slot.region}</span>
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
          <span>Overflow / Critical Region</span>
        </div>
        <div className="legend-item">
          <span className="legend-box empty" />
          <span>Unused</span>
        </div>
      </div>

      <div className="buffer-map">
        <div><strong>00–07</strong> Local Buffer</div>
        <div><strong>08–09</strong> Saved Frame Pointer</div>
        <div><strong>10–11</strong> Return Address</div>
      </div>
    </div>
  );
}