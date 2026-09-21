import path from "node:path";
import tsParser from "@typescript-eslint/parser";

const dbQueryConciseCallback = {
    meta: {
        type: "problem",
        docs: {
            description:
                "Require dbQuery callbacks to be concise arrow functions.",
        },
        schema: [],
        messages: {
            missingCallback:
                "dbQuery must receive a concise arrow function callback.",
            nonArrowCallback:
                "dbQuery callback must be an arrow function so it stays inline with the query.",
            blockCallback:
                "dbQuery callback must not use braces. Keep it to one returned query expression.",
        },
    },
    create(context) {
        return {
            CallExpression(node) {
                if (node.callee.type !== "Identifier") {
                    return;
                }

                if (node.callee.name !== "dbQuery") {
                    return;
                }

                const callback = node.arguments[1];

                if (!callback) {
                    context.report({
                        node,
                        messageId: "missingCallback",
                    });
                    return;
                }

                if (callback.type !== "ArrowFunctionExpression") {
                    context.report({
                        node: callback,
                        messageId: "nonArrowCallback",
                    });
                    return;
                }

                if (callback.body.type === "BlockStatement") {
                    context.report({
                        node: callback.body,
                        messageId: "blockCallback",
                    });
                }
            },
        };
    },
};

const allowedDbImportsOutsideDal = new Set([
    "@/db/dal",
    "@/db/dal/index",
    "@/db/dal/index.ts",
]);

const noPrivateDbImportOutsideDal = {
    meta: {
        type: "problem",
        docs: {
            description:
                "Disallow importing private database modules outside the DAL.",
        },
        schema: [],
        messages: {
            privateDbImport:
                "Database imports outside src/db/dal must go through @/db/dal.",
        },
    },
    create(context) {
        const filename = context.filename ?? context.getFilename();
        const normalizedFilename = filename.split(path.sep).join("/");
        const isDalFile = /(^|\/)src\/db\/dal\/.+\.[cm]?[jt]sx?$/.test(
            normalizedFilename,
        );

        return {
            ImportDeclaration(node) {
                if (isDalFile) {
                    return;
                }

                if (typeof node.source.value !== "string") {
                    return;
                }

                if (!node.source.value.startsWith("@/db/")) {
                    return;
                }

                if (!allowedDbImportsOutsideDal.has(node.source.value)) {
                    context.report({
                        node,
                        messageId: "privateDbImport",
                    });
                }
            },
        };
    },
};

const noLayerInversion = {
    meta: {
        type: "problem",
        docs: {
            description:
                "Keep database access and pure library modules below application services.",
        },
        schema: [],
        messages: {
            databaseToService:
                "Database access modules must not import application services.",
            pureLibraryToDatabase:
                "Pure library modules must not import database values.",
            pureLibraryToService:
                "Pure library modules must not import application services.",
            pageToDataLayer:
                "Pages must not import database or service values. Use a page loader instead.",
        },
    },
    create(context) {
        const filename = context.filename ?? context.getFilename();
        const normalizedFilename = filename.split(path.sep).join("/");
        const isDalFile = /(^|\/)src\/db\/dal\/.+\.[cm]?[jt]sx?$/.test(
            normalizedFilename,
        );
        const isLibraryFile = /(^|\/)src\/lib\/.+\.[cm]?[jt]sx?$/.test(
            normalizedFilename,
        );
        const isServiceFile =
            /(^|\/)src\/lib\/services\/.+\.[cm]?[jt]sx?$/.test(
                normalizedFilename,
            );
        const isPureLibraryFile = isLibraryFile && !isServiceFile;
        const isPageFile = /(^|\/)src\/pages\/.+\.[cm]?[jt]sx?$/.test(
            normalizedFilename,
        );

        return {
            ImportDeclaration(node) {
                if (typeof node.source.value !== "string") {
                    return;
                }

                if (
                    isDalFile &&
                    node.source.value.startsWith("@/lib/services/")
                ) {
                    context.report({
                        node,
                        messageId: "databaseToService",
                    });
                }

                if (
                    isPureLibraryFile &&
                    node.importKind !== "type" &&
                    node.source.value.startsWith("@/db/")
                ) {
                    context.report({
                        node,
                        messageId: "pureLibraryToDatabase",
                    });
                }

                if (
                    isPureLibraryFile &&
                    node.source.value.startsWith("@/lib/services/")
                ) {
                    context.report({
                        node,
                        messageId: "pureLibraryToService",
                    });
                }

                if (
                    isPageFile &&
                    node.importKind !== "type" &&
                    (node.source.value.startsWith("@/db/") ||
                        node.source.value.startsWith("@/lib/services/"))
                ) {
                    context.report({
                        node,
                        messageId: "pageToDataLayer",
                    });
                }
            },
        };
    },
};

export default [
    {
        ignores: ["dist/**", "node_modules/**"],
    },
    {
        files: ["**/*.{js,jsx,ts,tsx}"],
        languageOptions: {
            parser: tsParser,
            parserOptions: {
                ecmaVersion: "latest",
                sourceType: "module",
            },
        },
        plugins: {
            local: {
                rules: {
                    "db-query-concise-callback": dbQueryConciseCallback,
                    "no-private-db-import-outside-dal":
                        noPrivateDbImportOutsideDal,
                    "no-layer-inversion": noLayerInversion,
                },
            },
        },
        rules: {
            "local/db-query-concise-callback": "error",
            "local/no-private-db-import-outside-dal": "error",
            "local/no-layer-inversion": "error",
        },
    },
];
