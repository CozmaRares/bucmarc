import { getCategoryByShareToken, getMarksByCategoryId } from "@/db";
import type { Mark } from "@/db";
import type { Context } from "hono";
import {
    notFoundError,
    serverError,
    type Page,
    type PageLoadError,
} from "./types";
import type { ResultAsync } from "neverthrow";

type Props = {
    categoryName: string;
    marks: Mark[];
};

function dataLoader(c: Context): ResultAsync<Props, PageLoadError> {
    const token = c.req.param("token");
    return getCategoryByShareToken(token)
        .andThen(category =>
            getMarksByCategoryId(category.id).map(marks => ({
                marks,
                categoryName: category.name,
            })),
        )
        .mapErr(e => {
            switch (e.type) {
                case "not_found_category":
                    return notFoundError();
                case "unknown_db_error":
                    return serverError();
                default:
                    // exhaustiveness check
                    return e;
            }
        });
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
    component: Share,
    dataLoader,
} as const satisfies Page<Props>;
