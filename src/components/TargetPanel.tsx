import BufferView from "./BufferView";
import StackView from "./StackView";
import WebsiteMock from "./WebsiteMock";
import { TargetProfile } from "../types";

interface TargetPanelProps {
  targetProfile: TargetProfile;
  targetInput: string;
  targetResponse: string;
  serverLog: string[];
  lastObservedSource: string;
}

export default function TargetPanel({
  targetProfile,
  targetInput,
  targetResponse,
  serverLog,
  lastObservedSource,
}: TargetPanelProps) {
  return (
    <section className="panel target-panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">RIGHT PANEL</p>
          <h2 className="panel-title">Mock Website / Target Server</h2>
        </div>
        <span className="panel-badge">Interactive Mock</span>
      </div>

      <div className="target-grid">
        <div className="target-main">
          <div className="panel-card">
            <h3 className="card-title">Application View</h3>
            <WebsiteMock
              targetProfile={targetProfile}
              targetInput={targetInput}
              targetResponse={targetResponse}
              serverLog={serverLog}
              lastObservedSource={lastObservedSource}
            />
          </div>
        </div>

        <div className="target-side">
          <div className="panel-card">
            <h3 className="card-title">Buffer Visualization</h3>
            <BufferView inputLength={targetInput.length} />
          </div>

          <div className="panel-card">
            <h3 className="card-title">Stack Snapshot</h3>
            <StackView inputLength={targetInput.length} />
          </div>
        </div>
      </div>
    </section>
  );
}