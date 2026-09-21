import { AsyncLocalStorage } from "node:async_hooks";
import { Database } from "bun:sqlite";
import { drizzle } from "drizzle-orm/bun-sqlite";
import * as schema from "./schema";
import { env } from "@/env";
import { createLogger } from "@/lib/logger";
import chalk from "chalk";

const logger = createLogger("db");

const connectionSetupQueries = Object.freeze(["PRAGMA foreign_keys = ON"]);

function createDatabaseState() {
    const queryPurpose = new AsyncLocalStorage<string>();
    const client = new Database(env.DB_FILE_NAME);
    client.run(connectionSetupQueries.join(";\n"));
    const db = drizzle(client, {
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

    return {
        db,
        queryPurpose,
        close: () => client.close(),
    };
}

type DatabaseState = ReturnType<typeof createDatabaseState>;

const databaseConnection = new AsyncLocalStorage<DatabaseState>();

export async function withDatabaseConnection<T>(
    callback: () => Promise<T>,
    { isolated = false }: { isolated?: boolean } = {},
): Promise<T> {
    if (!isolated && databaseConnection.getStore()) {
        return callback();
    }

    const state = createDatabaseState();
    return databaseConnection.run(state, async () => {
        try {
            return await callback();
        } finally {
            state.close();
        }
    });
}

export async function dbQuery<T>(
    purpose: string,
    callback: (database: DatabaseState["db"]) => T | PromiseLike<T>,
): Promise<T> {
    const state = databaseConnection.getStore();
    if (!state) {
        throw new Error("Database queries must run inside a connection scope.");
    }

    return state.queryPurpose.run(
        purpose,
        async () => await callback(state.db),
    );
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
