import {
    getProviderPatterns,
    getRegexSnippets,
    type ProviderPattern,
    type RegexSnippet,
} from "@/db/dal";
import { ResultAsync } from "neverthrow";
import { serverError, type PageDataLoader } from "./types";

export type ToolsPageProps = {
    snippets: RegexSnippet[];
    providerPatterns: ProviderPattern[];
};

export const toolsDataLoader: PageDataLoader<ToolsPageProps> = context =>
    ResultAsync.combine([getRegexSnippets(), getProviderPatterns()])
        .map(([snippets, providerPatterns]) => ({
            pageMessage: context.req.query("message"),
            pageStatus: context.req.query("status"),
            snippets,
            providerPatterns,
        }))
        .mapErr(serverError);
