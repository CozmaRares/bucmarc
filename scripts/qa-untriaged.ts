import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

type QaReport = {
    path: string;
    status: string;
    title: string;
};

const qaDir = ".scratch/qa";
const untriagedStatus = "needs-triage";

async function main() {
    const reports = await readQaReports(qaDir);
    const untriagedReports = reports.filter(
        report => report.status === untriagedStatus,
    );

    console.log(formatReport(untriagedReports, reports.length));
}

async function readQaReports(dir: string): Promise<QaReport[]> {
    const files = await findQaReportFiles(dir);
    const reports = await Promise.all(
        files.map(async filePath => {
            const source = await readFile(filePath, "utf8");

            return {
                path: filePath,
                status: readStatus(source),
                title:
                    readTitle(source) ?? path.basename(path.dirname(filePath)),
            };
        }),
    );

    return reports.sort((a, b) => a.path.localeCompare(b.path));
}

async function findQaReportFiles(dir: string): Promise<string[]> {
    let entries;

    try {
        entries = await readdir(dir, { withFileTypes: true });
    } catch (error) {
        if (isNotFoundError(error)) {
            return [];
        }

        throw error;
    }

    const files = await Promise.all(
        entries.map(async entry => {
            const entryPath = path.join(dir, entry.name);

            if (entry.isDirectory()) {
                return findQaReportFiles(entryPath);
            }

            if (entry.isFile() && entry.name === "REPORT.md") {
                return [entryPath];
            }

            return [];
        }),
    );

    return files.flat();
}

function isNotFoundError(error: unknown) {
    return (
        error instanceof Error &&
        "code" in error &&
        (error as NodeJS.ErrnoException).code === "ENOENT"
    );
}

function readStatus(source: string) {
    return (
        source.match(/^Status:\s*(.+)\s*$/m)?.[1]?.trim() ?? "missing-status"
    );
}

function readTitle(source: string) {
    return source.match(/^#\s+(.+)\s*$/m)?.[1]?.trim();
}

function formatReport(reports: QaReport[], totalReportCount: number) {
    const generatedAt = new Date().toISOString();
    const lines = [
        "# Untriaged QA Reports",
        "",
        `Generated: ${generatedAt}`,
        `Source: ${qaDir}/**/REPORT.md`,
        `Untriaged status: ${untriagedStatus}`,
        "",
        "## Summary",
        "",
        `Untriaged QA reports: ${reports.length}`,
        `Total QA reports: ${totalReportCount}`,
        "",
    ];

    if (reports.length === 0) {
        lines.push("No untriaged QA reports found.");
        return lines.join("\n");
    }

    for (const report of reports) {
        lines.push(`- ${report.title} (${report.path}) - ${report.status}`);
    }

    return lines.join("\n");
}

main().catch(error => {
    console.error(error);
    process.exitCode = 1;
});
