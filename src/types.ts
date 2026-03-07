export type TerminalTone =
  | "info"
  | "success"
  | "warning"
  | "error"
  | "command";

export interface TerminalEntry {
  id: number;
  tone: TerminalTone;
  text: string;
}

export type RouteMode = "relay" | "direct";

export type PacketStage = "idle" | "c2" | "relay" | "target" | "delivered";

export type TransferDirection = "inbound" | "outbound";

export interface TargetProfile {
  hostname: string;
  ip: string;
  ports: Array<{
    port: number;
    protocol: "tcp";
    service: string;
  }>;
  os: string;
  banner: string;
  notes: string;
}

export interface StatusChip {
  id: number;
  label: string;
  tone: "neutral" | "ok" | "warn";
}