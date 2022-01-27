import { v4 as uuidv4 } from "uuid";
import type { PacketType } from "../models/TA/packetType";

export class Packet {
    Size: number = 0;
    SpecificPacketSize: number = 44;
    Id: string = uuidv4();
    From: string = uuidv4();

    Type: PacketType;
    SpecificPacket: object;

    constructor(specificPacket: any, type: PacketType) {
        this.Type = type;
        this.SpecificPacket = specificPacket;
        this.Size = JSON.stringify(this).length;
    }
}