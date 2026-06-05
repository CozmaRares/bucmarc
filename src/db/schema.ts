import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

const helpers = {
    createdAt: () => integer({ mode: "timestamp" }).$default(() => new Date()),
};

export const categories = sqliteTable("categories", {
    id: integer({ mode: "number" }).primaryKey({ autoIncrement: true }),
    name: text().notNull(),
    createdAt: helpers.createdAt(),
});

export const marks = sqliteTable("marks", {
    url: text().primaryKey(),
    title: text(),
    categoryId: integer({ mode: "number" }).references(() => categories.id, {
        onDelete: "set null",
    }),
    createdAt: helpers.createdAt(),
});
