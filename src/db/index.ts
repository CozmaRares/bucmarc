import { db } from "./connection";
import { eq } from "drizzle-orm";
import * as schema from "./schema";

export function getMarks() {
    return db.select().from(schema.marks);
}

export function getCategories() {
    return db.select().from(schema.categories);
}

export function getCategoryById(id: number) {
    return db
        .select()
        .from(schema.categories)
        .where(eq(schema.categories.id, id));
}

export async function saveMark(url: string) {
    try {
        await db.insert(schema.marks).values({ url });
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
        const [category] = await getCategoryById(categoryId);

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

function isDuplicateMarkError(error: unknown) {
    return (
        error instanceof Error &&
        /UNIQUE constraint failed|PRIMARY KEY constraint failed/i.test(
            error.message,
        )
    );
}
