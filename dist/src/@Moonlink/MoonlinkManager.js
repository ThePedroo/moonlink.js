"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MoonlinkManager = void 0;
const node_events_1 = require("node:events");
const MoonlinkNodes_1 = require("./MoonlinkNodes");
const MoonlinkPlayers_1 = require("./MoonlinkPlayers");
const MoonlinkTrack_1 = require("../@Rest/MoonlinkTrack");
const Spotify_1 = require("../@Sources/Spotify");
const Plugin_1 = require("../@Rest/Plugin");
/**
 * Creates a new MoonlinkManager instance.
 * @param {Nodes[]} nodes - An array of objects containing information about the Lavalink nodes.
 * @param {Options} options - An object containing options for the MoonlinkManager.
 * @param {Function} sPayload - A function to send payloads to the Lavalink nodes.
 * @returns {MoonlinkManager} - The new MoonlinkManager instance.
 * @throws {Error} - If the nodes parameter is empty or not an array.
 * @throws {Error} - If there are no parameters with node information in the nodes object.
 * @throws {Error} - If the clientName option is not set correctly.
 * @throws {RangeError} - If a plugin is not compatible.
 */
class MoonlinkManager extends node_events_1.EventEmitter {
    _nodes;
    _sPayload;
    initiated;
    options;
    nodes;
    spotify;
    clientId;
    version;
    map = new Map();
    constructor(nodes, options, sPayload) {
        super();
        if (!nodes)
            throw new Error('[ @Moonlink/Manager ]: "nodes" option is empty');
        if (nodes && !Array.isArray(nodes))
            throw new Error('[ @Moonlink/Manager ]: the "nodes" option has to be in an array');
        if (nodes && nodes.length == 0)
            throw new Error('[ @Moonlink/Manager ]: there are no parameters with "node(s)" information in the object');
        if (options &&
            typeof options.clientName !== "string" &&
            typeof options.clientName !== "undefined")
            throw new Error('[ @Moonlink/Manager ]: clientName option of the "options" parameter must be in string format');
        if (!options.sortNode)
            options.sortNode = "players";
        if (!options.custom)
            options.custom = {};
        if (options.plugins) {
            options.plugins.forEach((plugin) => {
                if (!(plugin instanceof Plugin_1.Plugin))
                    throw new RangeError(`[ @Moonlink/Manager ]: this plugin is not compatible`);
                plugin.load(this);
            });
        }
        this._nodes = nodes;
        this._sPayload = sPayload;
        this.options = options;
        this.nodes = new Map();
        this.spotify = new Spotify_1.Spotify(options.spotify, this);
        this.version = require("../../index").version;
    }
    /**
     * Initializes the MoonlinkManager by connecting to the Lavalink nodes.
     * @param {string} clientId - The ID of the Discord client.
     * @returns {MoonlinkManager} - The MoonlinkManager instance.
     * @throws {TypeError} - If the clientId option is empty.
     */
    init(clientId) {
        if (this.initiated)
            return this;
        if (!clientId)
            throw new TypeError('[ @Moonlink/Manager ]: "clientId" option is required.');
        this.clientId = clientId;
        this._nodes.forEach((node) => this.addNode(node));
        this.initiated = true;
        return this;
    }
    /**
     * Adds a new Lavalink node to the MoonlinkManager.
     * @param {Node} node - An object containing information about the Lavalink node.
     * @returns {Node} - The added node.
     * @throws {Error} - If the host option is not configured correctly.
     * @throws {Error} - If the password option is not set correctly.
     * @throws {Error} - If the port option is not set correctly.
     */
    addNode(node) {
        const new_node = new MoonlinkNodes_1.MoonlinkNode(this, node, this.map);
        if (node.identifier)
            this.nodes.set(node.identifier, new_node);
        else
            this.nodes.set(node.host, new_node);
        new_node.init();
        return new_node;
    }
    /**
     * Sorts the connected Lavalink nodes based on the specified criteria and returns the sorted nodes array.
     * @param sortType - The criteria by which to sort the nodes (e.g., "memory", "cpuLavalink", "cpuSystem", "calls", "playingPlayers", "players").
     * @returns The sorted array of nodes based on the specified criteria.
     */
    sortByUsage(sortType) {
        const connectedNodes = [...this.nodes.values()].filter((node) => node.isConnected);
        if (connectedNodes.length == 0)
            throw new TypeError("[ @Moonlink/Manager ]: No lavalink server connected");
        switch (sortType) {
            case "memory":
                return this.sortNodesByMemoryUsage(connectedNodes);
            case "cpuLavalink":
                return this.sortNodesByLavalinkCpuLoad(connectedNodes);
            case "cpuSystem":
                return this.sortNodesBySystemCpuLoad(connectedNodes);
            case "calls":
                return this.sortNodesByCalls(connectedNodes);
            case "playingPlayers":
                return this.sortNodesByPlayingPlayers(connectedNodes);
            case "players":
            default:
                return this.sortNodesByPlayers(connectedNodes);
        }
    }
    /**
     * Sorts the connected Lavalink nodes by memory usage and returns the sorted nodes array.
     * @param nodes - The connected Lavalink nodes to sort.
     * @returns The sorted array of nodes by memory usage.
     */
    sortNodesByMemoryUsage(nodes) {
        return nodes.sort((a, b) => (a.stats?.memory?.used || 0) - (b.stats?.memory?.used || 0));
    }
    /**
     * Sorts the connected Lavalink nodes by Lavalink CPU load and returns the sorted nodes array.
     * @param nodes - The connected Lavalink nodes to sort.
     * @returns The sorted array of nodes by Lavalink CPU load.
     */
    sortNodesByLavalinkCpuLoad(nodes) {
        return nodes.sort((a, b) => (a.stats?.cpu?.lavalinkLoad || 0) - (b.stats?.cpu?.lavalinkLoad || 0));
    }
    /**
     * Sorts the connected Lavalink nodes by system CPU load and returns the sorted nodes array.
     * @param nodes - The connected Lavalink nodes to sort.
     * @returns The sorted array of nodes by system CPU load.
     */
    sortNodesBySystemCpuLoad(nodes) {
        return nodes.sort((a, b) => (a.stats?.cpu?.systemLoad || 0) - (b.stats?.cpu?.systemLoad || 0));
    }
    /**
     * Sorts the connected Lavalink nodes by the number of calls and returns the sorted nodes array.
     * @param nodes - The connected Lavalink nodes to sort.
     * @returns The sorted array of nodes by the number of calls.
     */
    sortNodesByCalls(nodes) {
        return nodes.sort((a, b) => a.calls - b.calls);
    }
    /**
     * Sorts the connected Lavalink nodes by the number of playing players and returns the sorted nodes array.
     * @param nodes - The connected Lavalink nodes to sort.
     * @returns The sorted array of nodes by the number of playing players.
     */
    sortNodesByPlayingPlayers(nodes) {
        return nodes.sort((a, b) => (a.stats?.playingPlayers || 0) - (b.stats?.playingPlayers || 0));
    }
    /**
     * Sorts the connected Lavalink nodes by the number of total players and returns the sorted nodes array.
     * @param nodes - The connected Lavalink nodes to sort.
     * @returns The sorted array of nodes by the number of total players.
     */
    sortNodesByPlayers(nodes) {
        return nodes.sort((a, b) => (a.stats?.players || 0) - (b.stats?.players || 0));
    }
    /**
     * Removes a Lavalink node from the MoonlinkManager.
     * @param {string} name - The name or identifier of the node to remove.
     * @returns {boolean} - True if the node is removed, false otherwise.
     * @throws {Error} - If the name option is empty.
     */
    removeNode(name) {
        if (!name)
            throw new Error('[ @Moonlink/Manager ]: option "name" is empty');
        let node = this.nodes.get(name);
        if (!node)
            return false;
        this.nodes.delete(name);
        return true;
    }
    packetUpdate(packet) {
        if (!["VOICE_STATE_UPDATE", "VOICE_SERVER_UPDATE"].includes(packet.t))
            return;
        const update = packet.d;
        let player = this.players.get(update.guild_id);
        if (!update || (!("token" in update) && !("session_id" in update)))
            return;
        if ("t" in packet && "VOICE_SERVER_UPDATE".includes(packet.t)) {
            let voiceServer = {};
            voiceServer[update.guild_id] = {
                event: update,
            };
            this.map.set("voiceServer", voiceServer);
            return this.attemptConnection(update.guild_id);
        }
        if ("t" in packet && "VOICE_STATE_UPDATE".includes(packet.t)) {
            if (update.user_id !== this.clientId)
                return;
            if (!player)
                return;
            if (!update.channel_id) {
                this.emit("playerDisconnect", player);
                let players = this.map.get("players") || {};
                players[update.guild_id] = {
                    ...players[update.guild_id],
                    connected: false,
                    voiceChannel: null,
                    playing: false,
                };
                player.connected = false;
                player.voiceChannel = null;
                player.playing = false;
                player.stop();
            }
            if (update.channel_id !== player.voiceChannel) {
                this.emit("playerMove", player, update.channel_id, player.voiceChannel);
                let players = this.map.get("players") || {};
                players[update.guild_id] = {
                    ...players[update.guild_id],
                    voiceChannel: update.channel_id,
                };
                this.map.set("players", players);
                player.voiceChannel = update.channel_id;
            }
            let voiceStates = {};
            voiceStates[update.guild_id] = update;
            this.map.set("voiceStates", voiceStates);
            return this.attemptConnection(update.guild_id);
        }
    }
    /**
     * Searches for tracks using the specified query and source.
     * @param {string | SearchQuery} options - The search query or an object containing the search options.
     * @returns {Promise<SearchResult>} - A promise that resolves with the search result.
     * @throws {Error} - If the search option is empty or not in the correct format.
     */
    async search(options) {
        return new Promise(async (resolve, reject) => {
            try {
                if (!options) {
                    throw new Error("[ @Moonlink/Manager ]: the search option has to be in string format or in an array");
                }
                let query;
                let source;
                if (typeof options === "object") {
                    ({ query, source } = options);
                }
                else {
                    query = options;
                }
                if (source && typeof source !== "string") {
                    throw new Error("[ @Moonlink/Manager ]: the source option has to be in string format");
                }
                if (typeof query !== "string" && typeof query !== "object") {
                    throw new Error("[ @Moonlink/Manager ]: (search) the search option has to be in string or array format");
                }
                const sources = {
                    youtube: "ytsearch",
                    youtubemusic: "ytmsearch",
                    soundcloud: "scsearch",
                    spotify: "spotify",
                };
                if (this.spotify.isSpotifyUrl(query)) {
                    return resolve(await this.spotify.resolve(query));
                }
                let searchIdentifier;
                if (query &&
                    !query.startsWith("http://") &&
                    !query.startsWith("https://")) {
                    if (source && !sources[source]) {
                        this.emit("debug", "[ Moonlink/Manager]: no default found, changing to custom source");
                        searchIdentifier = `${source}:${query}`;
                    }
                    else {
                        searchIdentifier = `ytsearch:${query}`;
                        if (source && sources[source])
                            searchIdentifier = `${sources[source]}:${query}`;
                    }
                }
                else {
                    searchIdentifier = `${query}`;
                }
                const params = new URLSearchParams({ identifier: searchIdentifier });
                const res = await this.sortByUsage("memory")[0].request("loadtracks", params);
                if (res.loadType === "error" || res.loadType === "empty") {
                    this.emit("debug", "[ @Moonlink/Manager ]: not found or there was an error loading the track");
                    return resolve(res);
                }
                if (res.loadType === "track") {
                    res.data = [res.data];
                }
                if (res.loadType === "playlist") {
                    res.playlistInfo = {
                        duration: res.data.tracks.reduce((acc, cur) => acc + cur.info.length, 0),
                        name: res.data.info.name,
                        selectedTrack: res.data.info.selectedTrack,
                    };
                    res.pluginInfo = res.data.pluginInfo;
                    res.data = [...res.data.tracks];
                }
                const tracks = res.data.map((x) => new MoonlinkTrack_1.MoonlinkTrack(x));
                return resolve({
                    ...res,
                    tracks,
                });
            }
            catch (error) {
                this.emit("debug", `[ @Moonlink/Manager ]: An error occurred: ${error.message}`);
                reject(error);
            }
        });
    }
    async attemptConnection(guildId) {
        let voiceServer = this.map.get("voiceServer") || {};
        let voiceStates = this.map.get("voiceStates") || {};
        let players = this.map.get("players") || {};
        if (!players[guildId])
            return false;
        if (!voiceServer[guildId])
            return false;
        this.emit("debug", `[ @Moonlink/Manager ]: sending to lavalink, player data from server (${guildId})`);
        await this.nodes.get(players[guildId].node).rest.update({
            guildId,
            data: {
                voice: {
                    sessionId: voiceStates[guildId].session_id,
                    endpoint: voiceServer[guildId].event.endpoint,
                    token: voiceServer[guildId].event.token,
                },
            },
        });
        return true;
    }
    get players() {
        let has = (guildId) => {
            let players = this.map.get("players") || {};
            if (players[guildId])
                players = true;
            else
                players = false;
            return players;
        };
        let get = (guildId) => {
            if (!guildId && typeof guildId !== "string")
                throw new Error('[ @Moonlink/Manager ]: "guildId" option in parameter to get player is empty or type is different from string');
            if (!has(guildId))
                return null;
            if (this.options.custom.player) {
                this.emit("debug", "[ @Moonlink/Custom ]: the player is customized");
                return new this.options.custom.player(this.map.get("players")[guildId], this, this.map);
            }
            return new MoonlinkPlayers_1.MoonlinkPlayer(this.map.get("players")[guildId], this, this.map);
        };
        /**
         * Creates a new MoonlinkPlayer instance or gets an existing player for the specified guild.
         * @param {createOptions} data - The options for creating the player.
         * @returns {MoonlinkPlayer | null} - The MoonlinkPlayer instance or null if the guild does not have a player.
         * @throws {Error} - If the data parameter is not an object.
         * @throws {Error} - If the guildId option is empty or not a string.
         * @throws {Error} - If the textChannel option is empty or not a string.
         * @throws {Error} - If the voiceChannel option is empty or not a string.
         * @throws {TypeError} - If the autoPlay option is not a boolean.
         */
        let create = (data) => {
            if (typeof data !== "object")
                throw new Error('[ @Moonlink/Manager ]: parameter "data" is not an object');
            if (!data.guildId && typeof data.guildId !== "string")
                throw new Error('[ @Moonlink/Manager ]: "guildId" parameter in player creation is empty or not string type');
            if (!data.textChannel && typeof data.textChannel !== "string")
                throw new Error('[ @Moonlink/Manager ]: "textChannel" parameter in player creation is empty or not string type');
            if (!data.voiceChannel && typeof data.voiceChannel !== "string")
                throw new Error('[ @Moonlink/Manager ]: "voiceChannel" parameter in player creation is empty or not string type');
            if (data.autoPlay && typeof data.autoPlay !== "boolean")
                throw new Error("[ @Moonlink/Manager ]: autoPlay parameter of player creation has to be boolean type");
            if (data.node && typeof data.node !== "string")
                throw new Error("[ @Moonlink/Manager ]: node parameter of player creation has to be string type");
            if (has(data.guildId))
                return get(data.guildId);
            let players_map = this.map.get("players") || {};
            players_map[data.guildId] = {
                guildId: data.guildId,
                textChannel: data.textChannel,
                voiceChannel: data.voiceChannel,
                volume: data.volume || 80,
                playing: false,
                connected: false,
                paused: false,
                shuffled: false,
                loop: null,
                autoPlay: false,
                node: data.node
                    ? data.node
                    : this.sortByUsage(`${this.options.sortNode ? this.options.sortNode : "players"}`)[0]?.host,
            };
            this.map.set("players", players_map);
            if (this.options.custom.player) {
                this.emit("debug", "[ @Moonlink/Custom ]: the player is customized");
                return new this.options.custom.player(players_map[data.guildId], this, this.map);
            }
            return new MoonlinkPlayers_1.MoonlinkPlayer(players_map[data.guildId], this, this.map);
        };
        let all = this.map.get("players") ? this.map.get("players") : null;
        return {
            create: create.bind(this),
            get: get.bind(this),
            has: has.bind(this),
            all,
        };
    }
}
exports.MoonlinkManager = MoonlinkManager;
//# sourceMappingURL=MoonlinkManager.js.map