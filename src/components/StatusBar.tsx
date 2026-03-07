import { StatusChip } from "../types";

const chips: StatusChip[] = [
  { id: 1, label: "UI Loaded", tone: "ok" },
  { id: 2, label: "Scenario Static", tone: "neutral" },
  { id: 3, label: "Network Disabled", tone: "ok" },
  { id: 4, label: "Logic Pending", tone: "warn" },
];

export default function StatusBar() {
  return (
    <footer className="statusbar">
      <div className="statusbar-left">
        <span className="statusbar-title">System Status</span>
        {chips.map((chip) => (
          <span key={chip.id} className={`status-chip ${chip.tone}`}>
            {chip.label}
          </span>
        ))}
      </div>

      <div className="statusbar-right">
        <span>Split View Active</span>
      </div>
    </footer>
  );
}