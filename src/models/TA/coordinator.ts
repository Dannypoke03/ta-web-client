import type { User } from './User';

export interface Coordinator extends User {
    GetIcon: string;
    UserId: string;
}