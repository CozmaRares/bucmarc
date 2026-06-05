import { getCategoryByShareToken, getMarksByCategoryId } from "@/db";
import type { Category } from "@/db/schema";
import type { Context } from "hono";
import type { Page } from "./types";

type Props = {
    category: Category;
};

async function dataLoader(c: Context): Promise<Props | null> {
    const token = c.req.param("token");
    const category = await getCategoryByShareToken(token);

    if (!category) {
        return null;
    }

    return { category };
}

async function Share({ category }: Props) {
    const marks = await getMarksByCategoryId(category.id);

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

export const SharePage: Page<Props> = {
    path: "/share/:token",
    component: Share,
    dataLoader: dataLoader,
};
