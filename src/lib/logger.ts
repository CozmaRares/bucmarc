import { env } from "@/env";
import chalk from "chalk";

export enum LogLevel {
    Fatal = 0,
    Error = 1,
    Warn = 2,
    Info = 3,
    Debug = 4,
}

const currentLevel =
    env.NODE_ENV === "production" ? LogLevel.Info : LogLevel.Debug;

const shouldLog = (level: LogLevel) => level <= currentLevel;

const formatTimestamp = () => new Date().toISOString();

const formatValue = (value: unknown) => {
    if (value instanceof Error) {
        return value.stack ?? `${value.name}: ${value.message}`;
    }

    if (typeof value === "string") {
        return value;
    }

    return JSON.stringify(value);
};

const write = (level: LogLevel, place: string, args: unknown[]) => {
    if (!shouldLog(level)) {
        return;
    }

    const label = LogLevel[level];

    const timestamp = colorTimestamp(formatTimestamp());
    const coloredLabel = colorLevel(level, `[${label}]`);
    const coloredPlace = colorPlace(`[${place}]`);
    const message = args.map(formatValue).join(" ");

    const line = `${timestamp} ${coloredLabel} ${coloredPlace} ${message}`;

    if (level <= LogLevel.Error) {
        console.error(line);
        return;
    }

    console.log(line);
};

export const createLogger = (place: string) => ({
    fatal: (...args: unknown[]) => write(LogLevel.Fatal, place, args),
    error: (...args: unknown[]) => write(LogLevel.Error, place, args),
    warn: (...args: unknown[]) => write(LogLevel.Warn, place, args),
    info: (...args: unknown[]) => write(LogLevel.Info, place, args),
    debug: (...args: unknown[]) => write(LogLevel.Debug, place, args),
});


function colorLevel(level: LogLevel, text: string) {
    switch (level) {
        case LogLevel.Fatal:
            return chalk.red.bold(text);
        case LogLevel.Error:
            return chalk.red(text);
        case LogLevel.Warn:
            return chalk.yellow(text);
        case LogLevel.Info:
            return chalk.blue(text);
        case LogLevel.Debug:
            return chalk.gray(text);
        default:
            return text;
    }
}

function colorPlace(place: string) { return chalk.cyan(place); }
function colorTimestamp(timestamp: string) { return chalk.gray(timestamp); }
