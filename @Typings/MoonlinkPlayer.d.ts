export class MoonPlayer {
    constructor(infos: any, manager: any);
    guildId: any;
    textChannel: any;
    voiceChannel: any;
    playing: any;
    connected: any;
    paused: any;
    loop(number: any): void;
    volume: any;
    current: any;
    queue: MoonQueue;
    filters: MoonFilters;
    connect(options: any): void;
    disconnect(): void;
    play(): void;
    pause(): void;
    resume(): void;
    setVolume(percent: any): void;
    stop(): boolean;
    destroy(): boolean;
    skip(): boolean;
    seek(number: any): boolean;
    removeSong(position: any): boolean;
    skipTo(position: any): void;
    #private;
}
import { MoonQueue } from "../@Rest/MoonlinkQueue.js";
import { MoonFilters } from "../@Rest/MoonlinkFilters.js";
