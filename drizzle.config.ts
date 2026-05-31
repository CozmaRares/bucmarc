import { defineConfig } from "drizzle-kit";
import { env } from "@/env";

export default defineConfig({
    out: "./drizzle",
    schema: "./backend/db/schema.ts",
    dialect: "sqlite",
    casing: "snake_case",
    dbCredentials: {
        url: env.DB_FILE_NAME,
    },
});
