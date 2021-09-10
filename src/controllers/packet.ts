import { v4 as uuidv4 } from "uuid";

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

    }
}

export enum PacketType {
    Acknowledgement,
    Command,
    Connect,
    ConnectResponse,
    Event,
    File,
    ForwardingPacket,
    LoadedSong,
    LoadSong,
    PlaySong,
    Response,
    ScoreRequest,
    ScoreRequestResponse,
    SongFinished,
    SongList,
    SubmitScore
}