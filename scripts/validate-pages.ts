import { readdirSync } from "node:fs";
import { join } from "node:path";
import { pageRegistry } from "@/pages";

const pagesDir = join(__dirname, "../src/pages");
const pageFiles = readdirSync(pagesDir).filter(file => file.endsWith(".tsx"));

const registeredPages = new Set(pageRegistry.map(({ name }) => name));

const missingPages = pageFiles
    .map(file => file.replace(/\.tsx$/, ""))
    .filter(name => name !== "types")
    .filter(name => !(registeredPages as Set<string>).has(name));

if (missingPages.length > 0) {
    console.error(
        `Missing page registry entries for: ${missingPages.join(", ")}`,
    );
    process.exit(1);
}
