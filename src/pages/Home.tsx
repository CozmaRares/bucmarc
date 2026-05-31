import { getMarks } from "@/db";

export default async function Home() {
    const marks = await getMarks();

    return (
        <main>
            <h1>Marks</h1>
            <ul>
                {marks.map(mark => (
                    <li key={mark.url}>
                        <a href={mark.url}>{mark.url}</a>
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
