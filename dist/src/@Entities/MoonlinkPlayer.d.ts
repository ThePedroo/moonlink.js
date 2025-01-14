import { MoonlinkManager, MoonlinkQueue, MoonlinkNode, MoonlinkTrack, MoonlinkFilters } from "../../index";
import { IPlayerData, connectOptions } from "../@Typings";
export declare class MoonlinkPlayer {
    manager: MoonlinkManager;
    guildId: string;
    textChannel: string;
    voiceChannel: string;
    voiceRegion: string;
    autoPlay: boolean | null;
    autoLeave: boolean | null;
    connected: boolean | null;
    playing: boolean | null;
    paused: boolean | null;
    loop: number | null;
    volume: number;
    ping: number;
    queue: MoonlinkQueue;
    filters: MoonlinkFilters;
    current: Record<string, any>;
    previous: MoonlinkTrack[] | MoonlinkTrack | Record<string, any>;
    data: Record<string, any>;
    node: MoonlinkNode | any;
    constructor(data: IPlayerData);
    set(key: string, value: unknown): void;
    get<T>(key: string): T;
    setTextChannel(channelId: string): boolean;
    setVoiceChannel(channelId: string): boolean;
    setAutoLeave(mode?: boolean | null): boolean | null;
    setAutoPlay(mode: boolean): boolean;
    connect(options: connectOptions): boolean | null;
    disconnect(): boolean;
    restart(): Promise<void>;
    play(track?: MoonlinkTrack | string): Promise<boolean>;
    pause(): Promise<boolean>;
    resume(): Promise<boolean>;
    private updatePlaybackStatus;
    stop(destroy?: boolean): Promise<boolean>;
    skip(position?: number): Promise<boolean>;
    setVolume(percent: number): Promise<number>;
    setLoop(mode: number | string | null): number | string | null;
    destroy(): Promise<boolean>;
    private validateNumberParam;
    seek(position: number): Promise<number | null>;
    shuffle(): boolean;
}
