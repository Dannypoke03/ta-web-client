import { writable } from 'svelte/store';

export class wsHandler {
    socket: WebSocket;

    messageStore = writable('');

    constructor(address: string) {
        this.socket = new WebSocket('ws://' + address);
        this.socket.addEventListener("message", (e) => this.onMessage(e));
    }

    onMessage(event: { data: string; }) {
        this.messageStore.set(event.data);
    }

    close() {
        this.socket.removeEventListener("message", (e) => this.onMessage(e));
        this.socket.close();
    }

    sendMessage(message: string) {
        if (this.socket.readyState <= 1) {
            this.socket.send(message);
        }
    }

    send(message: object) {
        this.sendMessage(JSON.stringify(message));
    }

    public subscribe = this.messageStore.subscribe;
}