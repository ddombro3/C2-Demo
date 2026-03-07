interface StackViewProps {
  inputLength: number;
}

export default function StackView({ inputLength }: StackViewProps) {
  const reservedBuffer = 8;
  const overflowBytes = Math.max(inputLength - reservedBuffer, 0);

  const framePointerState =
    overflowBytes === 0
      ? "untouched"
      : overflowBytes <= 2
        ? "touched in simulation"
        : "overwritten in simulation";

  const returnAddressState =
    overflowBytes <= 2 ? "protected control location" : "touched in simulation";

  const nextInstructionState =
    overflowBytes <= 2
      ? "application flow continues"
      : "control-flow warning raised";

  const rows = [
    {
      name: "Local Buffer",
      value: `${reservedBuffer}-byte reserved input region`,
      kind: "buffer",
    },
    {
      name: "Saved Frame Pointer",
      value: framePointerState,
      kind: overflowBytes > 0 ? "critical" : "normal",
    },
    {
      name: "Return Address",
      value: returnAddressState,
      kind: overflowBytes > 2 ? "critical" : "normal",
    },
    {
      name: "Next Instruction",
      value: nextInstructionState,
      kind: overflowBytes > 2 ? "critical" : "normal",
    },
  ];

  return (
    <div className="stack-shell">
      {rows.map((row) => (
        <div key={row.name} className={`stack-row ${row.kind}`}>
          <div className="stack-name">{row.name}</div>
          <div className="stack-value">{row.value}</div>
        </div>
      ))}
    </div>
  );
}