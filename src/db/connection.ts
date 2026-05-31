import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";
import { env } from "@/env";
import { createLogger } from "@/lib/logger";

const logger = createLogger("db");

export const db = drizzle(env.DB_FILE_NAME, {
    schema,
    casing: "snake_case",
    logger: {
        logQuery(query: string, params: unknown[]) {
            logger.info(query, params);
        },
    },
});
