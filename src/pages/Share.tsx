import type { InferSelectModel } from "drizzle-orm";
import type { categories, marks } from "@/db/schema";

type SharedCategory = InferSelectModel<typeof categories>;
type SharedMark = InferSelectModel<typeof marks>;

type Props = {
    category: SharedCategory;
    marks: SharedMark[];
};

export default async function Share({ category, marks }: Props) {
    return (
        <main>
            <h1>{category.name}</h1>
            <ul>
                {marks.map(mark => (
                    <li key={mark.url}>
                        <a href={mark.url}>{mark.url}</a>
                    </li>
                ))}
            </ul>
        </main>
    );
}
