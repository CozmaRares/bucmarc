import { getCategorizedMarks, getUncategorizedMarks } from "@/db/dal";
import type { Category, MarkWithSeries } from "@/db/dal";
import { serverError, type Page, type PageLoadError } from "./types";
import { ResultAsync } from "neverthrow";

type AgedMark = MarkWithSeries & { ageIndicatorColor: string };

type Props = {
    categorizedMarks: Array<Category & { marks: AgedMark[] }>;
    uncategorizedMarks: AgedMark[];
};

function dataLoader(): ResultAsync<Props, PageLoadError> {
    const MS_PER_DAY = 24 * 60 * 60 * 1000;

    const THRESHOLDS = {
        FRESH: [7, "#22C55E"],
        AGING: [30, "#EAB308"],
        STALE: [60, "#F97316"],
        VERY_STALE: [90, "#EF4444"],
        ANCIENT: [Infinity, "#6B7280"],
    } as const;

    const now = Date.now();

    const createAgedMark = (mark: MarkWithSeries) => {
        const days = (now - mark.updatedAt.getTime()) / MS_PER_DAY;

        const color = Object.values(THRESHOLDS).find(
            ([threshold]) => {
                if (isNaN(days)) {
                    console.log(mark)
                }
                return days < threshold;
            }
        )![1];
        return { ...mark, ageIndicatorColor: color };
    };

    return ResultAsync.combineWithAllErrors([
        getCategorizedMarks(),
        getUncategorizedMarks(),
    ])
        .map(([categorizedMarks, uncategorizedMarks]) => ({
            categorizedMarks: categorizedMarks.map(category => ({
                ...category,
                marks: category.marks.map(createAgedMark),
            })),
            uncategorizedMarks: uncategorizedMarks.map(createAgedMark),
        }))
        .mapErr(serverError);
}

function component({ categorizedMarks, uncategorizedMarks }: Props) {
    return (
        <>
            {uncategorizedMarks.length > 0 && (
                <section class="home-section">
                    <div class="home-section-header">
                        <h2 class="home-section-title">Marks</h2>
                        <button
                            class="home-create-category-button"
                            type="button"
                            data-create-category
                        >
                            Create Category
                        </button>
                    </div>

                    <ul class="home-list">
                        {uncategorizedMarks.map(agedMark => (
                            <li class="home-list-item">
                                <MarkComponent agedMark={agedMark} />
                            </li>
                        ))}
                    </ul>
                </section>
            )}

            {categorizedMarks.map(category => (
                <section
                    class="home-section"
                    data-category
                    data-category-id={category.id}
                    data-category-name={category.name}
                    data-category-sort-order={category.sortOrder}
                >
                    <div class="home-section-header">
                        <h2 class="home-section-title">{category.name}</h2>
                        <button
                            class="home-edit-category-button"
                            type="button"
                            data-edit-category
                        >
                            Edit Category
                        </button>
                    </div>
                    {category.marks.length > 0 ? (
                        <ul class="home-list">
                            {category.marks.map(agedMark => (
                                <li class="home-list-item">
                                    <MarkComponent agedMark={agedMark} />
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>No marks in this category.</p>
                    )}
                </section>
            ))}
            <CreateCategoryDialog />
            <EditCategoryDialog />
            <EditMarkDialog categories={categorizedMarks} />
            <link
                rel="stylesheet"
                href="/public/home/style.css"
            />
            <script
                src="/public/home/script.js"
                defer
            />
        </>
    );
}

type MarkProps = {
    agedMark: AgedMark;
};

function MarkComponent({ agedMark }: MarkProps) {
    const { series, ...mark } = agedMark;

    return (
        <div
            class="mark"
            data-mark
            data-mark-url={mark.url}
            data-mark-title={mark.title ?? ""}
            data-mark-category-id={mark.categoryId ?? ""}
        >
            <div
                class="mark-age-indicator"
                style={`background-color: ${mark.ageIndicatorColor}`}
            />
            {series?.episode && (
                <span class="mark-episode">[{series.episode}]</span>
            )}
            <a
                class="mark-link"
                href={mark.url}
                target="_blank"
                rel="noreferrer"
            >
                {series?.title || mark.title || mark.url}
            </a>
            <button
                class="mark-edit"
                data-edit
            >
                Edit
            </button>
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
                <button
                    class="mark-delete"
                    type="submit"
                >
                    Delete
                </button>
            </form>
        </div>
    );
}

function CreateCategoryDialog() {
    return (
        <div
            class="dialog"
            data-create-category-dialog
            hidden
        >
            <div
                class="dialog-content"
                data-create-category-dialog-content
            >
                <h2 class="dialog-title">Create Category</h2>
                <form
                    class="dialog-form"
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
                    <div class="dialog-actions">
                        <button
                            class="dialog-cancel"
                            type="button"
                            data-create-category-dialog-cancel
                        >
                            Cancel
                        </button>
                        <button
                            class="dialog-submit"
                            type="submit"
                        >
                            Create
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function EditCategoryDialog() {
    return (
        <div
            class="dialog"
            data-edit-category-dialog
            hidden
        >
            <div
                class="dialog-content"
                data-edit-category-dialog-content
            >
                <div class="dialog-header">
                    <h2 class="dialog-title">Edit Category</h2>
                    <p
                        class="dialog-summary"
                        data-edit-category-dialog-name
                    />
                </div>
                <form
                    class="dialog-form"
                    action="/api/category/update"
                    method="post"
                >
                    <input
                        name="id"
                        type="hidden"
                        data-edit-category-dialog-update-id
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
                    <label>
                        Sort Order
                        <input
                            name="sortOrder"
                            type="number"
                            data-edit-category-dialog-input-sort-order
                            required
                        />
                    </label>
                    <div class="dialog-actions">
                        <button
                            class="dialog-cancel"
                            type="button"
                            data-edit-category-dialog-cancel
                        >
                            Cancel
                        </button>
                        <button
                            class="dialog-submit"
                            type="submit"
                        >
                            Save
                        </button>
                    </div>
                </form>
                <form
                    class="dialog-form-delete"
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
            </div>
        </div>
    );
}

type EditMarkDialogProps = {
    categories: Array<Pick<Category, "id" | "name">>;
};

function EditMarkDialog({ categories }: EditMarkDialogProps) {
    return (
        <div
            class="dialog"
            data-edit-mark-dialog
            hidden
        >
            <div
                class="dialog-content"
                data-edit-mark-dialog-content
            >
                <div class="dialog-header">
                    <h2 class="dialog-title">Edit Mark</h2>
                    <p
                        class="dialog-summary break"
                        data-edit-mark-dialog-url
                    />
                </div>
                <form
                    class="dialog-form"
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
                                <option value={category.id}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                    </label>
                    <div class="dialog-actions">
                        <button
                            class="dialog-cancel"
                            type="button"
                            data-edit-mark-dialog-cancel
                        >
                            Cancel
                        </button>
                        <button
                            class="dialog-submit"
                            type="submit"
                        >
                            Save
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export const HomePage: Page<Props> = {
    name: "Home",
    component,
    dataLoader,
};
