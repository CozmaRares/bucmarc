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
                },
            },
        },
        rules: {
            "local/db-query-concise-callback": "error",
            "local/no-private-db-import-outside-dal": "error",
        },
    },
];
