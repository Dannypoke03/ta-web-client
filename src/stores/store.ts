import { writable } from 'svelte/store';
import type { FakePlayer } from '../controllers/fakePlayer';
import type { TAWebsocket } from '../controllers/taWebsocket';
import type { Match } from '../models/TA/match';

export const taWS = writable<TAWebsocket | null>(null);
export const fakePlayers = writable<FakePlayer | null>(null);
export const curentMatch = writable<Match | null>(null);
export const modal = writable(null);