import { MoonlinkManager, MoonlinkPlayer, MoonlinkFilters, MoonlinkDatabase, MoonlinkQueue, MoonlinkNode, MoonlinkTrack, Players, Nodes } from "../../index";
export type Constructor<T> = new (...args: any[]) => T;
export interface createOptions {
    guildId: string;
    textChannel: string;
    voiceChannel: string;
    autoPlay?: boolean | null;
    volume?: number;
    node?: string;
}
export type SortType = "memory" | "cpuLavalink" | "cpuSystem" | "calls" | "playingPlayers" | "players";
export interface VoiceState {
    op: "voiceUpdate";
    guildId: string;
    event: VoiceServer;
    sessionId?: string;
}
export interface VoiceServer {
    token: string;
    guild_id: string;
    endpoint: string;
}
export interface VoiceState {
    guild_id: string;
    user_id: string;
    session_id: string;
    channel_id: string;
}
export interface VoicePacket {
    t?: "VOICE_SERVER_UPDATE" | "VOICE_STATE_UPDATE";
    d: VoiceState | VoiceServer;
}
export type LoadType = "track" | "playlist" | "search" | "empty" | "error";
export interface TrackData {
    encoded?: string;
    info: TrackDataInfo;
    pluginInfo: object;
}
export interface TrackDataInfo {
    title: string;
    identifier: string;
    author: string;
    length: number;
    position: number;
    isSeekable: boolean;
    isStream: boolean;
    uri: string;
}
export type SearchPlatform = "youtube" | "youtubemusic" | "soundcloud";
export interface SearchQuery {
    source?: SearchPlatform | string | undefined | null;
    query: string;
    requester?: string | object | any;
}
export interface SearchResult {
    loadType: LoadType;
    tracks: MoonlinkTrack[];
    playlistInfo?: PlaylistInfo;
    exception?: {
        message: string;
        severity: string;
    };
}
export interface INodeStats {
    players: number;
    playingPlayers: number;
    uptime: number;
    memory: {
        reservable: number;
        used: number;
        free: number;
        allocated: number;
    };
    frameStats: {
        sent: number;
        deficit: number;
        nulled: number;
    };
    cpu: {
        cores: number;
        systemLoad: number;
        lavalinkLoad: number;
    };
}
export interface INode {
    host: string;
    identifier?: string;
    password: string;
    port: number;
    secure: boolean;
    retryAmount?: number;
    retryDelay?: number;
}
export interface IOptions {
    clientId?: string;
    clientName?: string;
    sortNode?: SortType;
    autoResume?: boolean;
    http2?: boolean;
}
export interface IHeaders {
    Authorization: string;
    "User-Id": string;
    "Client-Name": string;
}
export interface Extendable {
    MoonlinkManager: typeof MoonlinkManager;
    MoonlinkPlayer: typeof MoonlinkPlayer;
    MoonlinkDatabase: typeof MoonlinkDatabase;
    MoonlinkFilters: typeof MoonlinkFilters;
    MoonlinkQueue: typeof MoonlinkQueue;
    MoonlinkNode: typeof MoonlinkNode;
    MoonlinkTrack: typeof MoonlinkTrack;
    Players: typeof Players;
    Nodes: typeof Nodes;
}
export interface PlaylistInfo {
    name: string;
    selectedTrack?: MoonlinkTrack;
    duration: number;
}
export interface LavalinkResult {
    data: TrackData[];
    loadType: LoadType;
    exception?: {
        message: string;
        severity: string;
    };
    playlistInfo: {
        name: string;
        selectedTrack?: number;
    };
}
export interface VoiceOptions {
    endpoint: string;
    token: string;
    sessionId: string;
    connected?: boolean;
    ping?: number;
}
export type Endpoint = string;
export interface RestOptions {
    guildId: string;
    data: {
        encodedTrack?: string;
        identifier?: string;
        startTime?: number;
        endTime?: number;
        volume?: number;
        position?: number;
        paused?: Boolean;
        filters?: Object;
        voice?: VoiceOptions;
    };
}
export interface connectOptions {
    setMute?: boolean;
    setDeaf?: boolean;
}
export interface PlayerInfos {
    guildId: string;
    textChannel: string | null;
    voiceChannel: string | null;
    autoPlay?: boolean | null;
    autoLeave?: boolean | null;
    connected?: boolean | null;
    playing?: boolean | null;
    paused?: boolean | null;
    shuffled?: boolean | null;
    loop?: number | null;
    volume?: number | null;
    node?: string;
}
export interface TrackInfo {
    identifier: string;
    isSeekable: boolean;
    author: string;
    isStream: boolean;
    length: number;
    position: number;
    title: string;
    uri?: string;
    artworkUrl?: string | null;
    sourceName: string;
    isrc?: string;
}
export interface MoonlinkTrackOptions {
    info: TrackInfo;
    encoded?: string;
    pluginInfo?: object;
}
export interface Equalizer {
    band: number;
    gain: number;
}
export interface Karaoke {
    level?: number;
    monoLevel?: number;
    filterBand?: number;
    filterWidth?: number;
}
export interface Timescale {
    speed?: number;
    pitch?: number;
    rate?: number;
}
export interface Tremolo {
    frequency?: number;
    depth?: number;
}
export interface Vibrato {
    frequency?: number;
    depth?: number;
}
export interface Rotation {
    rotationHz?: number;
}
export interface Distortion {
    sinOffset?: number;
    sinScale?: number;
    cosOffset?: number;
    cosScale?: number;
    tanOffset?: number;
    tanScale?: number;
    offset?: number;
    scale?: number;
}
export interface ChannelMix {
    leftToLeft?: number;
    leftToRight?: number;
    rightToLeft?: number;
    rightToRight?: number;
}
export interface LowPass {
    smoothing?: number;
}