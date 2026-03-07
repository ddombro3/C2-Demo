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

  const [targetInput, setTargetInput] = useState("");
  const [targetResponse, setTargetResponse] = useState(
    "Awaiting mock package delivery."
  );
  const [serverLog, setServerLog] = useState<string[]>(makeInitialServerLog());
  const [lastObservedSource, setLastObservedSource] = useState("none");

  const [targetCompromised, setTargetCompromised] = useState(false);
  const [beaconEnabled, setBeaconEnabled] = useState(false);
  const [beaconCount, setBeaconCount] = useState(0);

  const beaconBusyRef = useRef(false);

  function appendLines(
    ...entries: Array<{ tone: TerminalTone; text: string }>
  ) {
    setTerminalLines((prev) => [
      ...prev,
      ...entries.map((entry) => makeLine(entry.tone, entry.text)),
    ]);
  }

  function resetTerminal() {
    setTerminalLines(makeInitialTerminalLines());
  }

  function runMockScan(serviceScan: boolean) {
    appendLines(
      {
        tone: "info",
        text: `Starting mock scan against ${targetProfile.hostname}`,
      },
      {
        tone: "info",
        text: `Nmap scan report for ${targetProfile.hostname} (${targetProfile.ip})`,
      },
      { tone: "success", text: "Host is up (0.021s latency)." }
    );

    targetProfile.ports.forEach((entry) => {
      appendLines({
        tone: "info",
        text: `${entry.port}/${entry.protocol} open ${entry.service}`,
      });
    });

    if (serviceScan) {
      appendLines(
        { tone: "info", text: `Service banner: ${targetProfile.banner}` },
        { tone: "info", text: `OS guess: ${targetProfile.os}` },
        { tone: "warning", text: `Notes: ${targetProfile.notes}` }
      );
    }
  }

  function buildPackage(mode: "safe" | "overflow-demo") {
    if (mode === "safe") {
      const safePayload = "POST:user=operator_demo&input=HELLO123";
      setPayloadName("safe");
      setPayloadPreview(safePayload);

      appendLines(
        {
          tone: "success",
          text: `[build] staged safe package (${safePayload.length} bytes)`,
        },
        {
          tone: "info",
          text: "[build] package remains within reserved target input region",
        }
      );
      return;
    }

    const overflowPayload = "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAARET";
    setPayloadName("overflow-demo");
    setPayloadPreview(overflowPayload);

    appendLines(
      {
        tone: "warning",
        text: `[build] staged oversized demo package (${overflowPayload.length} bytes)`,
      },
      {
        tone: "warning",
        text: "[build] package is intended to trigger overflow visualization only",
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
      text: `[callback] mock check-in initiated from ${targetProfile.hostname}`,
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
        text: `[c2] simulated beacon received from ${targetProfile.hostname}`,
      });
    }, c2Delay);

    window.setTimeout(() => {
      setPacketStage("delivered");
    }, c2Delay + 700);

    window.setTimeout(() => {
      setPacketVisible(false);
      setPacketStage("idle");
      setTransferDirection("inbound");
      setTargetResponse("Simulated compromise active. Callback loop armed.");
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
    if (!payloadName || !payloadPreview) {
      appendLines({
        tone: "warning",
        text: '[send] no package staged — use "build package safe" or "build package overflow-demo"',
      });
      return;
    }

    const useRelay = routeMode === "relay";
    const simulatedSource = useRelay ? RELAY_IP : C2_IP;

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
      setTargetInput(payloadPreview);
      setLastObservedSource(simulatedSource);

      if (payloadName === "safe") {
        setTargetResponse("200 OK — mock request parsed within reserved region.");
        setServerLog([
          `request observed from ${simulatedSource}`,
          `bytes received: ${payloadPreview.length}`,
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
        setTargetResponse("Simulated compromise active. Callback loop armed.");
        setServerLog([
          `request observed from ${simulatedSource}`,
          `bytes received: ${payloadPreview.length}`,
          "reserved region exceeded in simulation view",
          "mock compromise state entered",
        ]);
        appendLines(
          {
            tone: "success",
            text: `[target] package arrived at ${targetProfile.hostname}`,
          },
          {
            tone: "warning",
            text: "[target] mock compromise state entered",
          },
          {
            tone: "info",
            text: "[callback] simulated periodic check-in enabled",
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

  function handleCommand(rawCommand: string) {
    const command = rawCommand.trim();
    const lower = command.toLowerCase();

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
        { tone: "info", text: "nmap demo-target.local" },
        { tone: "info", text: "nmap -sV demo-target.local" },
        { tone: "info", text: "build package safe" },
        { tone: "info", text: "build package overflow-demo" },
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
        text: `Beacon status: ${beaconEnabled ? "armed" : "disabled"} | target compromised: ${
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
        tone: "success",
        text: `Route updated to direct mode from ${C2_IP}`,
      });
      return;
    }

    if (lower === "nmap demo-target.local") {
      runMockScan(false);
      return;
    }

    if (lower === "nmap -sv demo-target.local") {
      runMockScan(true);
      return;
    }

    if (lower === "build package safe") {
      buildPackage("safe");
      return;
    }

    if (lower === "build package overflow-demo") {
      buildPackage("overflow-demo");
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
          text: "[beacon] callback loop cannot start until mock compromise exists",
        });
        return;
      }

      setBeaconEnabled(true);
      appendLines({
        tone: "success",
        text: "[beacon] simulated callback loop armed",
      });
      return;
    }

    if (lower === "beacon stop") {
      setBeaconEnabled(false);
      appendLines({
        tone: "warning",
        text: "[beacon] simulated callback loop stopped",
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
        />
      </div>
    </section>
  );
}