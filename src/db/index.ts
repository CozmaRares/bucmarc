import { db } from "./connection";
import { eq } from "drizzle-orm";
import * as schema from "./schema";

export function getMarks() {
    return db.select().from(schema.marks);
}

export async function saveMark(url: string) {
    try {
        await db.insert(schema.marks).values({ url });
    } catch (e) {
        console.error(e);
    }
}

export async function deleteMark(url: string) {
    await db.delete(schema.marks).where(eq(schema.marks.url, url));
}
