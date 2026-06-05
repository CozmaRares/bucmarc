import { db } from "./connection";
import { eq } from "drizzle-orm";
import * as schema from "./schema";

export function getMarks() {
    return db.select().from(schema.marks);
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

function isDuplicateMarkError(error: unknown) {
    return (
        error instanceof Error &&
        /UNIQUE constraint failed|PRIMARY KEY constraint failed/i.test(
            error.message,
        )
    );
}
