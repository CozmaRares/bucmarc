import { defineConfig } from "drizzle-kit";

export default defineConfig({
    out: "./drizzle",
    schema: "./src/db/schema.ts",
    dialect: "sqlite",
    casing: "snake_case",
    dbCredentials: {
        url:
            process.env.DB_FILE_NAME ??
            (() => {
                throw new Error(
                    "DB_FILE_NAME is required for Drizzle migrations",
                );
            })(),
    },
});
