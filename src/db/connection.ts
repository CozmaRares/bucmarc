import { AsyncLocalStorage } from "node:async_hooks";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";
import { env } from "@/env";
import { createLogger } from "@/lib/logger";
import chalk from "chalk";

const logger = createLogger("db");
const queryPurpose = new AsyncLocalStorage<string>();

const db = drizzle(env.DB_FILE_NAME, {
    schema,
    casing: "snake_case",
    logger: {
        logQuery(query: string, params: unknown[]) {
            const purpose = queryPurpose.getStore();

            logger.info(
                colorQueryPurpose(purpose),
                colorQuery(query),
                "--",
                `{ ${colorParams(params)} }`,
            );
        },
    },
});

export async function dbQuery<T>(
    purpose: string,
    callback: (database: typeof db) => PromiseLike<T>,
): Promise<T> {
    return queryPurpose.run(purpose, async () => await callback(db));
}

function colorQueryPurpose(purpose = "untracked") {
    return chalk.grey(`[${purpose}]`);
}

function colorQuery(query: string) {
    return chalk.magenta(query);
}

function colorParams(params: unknown[]) {
    const formattedParams = params.map(p => JSON.stringify(p)).join(", ");
    return chalk.yellow(formattedParams);
}
