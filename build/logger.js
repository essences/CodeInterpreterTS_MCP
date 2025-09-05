"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = exports.LogLevel = void 0;
var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["ERROR"] = 0] = "ERROR";
    LogLevel[LogLevel["WARN"] = 1] = "WARN";
    LogLevel[LogLevel["INFO"] = 2] = "INFO";
    LogLevel[LogLevel["DEBUG"] = 3] = "DEBUG";
})(LogLevel || (exports.LogLevel = LogLevel = {}));
class Logger {
    static instance;
    logLevel = LogLevel.INFO;
    constructor() { }
    static getInstance() {
        if (!Logger.instance) {
            Logger.instance = new Logger();
        }
        return Logger.instance;
    }
    setLogLevel(level) {
        this.logLevel = level;
    }
    error(message, context) {
        if (this.logLevel >= LogLevel.ERROR) {
            console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, context ? JSON.stringify(context) : '');
        }
    }
    warn(message, context) {
        if (this.logLevel >= LogLevel.WARN) {
            console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, context ? JSON.stringify(context) : '');
        }
    }
    info(message, context) {
        if (this.logLevel >= LogLevel.INFO) {
            console.log(`[INFO] ${new Date().toISOString()} - ${message}`, context ? JSON.stringify(context) : '');
        }
    }
    debug(message, context) {
        if (this.logLevel >= LogLevel.DEBUG) {
            console.log(`[DEBUG] ${new Date().toISOString()} - ${message}`, context ? JSON.stringify(context) : '');
        }
    }
}
exports.Logger = Logger;
