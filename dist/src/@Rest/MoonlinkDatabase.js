"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MoonlinkDatabase = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
class MoonlinkDatabase {
    data = {};
    constructor() {
        this.fetch();
    }
    set(key, value) {
        if (!key)
            throw new Error('[ @Moonlink/Database ]: "key" is empty');
        const keys = key.split(".");
        if (keys.length === 0)
            return; // Key is invalid
        this.updateData(this.data, keys, value);
        this.save();
    }
    get(key) {
        this.fetch();
        if (!key)
            throw new Error('[ @Moonlink/Database ]: "key" is empty');
        return key.split(".").reduce((acc, curr) => acc?.[curr], this.data);
    }
    push(key, value) {
        if (!key)
            throw new Error('[ @Moonlink/Database ]: "key" is empty');
        const oldArray = this.get(key) ?? [];
        if (Array.isArray(oldArray)) {
            oldArray.push(value);
            this.set(key, oldArray);
        }
        else {
            throw new Error('[ @Moonlink/Database ]: Key does not point to an array');
        }
    }
    delete(key) {
        if (!key)
            throw new Error('[ @Moonlink/Database ]: "key" is empty');
        const keys = key.split(".");
        if (keys.length === 0)
            return false; // Key is invalid
        const lastKey = keys.pop() || "";
        let currentObj = this.data;
        keys.forEach((k) => {
            if (typeof currentObj[k] === "object") {
                currentObj = currentObj[k];
            }
            else {
                throw new Error(`[ @Moonlink/Database ]: Key path "${key}" does not exist`);
            }
        });
        if (currentObj && lastKey in currentObj) {
            delete currentObj[lastKey];
            this.save();
            return true;
        }
        return false;
    }
    updateData(data, keys, value) {
        let currentObj = data;
        keys.forEach((key, index) => {
            if (index === keys.length - 1) {
                currentObj[key] = value;
            }
            else {
                if (typeof currentObj[key] !== "object") {
                    currentObj[key] = {};
                }
                currentObj = currentObj[key];
            }
        });
    }
    fetch() {
        try {
            const filePath = path_1.default.join(__dirname, "database.json");
            const rawData = fs_1.default.readFileSync(filePath, "utf-8");
            this.data = JSON.parse(rawData) || {};
        }
        catch (err) {
            if (err.code === "ENOENT") {
                this.data = {};
            }
            else {
                throw new Error('[ @Moonlink/Database ]: Failed to fetch data');
            }
        }
    }
    save() {
        try {
            const filePath = path_1.default.join(__dirname, "database.json");
            fs_1.default.writeFileSync(filePath, JSON.stringify(this.data, null, 2));
        }
        catch (error) {
            throw new Error('[ @Moonlink/Database ]: Failed to save data');
        }
    }
}
exports.MoonlinkDatabase = MoonlinkDatabase;
//# sourceMappingURL=MoonlinkDatabase.js.map