import type { InferSelectModel } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

const helpers = {
    createdAt: () => integer({ mode: "timestamp" }).$default(() => new Date()),
    updatedAt: () => helpers.createdAt().$onUpdate(() => new Date()),
};

export const categories = sqliteTable("categories", {
    id: integer({ mode: "number" }).primaryKey({ autoIncrement: true }),
    name: text().notNull(),
    shareTokenHash: text().unique(),
    createdAt: helpers.createdAt(),
    updatedAt: helpers.updatedAt(),
});
export type Category = InferSelectModel<typeof categories>;

export const marks = sqliteTable("marks", {
    url: text().primaryKey(),
    title: text(),
    categoryId: integer({ mode: "number" }).references(() => categories.id, {
        onDelete: "set null",
    }),
    createdAt: helpers.createdAt(),
});
export type Mark = InferSelectModel<typeof marks>;
