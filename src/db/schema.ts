import { relations, Table, type InferSelectModel } from "drizzle-orm";
import { sql } from "drizzle-orm";
import { SERIES_MATCH_TYPES } from "@/lib/constants";
import {
    check,
    index,
    integer,
    sqliteTable,
    text,
    uniqueIndex,
} from "drizzle-orm/sqlite-core";

const helpers = {
    id: () => integer({ mode: "number" }).primaryKey({ autoIncrement: true }),
    timestamp: () =>
        integer({ mode: "timestamp" })
            .default(sql`(unixepoch())`)
            .notNull(),
    updatedAt: () => helpers.timestamp().$onUpdate(() => new Date()),
};

export const categories = sqliteTable(
    "categories",
    {
        id: helpers.id(),
        name: text().notNull(),
        sortOrder: integer({ mode: "number" }).default(0).notNull(),
        showCount: integer({ mode: "boolean" }).default(false).notNull(),
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
        lastClickedAt: helpers.timestamp(),
        createdAt: helpers.timestamp(),
    },
    table => [uniqueIndex("mark_title_unique").on(table.title)],
);

export const marksRelations = relations(marks, ({ one, many }) => ({
    category: one(categories, {
        fields: [marks.categoryId],
        references: [categories.id],
    }),
    series: one(series),
    seriesCandidates: many(markSeriesCandidates),
}));

export const series = sqliteTable(
    "series",
    {
        id: helpers.id(),
        title: text().notNull(),
        pattern: text().notNull(),
        matchType: text({ enum: SERIES_MATCH_TYPES })
            .default("deterministic")
            .notNull(),
        manualEpisode: text(),
        markUrl: text().references(() => marks.url, {
            onDelete: "set null",
        }),
        updatedAt: helpers.updatedAt(),
    },
    table => [
        check(
            "series_deterministic_manual_episode_null",
            sql`${table.matchType} <> 'deterministic' OR ${table.manualEpisode} IS NULL`,
        ),
        uniqueIndex("series_mark_url_unique").on(table.markUrl),
        index("series_mark_url_unique_id_index").on(table.markUrl),
    ],
);

export const seriesRelations = relations(series, ({ one, many }) => ({
    mark: one(marks, {
        fields: [series.markUrl],
        references: [marks.url],
    }),
    candidates: many(markSeriesCandidates),
}));

export const markSeriesCandidates = sqliteTable(
    "mark_series_candidates",
    {
        id: helpers.id(),
        markUrl: text()
            .notNull()
            .references(() => marks.url, { onDelete: "cascade" }),
        seriesId: integer({ mode: "number" })
            .notNull()
            .references(() => series.id, { onDelete: "cascade" }),
        episode: text(),
        createdAt: helpers.timestamp(),
    },
    table => [
        uniqueIndex("mark_series_candidates_mark_url_series_id_unique").on(
            table.markUrl,
            table.seriesId,
        ),
        index("mark_series_candidates_mark_url_index").on(table.markUrl),
        index("mark_series_candidates_series_id_index").on(table.seriesId),
    ],
);

export const markSeriesCandidatesRelations = relations(
    markSeriesCandidates,
    ({ one }) => ({
        mark: one(marks, {
            fields: [markSeriesCandidates.markUrl],
            references: [marks.url],
        }),
        series: one(series, {
            fields: [markSeriesCandidates.seriesId],
            references: [series.id],
        }),
    }),
);

export const regexSnippets = sqliteTable("regex_snippets", {
    pattern: text().primaryKey(),
});

export const providerPatterns = sqliteTable("provider_patterns", {
    pattern: text().primaryKey(),
    matchType: text({ enum: SERIES_MATCH_TYPES }).notNull(),
});

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
export type Mark = InferSelectModel<typeof marks>;
export type Series = WithoutUpdatedAt<typeof series>;
export type MarkSeriesCandidate = InferSelectModel<typeof markSeriesCandidates>;
export type RegexSnippet = InferSelectModel<typeof regexSnippets>;
export type ProviderPattern = InferSelectModel<typeof providerPatterns>;
