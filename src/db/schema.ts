import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

const helpers = {
    createdAt: () => integer({ mode: "timestamp" }).$default(() => new Date()),
};

export const marks = sqliteTable("marks", {
    url: text().primaryKey(),
    createdAt: helpers.createdAt(),
});
