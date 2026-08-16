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

const connectionImports = new Set([
    "../connection",
    "../connection.ts",
    "@/db/connection",
    "@/db/connection.ts",
]);

const noConnectionImportOutsideDal = {
    meta: {
        type: "problem",
        docs: {
            description:
                "Disallow importing the database connection outside the DAL.",
        },
        schema: [],
        messages: {
            outsideDal:
                "Database connection imports are only allowed from src/db/dal files.",
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

                if (
                    typeof node.source.value === "string" &&
                    connectionImports.has(node.source.value)
                ) {
                    context.report({
                        node,
                        messageId: "outsideDal",
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
                    "no-connection-import-outside-dal":
                        noConnectionImportOutsideDal,
                },
            },
        },
        rules: {
            "local/db-query-concise-callback": "error",
            "local/no-connection-import-outside-dal": "error",
        },
    },
];
