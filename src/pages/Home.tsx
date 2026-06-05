import { getMarks } from "@/db";
import type { Page } from "./types";

async function Home() {
    const marks = await getMarks();

    return (
        <main>
            <h1>Marks</h1>
            <p data-status-message />
            <ul data-mark-list>
                {marks.map(mark => (
                    <li
                        key={mark.url}
                        data-mark-item={mark.url}
                    >
                        <a href={mark.url}>{mark.title || mark.url}</a>
                        {mark.title ? <span>{` (${mark.url})`}</span> : null}
                        <strong
                            data-existing-mark
                            hidden
                        >
                            Existing mark
                        </strong>
                        <button
                            type="button"
                            data-edit
                        >
                            Edit
                        </button>
                        <button
                            type="button"
                            data-delete={mark.url}
                        >
                            Delete
                        </button>
                    </li>
                ))}
            </ul>
            <script
                src="/public/home/script.js"
                type="module"
            />
        </main>
    );
}

export const HomePage: Page<void> = {
    path: "/",
    component: Home,
};
