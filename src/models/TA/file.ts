export interface File {
    FileId: string;
    Intent: Intentions;
    Compressed: boolean;
    Data: any;
}

export enum Intentions {
    None,
    SetPngToShowWhenTriggered,
    ShowPngImmediately
}