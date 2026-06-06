import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

type Issue = {
    path: string;
    status: string;
    title: string;
};

const scratchDir = ".scratch";
const triageLabelsPath = "docs/agents/triage-labels.md";

async function main() {
    const statusOrder = await readStatusOrder(triageLabelsPath);
    const issues = await readIssues(scratchDir);
    const grouped = groupIssues(issues, statusOrder);

    console.log(formatReport(grouped, statusOrder, issues.length));
}

async function readStatusOrder(filePath: string) {
    const source = await readFile(filePath, "utf8");
    const statuses: string[] = [];

    for (const line of source.split("\n")) {
        const cells = line
            .split("|")
            .map(cell => cell.trim().replace(/^`|`$/g, ""));

        const trackerLabel = cells[2];
        if (
            trackerLabel &&
            trackerLabel !== "Label in our tracker" &&
            trackerLabel !== "--------------------"
        ) {
            statuses.push(trackerLabel);
        }
    }

    return statuses;
}

async function readIssues(dir: string): Promise<Issue[]> {
    const files = await findIssueFiles(dir);
    const issues = await Promise.all(
        files.map(async filePath => {
            const source = await readFile(filePath, "utf8");

            return {
                path: filePath,
                status: readStatus(source),
                title: readTitle(source) ?? path.basename(filePath, ".md"),
            };
        }),
    );

    return issues.sort((a, b) => a.path.localeCompare(b.path));
}

async function findIssueFiles(dir: string): Promise<string[]> {
    const entries = await readdir(dir, { withFileTypes: true });
    const files = await Promise.all(
        entries.map(async entry => {
            const entryPath = path.join(dir, entry.name);

            if (entry.isDirectory()) {
                return findIssueFiles(entryPath);
            }

            if (
                entry.isFile() &&
                entry.name.endsWith(".md") &&
                path.basename(path.dirname(entryPath)) === "issues"
            ) {
                return [entryPath];
            }

            return [];
        }),
    );

    return files.flat();
}

function readStatus(source: string) {
    return (
        source.match(/^Status:\s*(.+)\s*$/m)?.[1]?.trim() ?? "missing-status"
    );
}

function readTitle(source: string) {
    return source.match(/^#\s+(.+)\s*$/m)?.[1]?.trim();
}

function groupIssues(issues: Issue[], statusOrder: string[]) {
    const knownStatuses = new Set(statusOrder);
    const unknownStatuses = [
        ...new Set(
            issues
                .map(issue => issue.status)
                .filter(status => !knownStatuses.has(status)),
        ),
    ].sort((a, b) => a.localeCompare(b));

    return [...statusOrder, ...unknownStatuses].map(status => ({
        status,
        issues: issues.filter(issue => issue.status === status),
    }));
}

function formatReport(
    grouped: Array<{ status: string; issues: Issue[] }>,
    statusOrder: string[],
    issueCount: number,
) {
    const generatedAt = new Date().toISOString();
    const nonEmptyGroups = grouped.filter(group => group.issues.length > 0);
    const lines = [
        "# Issue Report",
        "",
        `Generated: ${generatedAt}`,
        `Source: ${scratchDir}/**/issues/*.md`,
        `Triage order: ${statusOrder.join(", ")}`,
        "",
        "## Summary",
        "",
        "| Status | Count |",
        "| --- | ---: |",
        ...nonEmptyGroups.map(
            group => `| ${group.status} | ${group.issues.length} |`,
        ),
        `| Total | ${issueCount} |`,
        "",
    ];

    for (const group of nonEmptyGroups) {
        lines.push(`## ${group.status} (${group.issues.length})`, "");

        for (const issue of group.issues) {
            lines.push(`- ${issue.title} (${issue.path})`);
        }

        lines.push("");
    }

    return lines.join("\n").trimEnd();
}

main().catch(error => {
    console.error(error);
    process.exitCode = 1;
});
