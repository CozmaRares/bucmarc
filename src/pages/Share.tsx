import { getCategoryWithMarksByShareToken } from "@/db";
import type { Mark } from "@/db";
import type { Context } from "hono";
import {
    notFoundError,
    serverError,
    type Page,
    type PageLoadError,
} from "./types";
import type { ResultAsync } from "neverthrow";
import { isNotFoundCategoryError } from "@/db/errors";

type Props = {
    categoryName: string;
    marks: Mark[];
};

function dataLoader(c: Context): ResultAsync<Props, PageLoadError> {
    const token = c.req.param("token");
    return getCategoryWithMarksByShareToken(token)
        .map(category => ({
            marks: category.marks,
            categoryName: category.name,
        }))
        .mapErr(error => {
            if (isNotFoundCategoryError(error)) {
                return notFoundError();
            }

            return serverError();
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
