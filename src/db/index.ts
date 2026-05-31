import { db } from "./connection";
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
