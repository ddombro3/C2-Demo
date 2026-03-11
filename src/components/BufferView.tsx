interface BufferViewProps {
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

export default function BufferView({
  usernameValue,
  passwordValue,
  frameActive,
}: BufferViewProps) {
  const usernameLen = usernameValue.length;
  const passwordLen = passwordValue.length;

  const usernameUsed = clamp(usernameLen, 0, USERNAME_BUFFER_SIZE);
  const passwordUsed = clamp(passwordLen, 0, PASSWORD_BUFFER_SIZE);

  const usernameOverflow = Math.max(usernameLen - USERNAME_BUFFER_SIZE, 0);
  const passwordOverflow = Math.max(passwordLen - PASSWORD_BUFFER_SIZE, 0);

  const usernameIntoPassword = clamp(usernameOverflow, 0, PASSWORD_BUFFER_SIZE);
  const usernameBeyondPassword = Math.max(
    usernameOverflow - PASSWORD_BUFFER_SIZE,
    0
  );

  const savedFrameFromUsername = clamp(usernameBeyondPassword, 0, WORD_SIZE);
  const returnFromUsername = clamp(usernameBeyondPassword - WORD_SIZE, 0, WORD_SIZE);

  const savedFrameFromPassword = clamp(passwordOverflow, 0, WORD_SIZE);
  const returnFromPassword = clamp(passwordOverflow - WORD_SIZE, 0, WORD_SIZE);

  const savedFrameTouched =
    savedFrameFromUsername + savedFrameFromPassword > 0;
  const returnAddressTouched = returnFromUsername + returnFromPassword > 0;

  const savedFrameBytes = clamp(
    savedFrameFromUsername + savedFrameFromPassword,
    0,
    WORD_SIZE
  );
  const returnBytes = clamp(returnFromUsername + returnFromPassword, 0, WORD_SIZE);

  const passwordVisualFill = clamp(
    passwordUsed + usernameIntoPassword,
    0,
    PASSWORD_BUFFER_SIZE
  );

  const sections = [
    {
      label: "Return Address",
      range: "0xbffff1fc - 0xbffff1ff",
      detail: "returns to auth()+0x14",
      size: WORD_SIZE,
      used: returnBytes,
      state: returnAddressTouched ? "critical" : "normal",
      marker: frameActive ? "RET" : "",
    },
    {
      label: "Saved Frame Pointer",
      range: "0xbffff1f8 - 0xbffff1fb",
      detail: "saved EBP for login()",
      size: WORD_SIZE,
      used: savedFrameBytes,
      state: savedFrameTouched ? "critical" : "normal",
      marker: frameActive ? "EBP" : "",
    },
    {
      label: "password[64]",
      range: "0xbffff1b8 - 0xbffff1f7",
      detail: `local password buffer`,
      size: PASSWORD_BUFFER_SIZE,
      used: passwordVisualFill,
      state:
        passwordOverflow > 0 || usernameIntoPassword > 0 ? "critical" : "normal",
      marker: "",
    },
    {
      label: "username[64]",
      range: "0xbffff178 - 0xbffff1b7",
      detail: `local username buffer`,
      size: USERNAME_BUFFER_SIZE,
      used: usernameUsed,
      state: usernameOverflow > 0 ? "critical" : "normal",
      marker: frameActive ? "ESP" : "",
    },
    {
      label: "authFlag / locals",
      range: "0xbffff174 - 0xbffff177",
      detail: "local state / scratch values",
      size: WORD_SIZE,
      used: frameActive ? WORD_SIZE : 0,
      state: "normal",
      marker: "",
    },
  ];

  return (
    <div className="memory-shell">
      <div className="memory-header">
        <div>
          <div className="memory-title">Stack grows downward</div>
          <div className="memory-subtitle">
            Higher addresses at the top, lower addresses at the bottom
          </div>
        </div>
        <div className={`memory-status ${frameActive ? "active" : "idle"}`}>
          {frameActive ? "login() frame active" : "frame idle"}
        </div>
      </div>

      <div className="memory-legend">
        <div className="legend-item">
          <span className="legend-box filled" />
          <span>Used bytes</span>
        </div>
        <div className="legend-item">
          <span className="legend-box critical" />
          <span>Boundary crossed / overwritten</span>
        </div>
        <div className="legend-item">
          <span className="legend-box empty" />
          <span>Reserved but unused</span>
        </div>
      </div>

      <div className="memory-column">
        {sections.map((section) => {
          const percent = section.size > 0 ? (section.used / section.size) * 100 : 0;

          return (
            <div
              key={section.label}
              className={`memory-block ${section.state} ${
                frameActive ? "active-frame" : ""
              }`}
            >
              <div className="memory-address">{section.range}</div>

              <div className="memory-body">
                <div className="memory-copy">
                  <div className="memory-label-row">
                    <div className="memory-label">{section.label}</div>
                    <div className="memory-meta">
                      {section.used}/{section.size} bytes
                    </div>
                  </div>
                  <div className="memory-detail">{section.detail}</div>

                  <div className="memory-progress">
                    <div
                      className={`memory-progress-fill ${
                        section.state === "critical" ? "critical" : ""
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>

                {section.marker ? (
                  <div className="memory-marker">{section.marker}</div>
                ) : (
                  <div className="memory-marker ghost" />
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="memory-notes">
        <div>
          <strong>username copy:</strong> {usernameLen} byte(s) into a 64-byte local buffer
        </div>
        <div>
          <strong>password copy:</strong> {passwordLen} byte(s) into a 64-byte local buffer
        </div>
        <div>
          <strong>return target:</strong> auth()+0x14
        </div>
      </div>
    </div>
  );
}