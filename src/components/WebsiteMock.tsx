import { TargetProfile } from "../types";

interface WebsiteMockProps {
  targetProfile: TargetProfile;
  targetInput: string;
  targetResponse: string;
  serverLog: string[];
  lastObservedSource: string;
}

export default function WebsiteMock({
  targetProfile,
  targetInput,
  targetResponse,
  serverLog,
  lastObservedSource,
}: WebsiteMockProps) {
  return (
    <div className="website-shell">
      <div className="browser-bar">
        <span className="browser-dot red" />
        <span className="browser-dot yellow" />
        <span className="browser-dot green" />
        <div className="browser-address">
          https://{targetProfile.hostname} ({targetProfile.ip})
        </div>
      </div>

      <div className="website-header">
        <div>
          <h3 className="website-title">Target Service Portal</h3>
          <p className="website-subtitle">
            Mock target-side view driven by the operator console
          </p>
        </div>
        <button className="website-btn">Status</button>
      </div>

      <div className="website-content">
        <div className="website-card hero-card">
          <h4>Target Summary</h4>
          <p>
            Service banner: {targetProfile.banner} · OS guess: {targetProfile.os}
          </p>
        </div>

        <div className="website-columns">
          <div className="website-card form-card">
            <h4>Mock Input Endpoint</h4>

            <label className="form-label">Username</label>
            <div className="mock-field">operator_demo</div>

            <label className="form-label">Password</label>
            <div className="mock-field">••••••••••••••</div>

            <label className="form-label">Input Buffer Field</label>
            <div className="mock-field long-field">
              {targetInput || "No package delivered yet."}
            </div>

            <div className="response-banner">
              <span className="response-label">Target Response</span>
              <span className="response-text">{targetResponse}</span>
            </div>
          </div>

          <div className="website-card log-card">
            <h4>Server Activity</h4>

            <div className="source-badge">
              Last Observed Source: <strong>{lastObservedSource}</strong>
            </div>

            <ul className="server-log">
              {serverLog.map((entry, index) => (
                <li key={`${entry}-${index}`}>{entry}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}