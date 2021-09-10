export interface Connect {
    ClientType: ConnectTypes;
    Name: string;
    UserId: string;
    ClientVersion: number;
    Password: string;
}

export enum ConnectTypes {
    Player,
    Coordinator,
    TemporaryConnection
}