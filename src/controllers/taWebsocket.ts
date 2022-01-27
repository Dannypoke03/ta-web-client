import { Connect, ConnectTypes } from "../models/TA/connect";
import { wsHandler } from "./wsClient";
import Cookies from "js-cookie";
import { Packet } from "./packet";
import type { ConnectResponse } from "../models/TA/connectResponse";
import { ResponseType } from "../models/TA/response";
import { get, Unsubscriber } from "svelte/store";
import { EventType, TAEvent } from "../models/TA/event";
import type { Match } from "../models/TA/match";
import type { Player } from "../models/TA/player";
import { TAClient } from "./taClient";
import { curentMatch, taWS } from "../stores/store";
import { v4 as uuidv4 } from "uuid";
import { PacketType } from "../models/TA/packetType";

export class TAWebsocket {

    uName: string;
    address: string;
    password: string;

    ws: wsHandler;

    connected = false;
    client: TAClient;

    unsub: Unsubscriber;

    constructor(cUname: string, cAddress: string, cPassword?: string) {
        try {
            this.ws = new wsHandler(cAddress);
            this.address = cAddress;
            this.password = cPassword
            this.uName = cUname;
        } catch (error) {
            throw new Error("Websocket connection failed");
        }
    }

    connect() {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                reject("Failed to connect");
            }, 15000);
            this.ws.socket.onopen = () => {
                let packetData: Connect = {
                    ClientType: ConnectTypes.Coordinator,
                    Name: this.uName,
                    UserId: Cookies.get("UserId") || "0",
                    ClientVersion: 36,
                    Password: this.password
                };
                let packet = new Packet(packetData, PacketType.Connect);
                this.ws.send(packet);
                let unsub = this.ws.subscribe((msg) => {
                    try {
                        let packet: Packet = JSON.parse(msg);
                        if (packet.Type === PacketType.ConnectResponse && (packet.SpecificPacket as ConnectResponse).Type === ResponseType.Success) {
                            let connectResponse = packet.SpecificPacket as ConnectResponse;
                            this.client = new TAClient(connectResponse);
                            this.connected = true;
                            unsub();
                            this.initPacketHandler();
                            return resolve("Connected");
                        }
                    } catch (error) { }
                });
            };
        });
    }

    createMatch(players: Player[]) {
        let match: Match = {
            Guid: uuidv4(),
            Players: players,
            Leader: this.client.Self,
            SelectedDifficulty: 0,
        };
        let SpecificPacket: TAEvent = {
            Type: EventType.MatchCreated,
            ChangedObject: match,
        };
        this.ws.send(new Packet(SpecificPacket, PacketType.Event));
        curentMatch.set(match);
        return;
    }

    closeMatch(match: Match) {
        let SpecificPacket: TAEvent = {
            Type: EventType.MatchDeleted,
            ChangedObject: match,
        };
        this.ws.send(new Packet(SpecificPacket, PacketType.Event));
        curentMatch.set(null);
    }

    initPacketHandler() {
        this.unsub = this.ws.subscribe((msg) => {
            try {
                let packet: Packet = JSON.parse(msg);
                this.handlePacket(packet);
            } catch (error) { }
        });
        this.ws.socket.onclose = (e: any) => {
            console.error(e);
            taWS.set(null);
            alert("Disconnected from server");
        };
    }

    handlePacket(packet: Packet) {
        // console.log(packet);
        if (packet.Type == PacketType.ConnectResponse) {
            // should already be connected
        } else if (packet.Type == PacketType.Event && this.connected) {
            let event = packet.SpecificPacket as TAEvent;
            switch (event.Type) {
                case EventType.CoordinatorAdded:
                    this.client.coordinatorAdded(event.ChangedObject);
                    break;
                case EventType.CoordinatorLeft:
                    this.client.coordinatorLeft(event.ChangedObject);
                    break;
                case EventType.MatchCreated:
                    var match: Match = event.ChangedObject;
                    this.client.matchCreated(match);
                    break;
                case EventType.MatchUpdated:
                    var match: Match = event.ChangedObject;
                    this.client.matchUpdated(event.ChangedObject);
                    this.matchUpdate(match);
                    break;
                case EventType.MatchDeleted:
                    this.client.matchDeleted(event.ChangedObject);
                    taWS.set(this);
                    this.matchClosed(event.ChangedObject);
                    break;
                case EventType.PlayerAdded:
                    this.client.playerAdded(event.ChangedObject);
                    break;
                case EventType.PlayerUpdated:
                    this.client.playerUpdated(event.ChangedObject);
                    break;
                case EventType.PlayerLeft:
                    this.client.playerLeft(event.ChangedObject);
                    break;
                case EventType.QualifierEventCreated:
                    this.client.qualifierEventCreated(event.ChangedObject);
                    break;
                case EventType.QualifierEventUpdated:
                    this.client.qualifierEventUpdated(event.ChangedObject);
                    break;
                case EventType.QualifierEventDeleted:
                    this.client.qualifierEventDeleted(event.ChangedObject);
                    break;
                default:
                    break;
            }
        } else if (packet.Type == PacketType.SubmitScore) {

        } else if (packet.Type == PacketType.ForwardingPacket) {
            this.handlePacket(packet.SpecificPacket as Packet);
        } else if (packet.Type == PacketType.SongFinished) {

        }
        // for reactivity
        taWS.set(this);
        if (get(curentMatch)) {
            // console.log(this.client.State.Matches.find(x => x.Guid === get(curentMatch).Guid));
            curentMatch.set(this.client.State.Matches.find(x => x.Guid === get(curentMatch).Guid));
        }
    }

    matchClosed(match: Match) {
        if (match.Guid === get(curentMatch).Guid) {
            curentMatch.set(null);
        }
    }

    matchUpdate(match: Match) {
        if (match.Guid === get(curentMatch).Guid) {
            curentMatch.set(match);
        }
    }

    disconnect() {
        let SpecificPacket: TAEvent = {
            Type: EventType.CoordinatorLeft,
            ChangedObject: this.client.Self,
        };
        this.ws.send(new Packet(SpecificPacket, PacketType.Event));
        this.ws.close();
        this.unsub();
        taWS.set(null);
    }


}