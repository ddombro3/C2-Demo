import { TargetProfile } from "../types";

interface WebsiteMockProps {
  targetProfile: TargetProfile;
  targetInput: string;
  targetResponse: string;
  serverLog: string[];
  lastObservedSource: string;
  websiteUsername: string;
  websitePassword: string;
  loginFrameActive: boolean;
  onUsernameChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onInvokeLogin: () => void;
  onReturnToAuth: () => void;
  onClearLogin: () => void;
}

const USERNAME_BUFFER_SIZE = 64;
const PASSWORD_BUFFER_SIZE = 64;

export default function WebsiteMock({
  targetProfile,
  targetInput,
  targetResponse,
  serverLog,
  lastObservedSource,
  websiteUsername,
  websitePassword,
  loginFrameActive,
  onUsernameChange,
  onPasswordChange,
  onInvokeLogin,
  onReturnToAuth,
  onClearLogin,
}: WebsiteMockProps) {
  const usernameLen = websiteUsername.length;
  const passwordLen = websitePassword.length;

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
            Interactive login() simulation plus target-side activity view
          </p>
        </div>
        <button className={`website-btn ${loginFrameActive ? "primary" : "secondary"}`}>
          {loginFrameActive ? "login() active" : "idle"}
        </button>
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
            <h4>Interactive Login Function</h4>
            <p className="form-helper">
              Type into the fields below, then call <code>login()</code> to allocate the
              stack frame and copy the current values into local buffers.
            </p>

            <label className="form-label" htmlFor="website-username">
              Username
            </label>
            <input
              id="website-username"
              className="website-input"
              type="text"
              value={websiteUsername}
              onChange={(e) => onUsernameChange(e.target.value)}
              placeholder="operator_demo"
              spellCheck={false}
              autoComplete="off"
            />
            <div className="field-meta">
              <span>Typed: {usernameLen} byte(s)</span>
              <span>Buffer: {USERNAME_BUFFER_SIZE} bytes</span>
            </div>

            <label className="form-label" htmlFor="website-password">
              Password
            </label>
            <input
              id="website-password"
              className="website-input"
              type="text"
              value={websitePassword}
              onChange={(e) => onPasswordChange(e.target.value)}
              placeholder="P@ssw0rd!"
              spellCheck={false}
              autoComplete="off"
            />
            <div className="field-meta">
              <span>Typed: {passwordLen} byte(s)</span>
              <span>Buffer: {PASSWORD_BUFFER_SIZE} bytes</span>
            </div>

            <div className="website-button-row">
              <button className="website-btn primary" type="button" onClick={onInvokeLogin}>
                Call login()
              </button>
              <button
                className="website-btn secondary"
                type="button"
                onClick={onReturnToAuth}
              >
                Return to auth()
              </button>
              <button className="website-btn secondary" type="button" onClick={onClearLogin}>
                Clear Fields
              </button>
            </div>

            <div className="response-banner">
              <span className="response-label">Execution Status</span>
              <span className="response-text">{targetResponse}</span>
            </div>

            <div className="delivered-packet-card">
              <span className="response-label">Last Delivered Packet Preview</span>
              <div className="mock-field long-field packet-preview-field">
                {targetInput || "No operator-delivered package yet."}
              </div>
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