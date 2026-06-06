import { getCategoryByShareToken, getMarksByCategoryId } from "@/db";
import type { Mark } from "@/db";
import type { Context } from "hono";
import type { Page } from "./types";

type Props = {
    categoryName: string;
    marks: Mark[];
};

async function dataLoader(c: Context): Promise<Props | null> {
    const token = c.req.param("token");
    const category = await getCategoryByShareToken(token);

    if (!category) {
        return null;
    }

    const marks = await getMarksByCategoryId(category.id);

    return { marks, categoryName: category.name };
}

function Share({ marks, categoryName }: Props) {
    return (
        <main>
            <h1>{categoryName}</h1>
            <ul>
                {marks.map(mark => (
                    <li>
                        <a href={mark.url}>{mark.url}</a>
                    </li>
                ))}
            </ul>
        </main>
    );
}

export const SharePage = {
    path: "/share/:token",
    component: Share,
    dataLoader: dataLoader,
    publicPage: true,
} as const satisfies Page<Props>;
