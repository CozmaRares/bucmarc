import { relations, Table, type InferSelectModel } from "drizzle-orm";
import { sql } from "drizzle-orm";
import {
    index,
    integer,
    sqliteTable,
    text,
    uniqueIndex,
} from "drizzle-orm/sqlite-core";

const helpers = {
    id: () => integer({ mode: "number" }).primaryKey({ autoIncrement: true }),
    updatedAt: () =>
        integer({ mode: "timestamp" })
            .default(sql`(current_timestamp)`)
            .$onUpdate(() => new Date())
            .notNull(),
};

export const categories = sqliteTable(
    "categories",
    {
        id: helpers.id(),
        name: text().notNull(),
        sortOrder: integer({ mode: "number" }).default(0).notNull(),
        updatedAt: helpers.updatedAt(),
    },
    table => [
        uniqueIndex("categories_normalized_name_unique").on(
            sql`lower(trim(${table.name}))`,
        ),
    ],
);
export const categoriesRelations = relations(categories, ({ many }) => ({
    marks: many(marks),
}));

export const marks = sqliteTable(
    "marks",
    {
        url: text().primaryKey(),
        title: text(),
        categoryId: integer({ mode: "number" }).references(
            () => categories.id,
            { onDelete: "set null" },
        ),
        updatedAt: helpers.updatedAt(),
    },
    table => [uniqueIndex("mark_title_unique").on(table.title)],
);

export const marksRelations = relations(marks, ({ one }) => ({
    category: one(categories, {
        fields: [marks.categoryId],
        references: [categories.id],
    }),
    series: one(series),
}));

export const series = sqliteTable(
    "series",
    {
        id: helpers.id(),
        title: text().notNull(),
        pattern: text().notNull(),
        markUrl: text().references(() => marks.url, {
            onDelete: "set null",
        }),
        updatedAt: helpers.updatedAt(),
    },
    table => [
        uniqueIndex("series_pattern_unique").on(table.pattern),
        uniqueIndex("series_mark_url_unique").on(table.markUrl),
        index("series_mark_url_unique_id_index").on(table.markUrl),
    ],
);

export const seriesRelations = relations(series, ({ one }) => ({
    mark: one(marks, {
        fields: [series.markUrl],
        references: [marks.url],
    }),
}));

const JOB_STATUSES = Object.freeze(["pending", "running", "done"] as const);
export type JobStatus = (typeof JOB_STATUSES)[number];

export const jobs = sqliteTable("jobs", {
    id: helpers.id(),
    markUrl: text().notNull(),
    status: text({ enum: JOB_STATUSES }).notNull(),
    updatedAt: helpers.updatedAt(),
});

type WithoutUpdatedAt<T extends Table> = Omit<InferSelectModel<T>, "updatedAt">;
export type Category = WithoutUpdatedAt<typeof categories>;
export type Mark = WithoutUpdatedAt<typeof marks>;
export type Series = WithoutUpdatedAt<typeof series>;
