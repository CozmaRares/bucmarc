import { getCategoryWithMarksByShareToken } from "@/db/dal";
import type { Mark } from "@/db/dal";
import type { Context } from "hono";
import {
    notFoundError,
    serverError,
    type Page,
    type PageLoadError,
} from "./types";
import type { ResultAsync } from "neverthrow";
import { isNotFoundCategoryError } from "@/db/dal";

type Props = {
    categoryName: string;
    isShareOnly: boolean;
    isTokenManageable: boolean;
    marks: Mark[];
    pageError?: string;
    token: string;
};

function dataLoader(c: Context): ResultAsync<Props, PageLoadError> {
    const token = c.req.param("token") ?? "";
    return getCategoryWithMarksByShareToken(token)
        .map(category => ({
            isShareOnly: category.isShareOnly,
            isTokenManageable: category.isTokenManageable,
            marks: category.marks,
            categoryName: category.name,
            pageError: c.req.query("message"),
            token,
        }))
        .mapErr(error => {
            if (isNotFoundCategoryError(error)) {
                return notFoundError();
            }

            return serverError();
        });
}

function component({
    isShareOnly,
    isTokenManageable,
    marks,
    categoryName,
    pageError,
    token,
}: Props) {
    return (
        <>
            <main>
                <h1>{categoryName}</h1>
                <p
                    role="alert"
                    style="border: 1px solid #b42318; background: #fff4f2; color: #7a271a; padding: 0.75rem; margin: 0 0 1rem;"
                    hidden={!pageError}
                >
                    {pageError}
                </p>
                {isShareOnly ? (
                    <form
                        action={`/share/${token}/share-only/disable`}
                        method="post"
                    >
                        <button type="submit">
                            Show in Private Management Area
                        </button>
                    </form>
                ) : null}
                <ul>
                    {marks.map(mark => (
                        <li>
                            {isTokenManageable ? (
                                <TokenManageableMark
                                    mark={mark}
                                    token={token}
                                />
                            ) : (
                                <a href={mark.url}>{mark.title || mark.url}</a>
                            )}
                        </li>
                    ))}
                </ul>
            </main>
            {isTokenManageable ? <EditMarkDialog token={token} /> : null}
            <script
                src="/public/mark-dialog/script.js"
                defer
            />
        </>
    );
}

function TokenManageableMark({ mark, token }: { mark: Mark; token: string }) {
    return (
        <div
            data-mark
            data-mark-url={mark.url}
            data-mark-title={mark.title ?? ""}
        >
            <a href={mark.url}>{mark.title || mark.url}</a>
            <button
                type="button"
                data-edit
            >
                Edit
            </button>
            <form
                action={`/share/${token}/mark/delete`}
                method="post"
            >
                <input
                    name="url"
                    type="hidden"
                    value={mark.url}
                />
                <button type="submit">Delete</button>
            </form>
        </div>
    );
}

function EditMarkDialog({ token }: { token: string }) {
    return (
        <dialog
            data-edit-mark-dialog
            hidden
        >
            <h2>Edit Mark</h2>
            <p data-edit-mark-dialog-url />
            <form
                action={`/share/${token}/mark/update-title`}
                method="post"
            >
                <input
                    name="url"
                    type="hidden"
                    data-edit-mark-dialog-input-url
                />
                <label>
                    Title
                    <input
                        name="title"
                        type="text"
                        data-edit-mark-dialog-input-title
                    />
                </label>
                <button type="submit">Save</button>
            </form>
            <button
                type="button"
                data-edit-mark-dialog-cancel
            >
                Cancel
            </button>
        </dialog>
    );
}

export const SharePage: Page<Props> = { component, dataLoader };
