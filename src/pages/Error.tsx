import { HOME_PAGE_URL } from "@/routers/pagePaths";
import type { PageLoadError } from "@/lib/services/loaders/types";

type Props = PageLoadError;

export function PageError({ message }: Props) {
    return (
        <section class="page-error">
            <h1>Unable to load this page</h1>
            <p>{message}</p>
            <a href={HOME_PAGE_URL}>Return home</a>
        </section>
    );
}
