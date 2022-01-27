import type { PacketType } from "./packetType";

export interface ForwardingPacket {
    ForwardTo: string[];
    Type: PacketType;
    SpecificPacket: any;
}
