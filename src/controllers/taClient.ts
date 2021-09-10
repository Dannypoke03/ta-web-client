import type { ConnectResponse } from "../models/TA/connectResponse";
import type { Coordinator } from "../models/TA/coordinator";
import type { Match } from "../models/TA/match";
import type { Player } from "../models/TA/player";
import type { QualifierEvent } from "../models/TA/qualifierEvent";
import type { State } from "../models/TA/state";
import type { User } from "../models/TA/User";

export class TAClient {
    Self: User;
    State: State;

    constructor(connectResponse: ConnectResponse) {
        this.State = connectResponse.State;
        this.Self = connectResponse.Self;
    }

    coordinatorAdded(data: Coordinator) {
        let index = this.State.Coordinators.findIndex(x => x.Id === data.Id);
        if (index === -1) this.State.Coordinators.push(data);
    }

    coordinatorLeft(data: Coordinator) {
        let index = this.State.Coordinators.findIndex(x => x.Id === data.Id);
        if (index > -1) this.State.Coordinators.splice(index, 1);
    }

    matchCreated(match: Match) {
        if (!this.State.Matches.find(x => x.Guid === match.Guid)) this.State.Matches.push(match);
    }

    matchUpdated(match: Match) {
        let index = this.State.Matches.findIndex(x => x.Guid === match.Guid);
        if (index > -1) this.State.Matches[index] = match;
    }

    matchDeleted(match: Match) {
        let index = this.State.Matches.findIndex(x => x.Guid === match.Guid);
        if (index > -1) this.State.Matches.splice(index, 1);
    }

    playerAdded(player: Player) {
        this.State.Players.push(player);
    }

    playerUpdated(player: Player) {
        let index = this.State.Players.findIndex(x => x.Id === player.Id);
        if (index > -1) this.State.Players[index] = player;
        // update player in match
        let matches = this.State.Matches.filter(x => x.Players.some(y => y.Id === player.Id));
        for (const match of matches) {
            let p = match.Players.findIndex(x => x.Id === player.Id);
            if (p > -1) this.State.Matches[this.State.Matches.indexOf(match)].Players[p] = player;
        }
    }

    playerLeft(player: Player) {
        let index = this.State.Players.findIndex(x => x.Id === player.Id);
        if (index > -1) this.State.Players.splice(index, 1);
    }

    qualifierEventCreated(event: QualifierEvent) {
        let index = this.State.Events.findIndex(x => x.EventId === event.EventId);
        if (index === -1) this.State.Events.push(event);
    }

    qualifierEventUpdated(event: QualifierEvent) {
        let index = this.State.Events.findIndex(x => x.EventId === event.EventId);
        if (index > -1) this.State.Events[index] = event;
    }

    qualifierEventDeleted(event: QualifierEvent) {
        let index = this.State.Events.findIndex(x => x.EventId === event.EventId);
        if (index > -1) this.State.Events.splice(index, 1);
    }
}