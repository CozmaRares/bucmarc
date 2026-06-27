import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";
import { env } from "@/env";
import { createLogger } from "@/lib/logger";
import chalk from "chalk";

const logger = createLogger("db");

export const db = drizzle(env.DB_FILE_NAME, {
    schema,
    casing: "snake_case",
    logger: {
        logQuery(query: string, params: unknown[]) {
            logger.info(colorQuery(query), "--", `{ ${colorParams(params)} }`);
        },
    },
});

function colorQuery(query: string) {
    return chalk.magenta(query);
}

function colorParams(params: unknown[]) {
    const formattedParams = params.map(p => JSON.stringify(p)).join(", ");
    return chalk.yellow(formattedParams);
}
