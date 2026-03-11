interface StackViewProps {
  usernameValue: string;
  passwordValue: string;
  frameActive: boolean;
}

const USERNAME_BUFFER_SIZE = 64;
const PASSWORD_BUFFER_SIZE = 64;
const WORD_SIZE = 4;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export default function StackView({
  usernameValue,
  passwordValue,
  frameActive,
}: StackViewProps) {
  const usernameLen = usernameValue.length;
  const passwordLen = passwordValue.length;

  const usernameOverflow = Math.max(usernameLen - USERNAME_BUFFER_SIZE, 0);
  const passwordOverflow = Math.max(passwordLen - PASSWORD_BUFFER_SIZE, 0);

  const usernameBeyondPassword = Math.max(
    usernameOverflow - PASSWORD_BUFFER_SIZE,
    0
  );

  const savedFrameBytes = clamp(
    clamp(usernameBeyondPassword, 0, WORD_SIZE) + clamp(passwordOverflow, 0, WORD_SIZE),
    0,
    WORD_SIZE
  );

  const returnBytes = clamp(
    clamp(usernameBeyondPassword - WORD_SIZE, 0, WORD_SIZE) +
      clamp(passwordOverflow - WORD_SIZE, 0, WORD_SIZE),
    0,
    WORD_SIZE
  );

  const savedFrameTouched = savedFrameBytes > 0;
  const returnTouched = returnBytes > 0;
  const overflowDetected = usernameOverflow > 0 || passwordOverflow > 0;

  const executionState = !frameActive
    ? "waiting for auth() to call login()"
    : returnTouched
      ? "return address modified in simulation"
      : savedFrameTouched
        ? "saved frame pointer modified in simulation"
        : "frame intact and ready to return to auth()";

  const events = !frameActive
    ? [
        "auth() has not called login() yet",
        "no return address is currently pushed for this frame",
        "username/password input is only staged in the website form",
      ]
    : [
        "CALL login() pushes a return address for auth()",
        "login() prologue saves the caller frame pointer",
        "local space is reserved for username[64] and password[64]",
        `copy username bytes: ${usernameLen}/64`,
        `copy password bytes: ${passwordLen}/64`,
        overflowDetected
          ? "copy crossed the reserved boundary in the simulation"
          : "copy remained inside the reserved buffers",
      ];

  const rows = [
    {
      label: "Current Function",
      value: frameActive ? "login()" : "auth()",
      kind: "normal",
    },
    {
      label: "Caller / Return Target",
      value: frameActive ? "auth() + 0x14" : "not yet pushed",
      kind: "normal",
    },
    {
      label: "EBP",
      value: frameActive
        ? savedFrameTouched
          ? "0xbffff1f8 (touched)"
          : "0xbffff1f8 (saved)"
        : "frame not active",
      kind: savedFrameTouched ? "critical" : "normal",
    },
    {
      label: "ESP",
      value: frameActive ? "0xbffff174 (locals reserved)" : "caller stack active",
      kind: "normal",
    },
    {
      label: "Saved Frame Pointer",
      value: frameActive
        ? savedFrameTouched
          ? `${savedFrameBytes}/4 byte(s) overwritten`
          : "protected"
        : "not allocated for login() yet",
      kind: savedFrameTouched ? "critical" : "normal",
    },
    {
      label: "Return Address",
      value: frameActive
        ? returnTouched
          ? `${returnBytes}/4 byte(s) overwritten`
          : "protected"
        : "not allocated for login() yet",
      kind: returnTouched ? "critical" : "normal",
    },
    {
      label: "Execution State",
      value: executionState,
      kind: returnTouched || savedFrameTouched ? "critical" : "buffer",
    },
  ];

  return (
    <div className="stack-shell">
      <div className="call-chain-card">
        <div className="call-chain-title">Call Chain</div>
        <div className="call-chain-flow">auth() → login() → auth()</div>
      </div>

      <div className="stack-rows">
        {rows.map((row) => (
          <div key={row.label} className={`stack-row ${row.kind}`}>
            <div className="stack-name">{row.label}</div>
            <div className="stack-value">{row.value}</div>
          </div>
        ))}
      </div>

      <div className="stack-events-card">
        <div className="stack-events-title">Frame Events</div>
        <ul className="stack-events-list">
          {events.map((event) => (
            <li key={event}>{event}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}