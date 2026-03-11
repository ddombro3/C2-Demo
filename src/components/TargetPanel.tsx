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
  websiteUsername: string;
  websitePassword: string;
  loginFrameActive: boolean;
  onUsernameChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onInvokeLogin: () => void;
  onReturnToAuth: () => void;
  onClearLogin: () => void;
}

export default function TargetPanel({
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
              websiteUsername={websiteUsername}
              websitePassword={websitePassword}
              loginFrameActive={loginFrameActive}
              onUsernameChange={onUsernameChange}
              onPasswordChange={onPasswordChange}
              onInvokeLogin={onInvokeLogin}
              onReturnToAuth={onReturnToAuth}
              onClearLogin={onClearLogin}
            />
          </div>
        </div>

        <div className="target-side">
          <div className="panel-card">
            <h3 className="card-title">login() Stack Frame</h3>
            <BufferView
              usernameValue={websiteUsername}
              passwordValue={websitePassword}
              frameActive={loginFrameActive}
            />
          </div>

          <div className="panel-card">
            <h3 className="card-title">Call / Return State</h3>
            <StackView
              usernameValue={websiteUsername}
              passwordValue={websitePassword}
              frameActive={loginFrameActive}
            />
          </div>
        </div>
      </div>
    </section>
  );
}