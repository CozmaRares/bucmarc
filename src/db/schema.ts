import { relations } from "drizzle-orm";
import {
    integer,
    sqliteTable,
    text,
    uniqueIndex,
} from "drizzle-orm/sqlite-core";

const helpers = {
    id: () => integer({ mode: "number" }).primaryKey({ autoIncrement: true }),
    updatedAt: () =>
        integer({ mode: "timestamp" })
            .$default(() => new Date())
            .$onUpdate(() => new Date())
            .notNull(),
};

export const categories = sqliteTable(
    "categories",
    {
        id: helpers.id(),
        name: text().notNull(),
        shareTokenHash: text().unique(),
        updatedAt: helpers.updatedAt(),
    },
    table => [uniqueIndex("categories_normalized_name_unique").on(table.name)],
);

export const categoriesRelations = relations(categories, ({ many }) => ({
    marks: many(marks),
}));

export const marks = sqliteTable("marks", {
    url: text().primaryKey(),
    title: text(),
    categoryId: integer({ mode: "number" }).references(() => categories.id, {
        onDelete: "set null",
    }),
    updatedAt: helpers.updatedAt(),
});

export const marksRelations = relations(marks, ({ one }) => ({
    category: one(categories, {
        fields: [marks.categoryId],
        references: [categories.id],
    }),
}));
