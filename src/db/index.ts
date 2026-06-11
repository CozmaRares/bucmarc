import { db } from "./connection";
import { eq, isNotNull, and, sql, desc, isNull } from "drizzle-orm";
import * as schema from "./schema";
import { createHash, randomBytes } from "node:crypto";
import { ResultAsync } from "neverthrow";
import { classifyDbError, type DbError } from "./errors";

function _selectMarks() {
    return db.select().from(schema.marks).orderBy(desc(schema.marks.updatedAt));
}
export type Mark = Awaited<ReturnType<typeof _selectMarks>>[number];

export async function getMarks() {
    return await _selectMarks();
}

function _selectCategories() {
    const sharingEnabled = sql<boolean>`${schema.categories.shareTokenHash} is not null`;

    return db
        .select({
            id: schema.categories.id,
            name: schema.categories.name,
            sharingEnabled,
        })
        .from(schema.categories)
        .orderBy(desc(schema.categories.updatedAt));
}

export async function getCategories() {
    return await _selectCategories();
}
export type Category = Awaited<ReturnType<typeof getCategories>>[number];

export function getCategorizedMarks() {
    return db.query.categories.findMany({
        with: {
            marks: {
                orderBy: [desc(schema.marks.updatedAt)],
            },
        },
        columns: {
            id: true,
            name: true,
        },
        orderBy: [desc(schema.categories.updatedAt)],
    });
}

export async function getUncategorizedMarks() {
    return await _selectMarks().where(isNull(schema.marks.categoryId));
}

export async function getCategoryById(id: number) {
    const [category] = await _selectCategories().where(
        eq(schema.categories.id, id),
    );
    return category;
}

export async function getCategoryByShareToken(token: string | undefined) {
    if (!token) {
        return undefined;
    }

    const [category] = await _selectCategories().where(
        eq(schema.categories.shareTokenHash, hashShareToken(token)),
    );

    return category;
}

export function getMarksByCategoryId(categoryId: number) {
    return _selectMarks().where(eq(schema.marks.categoryId, categoryId));
}

export function saveMark(
    url: string,
    title?: string | null,
): ResultAsync<"created", DbError> {
    return ResultAsync.fromPromise(
        db.insert(schema.marks).values({ url, title }),
        error => classifyDbError(error, { expectDuplicate: "mark_url" }),
    ).map(() => "created" as const);
}

export async function deleteMark(url: string) {
    await db.delete(schema.marks).where(eq(schema.marks.url, url));
}

export async function createCategory(name: string) {
    const [category] = await db
        .insert(schema.categories)
        .values({ name })
        .returning();

    return category;
}

export async function renameCategory(id: number, name: string) {
    const [category] = await db
        .update(schema.categories)
        .set({ name })
        .where(eq(schema.categories.id, id))
        .returning();

    return category;
}

export async function deleteCategory(id: number) {
    await db.transaction(async tx => {
        await tx
            .update(schema.marks)
            .set({ categoryId: null })
            .where(eq(schema.marks.categoryId, id));

        await tx.delete(schema.categories).where(eq(schema.categories.id, id));
    });
}

export async function updateMark(
    url: string,
    title: string | null | undefined,
    categoryId: number | null,
) {
    if (categoryId !== null) {
        const category = await getCategoryById(categoryId);

        if (!category) {
            throw new Error(`Category ${categoryId} not found`);
        }
    }

    const [mark] = await db
        .update(schema.marks)
        .set({
            title,
            categoryId,
        })
        .where(eq(schema.marks.url, url))
        .returning();

    return mark;
}

export async function enableCategorySharing(
    categoryId: number,
    rotate = false,
) {
    if (!rotate) {
        const existing = await _selectCategories().where(
            and(
                eq(schema.categories.id, categoryId),
                isNotNull(schema.categories.shareTokenHash),
            ),
        );

        if (existing.length > 0) {
            return null;
        }
    }

    const token = generateShareToken();

    await db
        .update(schema.categories)
        .set({ shareTokenHash: hashShareToken(token) })
        .where(eq(schema.categories.id, categoryId));

    return token;
}

export function disableCategorySharing(categoryId: number) {
    return db
        .update(schema.categories)
        .set({ shareTokenHash: null })
        .where(eq(schema.categories.id, categoryId))
        .returning();
}

export function rotateCategorySharing(categoryId: number) {
    return enableCategorySharing(categoryId, true);
}

function generateShareToken() {
    return randomBytes(32).toString("base64url");
}

function hashShareToken(token: string) {
    return createHash("sha256").update(token).digest("base64url");
}
