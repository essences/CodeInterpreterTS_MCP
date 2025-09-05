import { LogContext } from './types';

export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3
}

export class Logger {
  private static instance: Logger;
  private logLevel: LogLevel = LogLevel.INFO;

  private constructor() {}

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  public setLogLevel(level: LogLevel): void {
    this.logLevel = level;
  }

  public error(message: string, context?: LogContext): void {
    if (this.logLevel >= LogLevel.ERROR) {
      console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, context ? JSON.stringify(context) : '');
    }
  }

  public warn(message: string, context?: LogContext): void {
    if (this.logLevel >= LogLevel.WARN) {
      console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, context ? JSON.stringify(context) : '');
    }
  }

  public info(message: string, context?: LogContext): void {
    if (this.logLevel >= LogLevel.INFO) {
      console.log(`[INFO] ${new Date().toISOString()} - ${message}`, context ? JSON.stringify(context) : '');
    }
  }

  public debug(message: string, context?: LogContext): void {
    if (this.logLevel >= LogLevel.DEBUG) {
      console.log(`[DEBUG] ${new Date().toISOString()} - ${message}`, context ? JSON.stringify(context) : '');
    }
  }
}