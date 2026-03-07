import { PacketStage, RouteMode, TransferDirection } from "../types";

interface NetworkPathProps {
  c2Ip: string;
  relayIp: string;
  targetIp: string;
  routeMode: RouteMode;
  packetStage: PacketStage;
  packetVisible: boolean;
  transferDirection: TransferDirection;
}

export default function NetworkPath({
  c2Ip,
  relayIp,
  targetIp,
  routeMode,
  packetStage,
  packetVisible,
  transferDirection,
}: NetworkPathProps) {
  const relayEnabled = routeMode === "relay";

  const nodes =
    transferDirection === "inbound"
      ? [
          { key: "c2", title: "C2", ip: c2Ip },
          ...(relayEnabled ? [{ key: "relay", title: "Relay", ip: relayIp }] : []),
          { key: "target", title: "Target", ip: targetIp },
        ]
      : [
          { key: "target", title: "Target", ip: targetIp },
          ...(relayEnabled ? [{ key: "relay", title: "Relay", ip: relayIp }] : []),
          { key: "c2", title: "C2", ip: c2Ip },
        ];

  const activeLabel =
    transferDirection === "inbound"
      ? relayEnabled
        ? `C2 ${c2Ip} → Relay ${relayIp} → Target ${targetIp}`
        : `C2 ${c2Ip} → Target ${targetIp}`
      : relayEnabled
        ? `Target ${targetIp} → Relay ${relayIp} → C2 ${c2Ip}`
        : `Target ${targetIp} → C2 ${c2Ip}`;

  return (
    <div className="network-shell">
      <div className="network-route-label">Active Path: {activeLabel}</div>

      <div className="network-row">
        {nodes.map((node, index) => (
          <div key={node.key} className="network-node-group">
            <div
              className={`route-node ${
                packetVisible && packetStage === node.key ? "active" : ""
              }`}
            >
              <span className="route-node-title">{node.title}</span>
              <span className="route-node-ip">{node.ip}</span>

              {packetVisible && packetStage === node.key && (
                <span className="packet-chip">
                  {transferDirection === "inbound" ? "packet" : "beacon"}
                </span>
              )}
            </div>

            {index < nodes.length - 1 && (
              <div className="route-link active-link">
                <span>→</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}