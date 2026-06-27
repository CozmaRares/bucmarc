import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";
import { env } from "@/env";
import { createLogger } from "@/lib/logger";
import chalk from "chalk";
import { createClient } from "@libsql/client";

const client = createClient({ url: env.DB_FILE_NAME });
export const db = drizzle(client, {
    schema,
    casing: "snake_case",
    logger: {
        logQuery(query: string, params: unknown[]) {
            const logger = createLogger("db");
            logger.info(colorQuery(query), "--", `{ ${colorParams(params)} }`);
        },
    },
});

await client.execute(`
  PRAGMA journal_mode = WAL;
  PRAGMA busy_timeout = 5000;
`);

function colorQuery(query: string) {
    return chalk.magenta(query);
}

function colorParams(params: unknown[]) {
    const formattedParams = params.map(p => JSON.stringify(p)).join(", ");
    return chalk.yellow(formattedParams);
}
