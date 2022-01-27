import { DownloadStates, PlayStates } from "../models/TA/player";
import type { Player } from "../models/TA/player";
import { fakePlayers, taWS } from "../stores/store";
import { get, Unsubscriber } from "svelte/store";
import { Packet } from "./packet";
import { PacketType } from "../models/TA/packetType";
import { EventType, TAEvent } from "../models/TA/event";
import { Connect, ConnectTypes } from "../models/TA/connect";
import { TAWebsocket } from "./taWebsocket";
import type { ConnectResponse } from "../models/TA/connectResponse";
import { ResponseType } from "../models/TA/response";
import { TAClient } from "./taClient";
import type { Match } from "../models/TA/match";
import type { ForwardingPacket } from "../models/TA/forwardingPacket";
import { CompletionType, SongFinished } from "../models/TA/songFinished";
import { v4 as uuidv4 } from "uuid";
import type { Message } from "../models/TA/message";
import type { MessageResponse } from "../models/TA/messageResponse";


export class FakePlayer {

    userId: string;
    taCon = new TAWebsocket('Test Player', get(taWS).address, get(taWS).password);

    private _wsSub: Unsubscriber;
    private _client: TAClient;
    private _player: Player;

    displayMessage: Message | null = null;

    constructor(id: string) {
        this.userId = id;
        this._wsSub = this.taCon.ws.subscribe(msg => {
            try {
                let packet: Packet = JSON.parse(msg);
                if (packet.Type === PacketType.ConnectResponse && (packet.SpecificPacket as ConnectResponse).Type === ResponseType.Success) {
                    let connectResponse = packet.SpecificPacket as ConnectResponse;
                    this._client = new TAClient(connectResponse);
                    this._wsSub();
                    this.initPacketHandler();
                }
            } catch (error) { }
        });
    }

    private initPacketHandler() {
        this._wsSub = this.taCon.ws.subscribe((msg) => {
            try {
                let packet: Packet = JSON.parse(msg);
                this.handlePacket(packet);
            } catch (error) { }
        });
        this.taCon.ws.socket.onclose = (e: any) => {
            console.error(e);
        };
        this._player = {
            Id: this._client.Self.Id,
            Name: "Test Player",
            UserId: this.userId,
            Team: {
                Id: uuidv4(),
                Name: "Test"
            },
            PlayState: PlayStates.Waiting,
            DownloadState: DownloadStates.None,
            Score: 0,
            Combo: 0,
            Misses: 0,
            Accuracy: 0,
            SongPosition: 0,
            SongList: null,
            ModList: [],
            StreamScreenCoordinates: {
                x: 0,
                y: 0
            },
            StreamDelayMs: 0,
            StreamSyncStartMs: 0,
        }
        console.log(this._player);
    }

    private handlePacket(packet: Packet) {
        // console.log(packet);
        if (packet.Type == PacketType.ConnectResponse) {
            // should already be connected
        } else if (packet.Type == PacketType.Event) {
            let event = packet.SpecificPacket as TAEvent;
            switch (event.Type) {
                case EventType.CoordinatorAdded:
                    this._client.coordinatorAdded(event.ChangedObject);
                    break;
                case EventType.CoordinatorLeft:
                    this._client.coordinatorLeft(event.ChangedObject);
                    break;
                case EventType.MatchCreated:
                    var match: Match = event.ChangedObject;
                    this._client.matchCreated(match);
                    break;
                case EventType.MatchUpdated:
                    var match: Match = event.ChangedObject;
                    this._client.matchUpdated(event.ChangedObject);
                    break;
                case EventType.MatchDeleted:
                    this._client.matchDeleted(event.ChangedObject);
                    break;
                case EventType.PlayerAdded:
                    this._client.playerAdded(event.ChangedObject);
                    break;
                case EventType.PlayerUpdated:
                    this._client.playerUpdated(event.ChangedObject);
                    break;
                case EventType.PlayerLeft:
                    this._client.playerLeft(event.ChangedObject);
                    break;
                case EventType.QualifierEventCreated:
                    this._client.qualifierEventCreated(event.ChangedObject);
                    break;
                case EventType.QualifierEventUpdated:
                    this._client.qualifierEventUpdated(event.ChangedObject);
                    break;
                case EventType.QualifierEventDeleted:
                    this._client.qualifierEventDeleted(event.ChangedObject);
                    break;
                default:
                    break;
            }
        } else if (packet.Type == PacketType.SubmitScore) {

        } else if (packet.Type == PacketType.ForwardingPacket) {
            let pkt = packet.SpecificPacket as ForwardingPacket;
            if (pkt.ForwardTo.includes(this._client.Self.Id)) {
                this.handlePacket(packet.SpecificPacket as Packet);
            }
        } else if (packet.Type == PacketType.LoadSong) {
            this._player.DownloadState = DownloadStates.Downloaded;
            this._playerUpdate();
        } else if (packet.Type === PacketType.PlaySong) {
            this._player.PlayState = PlayStates.InGame;
            this._playerUpdate();
            setTimeout(() => {
                this._songFinished();
            }, 3000);
        } else if (packet.Type === PacketType.Message) {
            this.displayMessage = packet.SpecificPacket as Message;
            fakePlayers.set(this);
        }
    }

    sendResponse(message: Message, value: string) {
        let msgResponse: MessageResponse = {
            PacketId: message.Id,
            Value: value
        }
        this.taCon.ws.send(new Packet(msgResponse, PacketType.MessageResponse));
        this.displayMessage = null;
        fakePlayers.set(this);
    }

    closeMessage() {
        this.displayMessage = null;
        fakePlayers.set(this);
    }

    private _songFinished() {
        let match = this._client.State.Matches.find(m => m.Players.map(x => x.Id).includes(this._player.Id));
        if (!match) return;
        let songFin: SongFinished = {
            User: this._player,
            Beatmap: {
                Name: match.SelectedLevel.Name,
                LevelId: match.SelectedLevel.LevelId,
                Characteristic: match.SelectedCharacteristic,
                Difficulty: match.SelectedDifficulty,
            },
            Type: CompletionType.Quit,
            Score: 1234
        }
        console.log(songFin);
        this.taCon.ws.send(new Packet(songFin, PacketType.SongFinished, this._player.Id));
    }

    private _playerUpdate() {
        let event: TAEvent = {
            Type: EventType.PlayerUpdated,
            ChangedObject: this._player
        }
        this.taCon.ws.send(new Packet(event, PacketType.Event));
    }

    connect() {
        let connect: Connect = {
            ClientType: ConnectTypes.Player,
            Name: "Test Player",
            UserId: this.userId,
            ClientVersion: 0o53,
            Password: get(taWS).password
        }
        this.taCon.ws.send(new Packet(connect, PacketType.Connect));
    }

    disconnect() {
        let event: TAEvent = {
            Type: EventType.PlayerLeft,
            ChangedObject: this._client.Self
        }
        this.taCon.ws.send(new Packet(event, PacketType.Event));
    }


}