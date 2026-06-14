import { getCategorizedMarks, getUncategorizedMarks } from "@/db";
import type { Category, Mark } from "@/db";
import { serverError, type Page, type PageLoadError } from "./types";
import { ResultAsync } from "neverthrow";
import type { Context } from "hono";

type Props = {
    categorizedMarks: Array<Category & { marks: Mark[] }>;
    pageError?: string;
    uncategorizedMarks: Mark[];
};

function dataLoader(c: Context): ResultAsync<Props, PageLoadError> {
    return ResultAsync.combineWithAllErrors([
        getCategorizedMarks(),
        getUncategorizedMarks(),
    ])
        .map(([categorizedMarks, uncategorizedMarks]) => ({
            categorizedMarks,
            pageError: c.req.query("error"),
            uncategorizedMarks,
        }))
        .mapErr(serverError);
}

function Home({ categorizedMarks, pageError, uncategorizedMarks }: Props) {
    return (
        <>
            <main>
                <h1>Marks</h1>
                <button
                    type="button"
                    data-create-category
                >
                    Create Category
                </button>
                <p
                    data-page-error
                    role="alert"
                    style="border: 1px solid #b42318; background: #fff4f2; color: #7a271a; padding: 0.75rem; margin: 0 0 1rem;"
                    hidden={!pageError}
                >
                    {pageError}
                </p>
                {uncategorizedMarks.length > 0 && (
                    <section>
                        <h2>Uncategorized Marks</h2>

                        <ul>
                            {uncategorizedMarks.map(mark => (
                                <li>
                                    <Mark mark={mark} />
                                </li>
                            ))}
                        </ul>
                    </section>
                )}

                {categorizedMarks.map(category => (
                    <section
                        data-category
                        data-category-id={category.id}
                        data-category-name={category.name}
                    >
                        <h2>
                            {category.name}{" "}
                            <button
                                type="button"
                                data-edit-category
                            >
                                Edit Category
                            </button>
                        </h2>
                        {category.sharingEnabled ? (
                            <span>Share enabled</span>
                        ) : null}
                        {category.marks.length > 0 ? (
                            <ul>
                                {category.marks.map(mark => (
                                    <li>
                                        <Mark mark={mark} />
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p>No marks in this category.</p>
                        )}
                    </section>
                ))}
            </main>
            <CreateCategoryDialog />
            <EditCategoryDialog />
            <EditMarkDialog categories={categorizedMarks} />
            <script
                src="/public/home/script.js"
                defer
            />
        </>
    );
}

function CreateCategoryDialog() {
    return (
        <dialog
            data-create-category-dialog
            hidden
        >
            <h2>Create Category</h2>
            <form
                action="/api/category/create"
                method="post"
            >
                <label>
                    Category Name
                    <input
                        name="name"
                        type="text"
                        data-create-category-dialog-input-name
                        required
                    />
                </label>
                <button type="submit">Create</button>
            </form>
            <button
                type="button"
                data-create-category-dialog-cancel
            >
                Cancel
            </button>
        </dialog>
    );
}

function EditCategoryDialog() {
    return (
        <dialog
            data-edit-category-dialog
            hidden
        >
            <h2>Edit Category</h2>
            <p data-edit-category-dialog-name />
            <form
                action="/api/category/rename"
                method="post"
            >
                <input
                    name="id"
                    type="hidden"
                    data-edit-category-dialog-rename-id
                />
                <label>
                    Category Name
                    <input
                        name="name"
                        type="text"
                        data-edit-category-dialog-input-name
                        required
                    />
                </label>
                <button type="submit">Save</button>
            </form>
            <form
                action="/api/category/delete"
                method="post"
                data-delete-category-form
            >
                <input
                    name="id"
                    type="hidden"
                    data-edit-category-dialog-delete-id
                />
                <button type="submit">Delete</button>
            </form>
            <button
                type="button"
                data-edit-category-dialog-cancel
            >
                Cancel
            </button>
        </dialog>
    );
}

type MarkProps = {
    mark: Mark;
};

function Mark({ mark }: MarkProps) {
    return (
        <div
            data-mark
            data-mark-url={mark.url}
            data-mark-title={mark.title ?? ""}
            data-mark-category-id={mark.categoryId ?? ""}
        >
            <a
                href={mark.url}
                target="_blank"
                rel="noreferrer"
            >
                {mark.title || mark.url}
            </a>
            <button data-edit>Edit</button>
            <form
                action="/api/mark/delete"
                method="post"
                data-delete-mark-form
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

type EditMarkDialogProps = {
    categories: Array<Pick<Category, "id" | "name">>;
};

function EditMarkDialog({ categories }: EditMarkDialogProps) {
    return (
        <dialog
            data-edit-mark-dialog
            hidden
        >
            <h2>Edit Mark</h2>
            <p data-edit-mark-dialog-url />
            <form
                action="/api/mark/update"
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
                <label>
                    Category
                    <select
                        name="categoryId"
                        data-edit-mark-dialog-input-category
                    >
                        <option value="">Uncategorized</option>
                        {categories.map(category => (
                            <option value={category.id}>{category.name}</option>
                        ))}
                    </select>
                </label>
                <button type="submit">Save</button>
            </form>
            <button type="button">Cancel</button>
        </dialog>
    );
}

export const HomePage = {
    component: Home,
    dataLoader,
} as const satisfies Page<Props>;
