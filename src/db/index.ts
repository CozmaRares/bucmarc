import { db } from "./connection";
import { eq, isNotNull, and } from "drizzle-orm";
import * as schema from "./schema";
import { createHash, randomBytes } from "node:crypto";

export function getMarks() {
    return db
        .select({
            url: schema.marks.url,
            title: schema.marks.title,
            categoryId: schema.marks.categoryId,
            createdAt: schema.marks.createdAt,
        })
        .from(schema.marks);
}

export function getCategories() {
    return db
        .select({
            id: schema.categories.id,
            name: schema.categories.name,
            createdAt: schema.categories.createdAt,
            updatedAt: schema.categories.updatedAt,
        })
        .from(schema.categories);
}

export async function getCategoryById(id: number) {
    const [category] = await getCategories().where(
        eq(schema.categories.id, id),
    );
    return category;
}

export async function getCategoryByShareToken(token: string | undefined) {
    if (!token) {
        return undefined;
    }

    const [category] = await getCategories().where(
        eq(schema.categories.shareTokenHash, hashShareToken(token)),
    );

    return category;
}

export function getMarksByCategoryId(categoryId: number) {
    return getMarks().where(eq(schema.marks.categoryId, categoryId));
}

export async function saveMark(url: string, title?: string | null) {
    try {
        await db.insert(schema.marks).values({ url, title });
        return "created" as const;
    } catch (error) {
        if (isDuplicateMarkError(error)) {
            return "exists" as const;
        }

        throw error;
    }
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

export async function assignMarkCategory(
    url: string,
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
        .set({ categoryId })
        .where(eq(schema.marks.url, url))
        .returning();

    return mark;
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
        const existing = await getCategories().where(
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

    return { token };
}

export async function disableCategorySharing(categoryId: number) {
    const [category] = await db
        .update(schema.categories)
        .set({ shareTokenHash: null })
        .where(eq(schema.categories.id, categoryId))
        .returning();

    return category;
}

export async function rotateCategorySharing(categoryId: number) {
    return enableCategorySharing(categoryId, true);
}

function generateShareToken() {
    return randomBytes(32).toString("base64url");
}

function hashShareToken(token: string) {
    return createHash("sha256").update(token).digest("base64url");
}

function isDuplicateMarkError(error: unknown) {
    return (
        error instanceof Error &&
        /UNIQUE constraint failed|PRIMARY KEY constraint failed/i.test(
            error.message,
        )
    );
}
