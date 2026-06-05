import { getCategories, getMarks } from "@/db";
import type { Category, Mark } from "@/db/schema";
import type { Context } from "hono";
import type { Page } from "./types";

type Props = {
    categories: Category[];
    editingMark?: Mark;
    editingUrl?: string;
    groupedMarks: {
        uncategorized: Mark[];
        byCategory: Array<{
            category: Category;
            marks: Mark[];
        }>;
    };
    state?: HomeState;
    url?: string;
};

type HomeState =
    | "exists"
    | "invalid"
    | "error"
    | "mark-updated"
    | "mark-deleted"
    | "mark-error";

async function dataLoader(c: Context): Promise<Props> {
    const [marks, categories] = await Promise.all([
        getMarks(),
        getCategories(),
    ]);
    const editingUrl = c.req.query("edit") ?? getEditableUrl(c);

    return {
        categories: sortCategories(categories),
        editingMark: marks.find(mark => mark.url === editingUrl),
        editingUrl,
        groupedMarks: groupMarksByCategory(marks, categories),
        state: parseHomeState(c.req.query("state")),
        url: c.req.query("url"),
    };
}

function Home({
    categories,
    editingMark,
    editingUrl,
    groupedMarks,
    state,
    url,
}: Props) {
    const statusMessage = getStatusMessage(state, url);

    return (
        <main>
            <h1>Marks</h1>
            {statusMessage && <p>{statusMessage}</p>}
            {groupedMarks.uncategorized.length > 0 && (
                <section>
                    <h2>Uncategorized Marks</h2>

                    <ul>
                        {groupedMarks.uncategorized.map(mark => (
                            <li>
                                <MarkRow
                                    isHighlighted={url === mark.url}
                                    isSelected={editingUrl === mark.url}
                                    mark={mark}
                                />
                            </li>
                        ))}
                    </ul>
                </section>
            )}

            {groupedMarks.byCategory.map(({ category, marks }) => (
                <section>
                    <h2>{category.name}</h2>
                    {marks.length > 0 ? (
                        <ul>
                            {marks.map(mark => (
                                <li>
                                    <MarkRow
                                        isHighlighted={url === mark.url}
                                        isSelected={editingUrl === mark.url}
                                        mark={mark}
                                    />
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>No marks in this category.</p>
                    )}
                </section>
            ))}

            {editingMark && (
                <EditMarkDialog
                    categories={categories}
                    mark={editingMark}
                />
            )}
        </main>
    );
}

type MarkRowProps = {
    isHighlighted: boolean;
    isSelected: boolean;
    mark: Mark;
};

function MarkRow({ isHighlighted, isSelected, mark }: MarkRowProps) {
    return (
        <div>
            <span>
                <a href={mark.url}>{mark.title || mark.url}</a>
                {mark.title ? <span>{` (${mark.url})`}</span> : null}
                {isHighlighted ? <strong> Selected mark</strong> : null}
                {isSelected ? <strong> Editing</strong> : null}
            </span>
            <form
                action="/"
                method="get"
                style="display: inline"
            >
                <input
                    name="edit"
                    type="hidden"
                    value={mark.url}
                />
                <button type="submit">Edit</button>
            </form>
            <form
                action="/api/mark/delete"
                method="post"
                style="display: inline"
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
    categories: Category[];
    mark: Mark;
};

function EditMarkDialog({ categories, mark }: EditMarkDialogProps) {
    return (
        <dialog
            data-edit-mark-dialog
            open
        >
            <h2>Edit Mark</h2>
            <p>
                <a href={mark.url}>{mark.title || mark.url}</a>
                {mark.title ? <span>{` (${mark.url})`}</span> : null}
            </p>
            <form
                action="/api/mark/update"
                method="post"
            >
                <input
                    name="url"
                    type="hidden"
                    value={mark.url}
                />
                <label>
                    Title
                    <input
                        defaultValue={mark.title || ""}
                        name="title"
                        type="text"
                    />
                </label>
                <label>
                    Category
                    <select
                        defaultValue={mark.categoryId ?? ""}
                        name="categoryId"
                    >
                        <option value="">Uncategorized</option>
                        {categories.map(category => (
                            <option value={category.id}>{category.name}</option>
                        ))}
                    </select>
                </label>
                <button type="submit">Save</button>
            </form>
            <form method="dialog">
                <button type="submit">Cancel</button>
            </form>
            <script
                dangerouslySetInnerHTML={{
                    __html: `
const dialog = document.querySelector("[data-edit-mark-dialog]");
if (dialog instanceof HTMLDialogElement && typeof dialog.showModal === "function") {
    if (dialog.open) {
        dialog.close();
    }

    dialog.showModal();
}
`,
                }}
            />
        </dialog>
    );
}

function getEditableUrl(c: Context) {
    const url = c.req.query("url");

    if (
        c.req.query("state") === "exists" ||
        c.req.query("state") === "mark-error"
    ) {
        return url;
    }

    return undefined;
}

function getStatusMessage(state: HomeState | undefined, url?: string) {
    if (state === "exists" && url) {
        return `Mark already exists: ${url}`;
    }

    if (state === "invalid" && url) {
        return `Invalid URL: ${url}`;
    }

    if (state === "error") {
        return "Could not save mark.";
    }

    if (state === "mark-updated" && url) {
        return `Saved mark: ${url}`;
    }

    if (state === "mark-deleted") {
        return "Deleted mark.";
    }

    if (state === "mark-error" && url) {
        return `Could not update mark: ${url}`;
    }

    return undefined;
}

function groupMarksByCategory(marks: Mark[], categories: Category[]) {
    const uncategorized: Mark[] = [];
    const marksByCategoryId = new Map<number, Mark[]>();

    for (const category of categories) {
        marksByCategoryId.set(category.id, []);
    }

    for (const mark of sortMarks(marks)) {
        if (mark.categoryId === null) {
            uncategorized.push(mark);
            continue;
        }

        const categoryMarks = marksByCategoryId.get(mark.categoryId);

        if (!categoryMarks) {
            uncategorized.push({
                ...mark,
                categoryId: null,
            });
            continue;
        }

        categoryMarks.push(mark);
    }

    return {
        uncategorized,
        byCategory: sortCategories(categories).map(category => ({
            category,
            marks: marksByCategoryId.get(category.id) ?? [],
        })),
    };
}

function parseHomeState(state: string | undefined): HomeState | undefined {
    if (
        state === "exists" ||
        state === "invalid" ||
        state === "error" ||
        state === "mark-updated" ||
        state === "mark-deleted" ||
        state === "mark-error"
    ) {
        return state;
    }

    return undefined;
}

function sortCategories(categories: Category[]) {
    return [...categories].sort((left, right) =>
        left.name.localeCompare(right.name),
    );
}

function sortMarks(marks: Mark[]) {
    return [...marks].sort((left, right) => left.url.localeCompare(right.url));
}

export const HomePage = {
    path: "/",
    component: Home,
    dataLoader,
} as const satisfies Page<Props>;
