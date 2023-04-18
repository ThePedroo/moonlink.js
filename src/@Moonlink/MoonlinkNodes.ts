import WebSocket from "ws";
import { MoonlinkManager, Options, SearchResult } from "./MoonlinkManager";
import { MoonlinkPlayer, Track } from "./MoonlinkPlayers";
import { MoonlinkDatabase } from "../@Rest/MoonlinkDatabase";
import { MoonlinkRest } from "./MoonlinkRest";
import { MoonlinkTrack } from "../@Rest/MoonlinkTrack";
import { makeRequest } from "../@Rest/MakeRequest";
export declare interface Node {
  host: string;
  password?: string;
  port?: number;
  secure?: boolean;
  identifier?: string;
}
export interface NodeStats {
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

export class MoonlinkNode {
  public manager: MoonlinkManager;
  public host: string;
  public port: number;
  public password: string | null;
  public identifier: string | null;
  public secure: boolean | null;
  public version: string | number | unknown;
  public options: Options;
  public sPayload: Function;
  public socketUri: string | null;
  public restUri: any;
  public rest: MoonlinkRest;
  public resumed: boolean;
  public sessionId: string;
  public isConnected: boolean;
  public ws: WebSocket | null;
  public stats: NodeStats;
  public retryTime: number | null;
  public reconnectAtattempts: number | null;
  public reconnectTimeout: any;
  public calls: number;
  public retryAmount: number | null;
  public sendWs: Function;
  private node: Node;
  private map: Map<string, any[]>;
  private db: MoonlinkDatabase;
  constructor(manager: MoonlinkManager, node: Node, map: Map<string, any[]>) {
    this.manager = manager;
    this.map = map;
    this.node = node;
    this.host = node.host;
    this.port = node.port || null;
    this.secure = node.secure || null;
    this.options = this.manager.options;
    this.identifier = node.identifier || null;
    this.password = node.password || "youshallnotpass";
    this.calls = 0;
    this.retryTime = 30000;
    this.reconnectAtattempts = 0;
    this.retryAmount = 5;
    this.db = new MoonlinkDatabase();
    this.rest = new MoonlinkRest(this.manager, this);
    this.stats = {
      players: 0,
      playingPlayers: 0,
      uptime: 0,
      memory: {
        free: 0,
        used: 0,
        allocated: 0,
        reservable: 0,
      },
      cpu: {
        cores: 0,
        systemLoad: 0,
        lavalinkLoad: 0,
      },
      frameStats: {
        sent: 0,
        nulled: 0,
        deficit: 0,
      },
    };
    this.sendWs = (data: unknown): Promise<boolean> => {
      return new Promise((resolve, reject) => {
        if (!this.isConnected) return resolve(false);
        if (!data || !JSON.stringify(data).startsWith("{")) {
          return reject(false);
        }
        this.ws.send(JSON.stringify(data), (error) => {
          if (error) reject(error);
          else resolve(true);
        });
      });
    };
  }
  public request(endpoint: string, params: any): Promise<object> {
    this.calls++;
    return this.rest.get(`${endpoint}?${params}`);
  }
  public init(): void {
    this.manager.emit(
      "debug",
      "[ @Moonlink/Node ]: starting server connection process"
    );
    this.connect();
  }
  public async connect(): Promise<any> {
    if (typeof this.host !== "string" && typeof this.host !== "undefined")
      throw new Error(
        '[ @Moonlink/Node ]: "host" option is not configured correctly'
      );
    if (
      typeof this.password !== "string" &&
      typeof this.password !== "undefined"
    )
      throw new Error(
        '[ @Moonlink/Node ]: the option "password" is not set correctly'
      );
    if (
      (this.port && typeof this.port !== "number") ||
      this.port > 65535 ||
      this.port < 0
    )
      throw new Error(
        '[ @Moonlink/Node ]: the "port" option is not set correctly'
      );
    this.options.clientName
      ? this.options.clientName
      : (this.options.clientName = `Moonlink/${this.manager.version}`);
    this.version = await makeRequest(
      `http${this.secure ? `s` : ``}://${this.host}${
        this.port ? `:${this.port}` : ``
      }/version`,
      {
        method: "GET",
        headers: {
          Authorization: this.password,
        },
      }
    );
    let headers: any = {
      Authorization: this.password,
      "User-Id": this.manager.clientId,
      "Client-Name": this.options.clientName,
    };
    this.socketUri = `ws${this.secure ? "s" : ""}://${
      this.host ? this.host : "localhost"
    }${this.port ? `:${this.port}` : ":443"}${
      (this.version as string).replace(/\./g, "") >= "370"
        ? (this.version as string).replace(/\./g, "") >= "400"
          ? "/v4/websocket"
          : "/v3/websocket"
        : ""
    }`;
    this.restUri = `http${this.secure ? "s" : ""}://${
      this.host ? this.host : "localhost"
    }${this.port ? `:${this.port}` : ":443"}${
      (this.version as string).replace(/\./g, "") >= "370"
        ? (this.version as string).replace(/\./g, "") >= "400"
          ? "/v4/"
          : "/v3/"
        : ""
    }`;
    this.ws = new WebSocket(this.socketUri, undefined, { headers });
    this.ws.on("open", this.open.bind(this));
    this.ws.on("close", this.close.bind(this));
    this.ws.on("message", this.message.bind(this));
    this.ws.on("error", this.error.bind(this));
  }
  protected open(): void {
    if (this.reconnectTimeout) clearTimeout(this.reconnectTimeout);
    this.manager.emit(
      "debug",
      '[ @Moonlink/Nodes ]: a new node said "hello world!"'
    );
    this.manager.emit("nodeCreate", this);
    this.isConnected = true;
  }
  private reconnect(): void {
    if (this.reconnectAtattempts >= this.retryAmount) {
      this.manager.emit(
        "debug",
        "[ @Moonlink/Node ]: a node was destroyed due to inactivity"
      );
      this.manager.emit("nodeDestroy", this);
      this.ws.close(1000, "destroy");
      this.ws.removeAllListeners();
      this.manager.nodes.delete(this.identifier || this.host);
    } else {
      this.reconnectTimeout = setTimeout(() => {
        this.ws.removeAllListeners();
        this.ws = null;
        this.isConnected = false;
        this.manager.emit("nodeReconnect", this);
        this.connect();
        this.manager.emit(
          "debug",
          "[ @Moonlink/Node ]: Trying to reconnect node, attempted number " +
            this.reconnectAtattempts
        );
        this.reconnectAtattempts++;
      }, this.retryTime);
    }
  }
  protected close(code: number, reason: any): void {
    if (code !== 1000 || reason !== "destroy") this.reconnect();
    this.manager.emit(
      "debug",
      "[ @Moonlink/Nodes ]: connection was disconnected from a node"
    );
    this.manager.emit("nodeClose", this, code, reason);
    this.isConnected = false;
  }
  protected message(data: Buffer | string): void {
    if (Array.isArray(data)) data = Buffer.concat(data);
    else if (data instanceof ArrayBuffer) data = Buffer.from(data);

    let payload: any = JSON.parse(data.toString());
    if (!payload.op) return;
    this.manager.emit("nodeRaw", this, payload);
    switch (payload.op) {
      case "ready":
        this.sessionId = payload.sessionId;
        this.resumed = payload.resumed;
        this.rest.setSessionId(this.sessionId);
        this.manager.emit(
          "debug",
          `[ @Moonlink/Node ]:${
            this.resumed ? ` session was resumed, ` : ``
          } session is currently ${this.sessionId}`
        );
        break;
      case "stats":
        delete payload.op;
        this.stats = { ...payload };
        break;
      case "playerUpdate":
        let current: any = this.map.get(`current`) || {};
        current[payload.guildId] = {
          ...current[payload.guildId],
          position: payload.state.position || 0,
          thumbnail:
            current.thumbnail ||
            `https://img.youtube.com/vi/${current.identifier}/sddefault.jpg`,
          ping: payload.state.ping || 0,
        };
        this.map.set("current", current);
        break;
      case "event":
        this.handleEvent(payload);
        break;
      default:
        this.manager.emit(
          "nodeError",
          this,
          new Error(
            `[ @Moonlink/Nodes ]: Unexpected op "${payload.op}" with data: ${payload}`
          )
        );
    }
  }
  protected error(err: Error): void {
    if (!err) return;
    this.manager.emit("nodeError", this, err);
    this.manager.emit(
      "debug",
      "[ @Moonlink/Nodes ]: An error occurred in one of the lavalink(s) server connection(s)"
    );
  }
  protected async handleEvent(payload: any): Promise<any> {
    if (!payload) return;
    if (!payload.guildId) return;
    if (!this.map.get("players")[payload.guildId]) return;
    let player: MoonlinkPlayer = new MoonlinkPlayer(
      this.map.get("players")[payload.guildId],
      this.manager,
      this.map,
      this.rest
    );
    let players: any = this.map.get("players") || {};
    console.log(payload);
    switch (payload.type) {
      case "TrackStartEvent": {
        let current: any = null;
        let currents: any = this.map.get("current") || {};
        current = currents[payload.guildId] || null;
        if (!current) return;
        players[payload.guildId] = {
          ...players[payload.guildId],
          playing: true,
          paused: false,
        };
        this.map.set("players", players);
        this.manager.emit("trackStart", player, current);
        break;
      }
      case "TrackEndEvent": {
        let currents: any = this.map.get("current") || {};
        let track: any = currents[payload.guildId] || null;
        let queue = this.db.get(`queue.${payload.guildId}`);
        players[payload.guildId] = {
          ...players[payload.guildId],
          playing: false,
        };
        this.map.set("players", players);
        if (["LOAD_FAILED", "CLEAN_UP"].includes(payload.reason)) {
          if (!queue) {
            this.db.delete(`queue.${payload.guildId}`);
            return this.manager.emit("queueEnd", player, track);
          }
          player.play();
          return;
        }
        if (payload.reason === "REPLACED") {
          this.manager.emit("trackEnd", player, track, payload);
          return;
        }
        if (track && player.loop) {
          if (player.loop == 1) {
            if ((this.version as string).replace(/\./g, "") <= "370")
              this.sendWs({
                op: "play",
                track: track.track,
                guildId: payload.guildId,
              });
            else
              await this.rest.update({
                guildId: payload.guildId,
                data: {
                  encodedTrack: track.track
                    ? track.track
                    : track.encoded
                    ? track.encoded
                    : track.trackEncoded
                    ? track.trackEncoded
                    : null,
                },
              });
            return;
          }
          if (player.loop == 2) {
            this.manager.emit("trackEnd", player, track);
            player.queue.add(track);
            player.play();

            if ((this.version as string).replace(/\./g, "") <= "370")
              this.sendWs({
                op: "play",
                track: track.track,
                guildId: payload.guildId,
              });
            else
              await this.rest.update({
                guildId: payload.guildId,
                data: {
                  encodedTrack: track.track
                    ? track.track
                    : track.encoded
                    ? track.encoded
                    : track.trackEncoded
                    ? track.trackEncoded
                    : null,
                },
              });
            return;
          } else {
            this.manager.emit("trackEnd", player, track);
            this.manager.emit(
              "debug",
              "[ @Manager/Nodes ]: invalid loop value will be ignored!"
            );
          }
        }
        if (player.queue.size) {
          this.manager.emit("trackEnd", player, track);
          player.play();
          return;
        }
        if (player.autoPlay) {
          let uri = `https://www.youtube.com/watch?v=${track.identifier}&list=RD${track.identifier}`;
          let req: SearchResult = await this.manager.search(uri);
          if (
            !req ||
            !req.tracks ||
            ["LOAD_FAILED", "NO_MATCHES"].includes(req.loadType)
          )
            return player.stop();
          let data: any =
            req.tracks[
              Math.floor(Math.random() * Math.floor(req.tracks.length))
            ];
          player.queue.add(data);
          player.play();
          return;
        }
        if (!player.queue.size) {
          this.manager.emit("debug", "[ @Moonlink/Nodes ]: The queue is empty");
          this.manager.emit("queueEnd", player);
          currents[payload.guildId] = null;
          this.map.set("current", currents);
          this.db.delete(`queue.${payload.guildId}`);
        }
        break;
      }

      case "TrackStuckEvent": {
        let currents: any = this.map.get("current") || {};
        let track: any = currents[payload.guildId] || null;
        player.stop();
        this.manager.emit("trackStuck", player, track);
        break;
      }
      case "TrackExceptionEvent": {
        let currents: any = this.map.get("current") || {};
        let track: any = currents[payload.guildId] || null;
        player.stop();
        this.manager.emit("trackError", player, track);
        break;
      }
      case "WebSocketClosedEvent": {
        this.manager.emit("socketClosed", player, payload);

        break;
      }
      default: {
        const error = new Error(
          `[ @Moonlink/Nodes ] unknown event '${payload.type}'.`
        );
        this.manager.emit("nodeError", this, error);
      }
    }
  }
}
