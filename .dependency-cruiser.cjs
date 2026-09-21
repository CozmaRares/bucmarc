module.exports = {
    forbidden: [
        {
            name: "no-circular-runtime-dependencies",
            severity: "error",
            from: { path: "^src" },
            to: { circular: true },
        },
    ],
    options: {
        includeOnly: "^src",
        progress: { type: "none" },
        tsConfig: { fileName: "tsconfig.json" },
    },
};
