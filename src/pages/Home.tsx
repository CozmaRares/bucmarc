import { getCategorizedMarks, getUncategorizedMarks } from "@/db";
import type { Category, Mark } from "@/db";
import type { Context } from "hono";
import type { Page } from "./types";

type Props = {
    categorizedMarks: Awaited<ReturnType<typeof getCategorizedMarks>>;
    uncategorizedMarks: Mark[];
};

async function dataLoader(_c: Context): Promise<Props> {
    const categorizedMarks = await getCategorizedMarks();
    const uncategorizedMarks = await getUncategorizedMarks();
    return { categorizedMarks, uncategorizedMarks };
}

function Home({ categorizedMarks, uncategorizedMarks }: Props) {
    return (
        <>
            <main>
                <h1>Marks</h1>
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
                    <section>
                        <h2>{category.name}</h2>
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
            <EditMarkDialog categories={categorizedMarks} />
            <script
                src="/public/home/script.js"
                defer
            />
        </>
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
            <button data-delete>Delete</button>
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
    path: "/",
    component: Home,
    dataLoader,
} as const satisfies Page<Props>;
