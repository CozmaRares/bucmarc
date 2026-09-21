import type { SeriesMatchType } from "./constants";

const namedCapturePattern = /\(\?<([A-Za-z0-9_]*)>/g;

function getNamedCaptures(pattern: string) {
    return [...pattern.matchAll(namedCapturePattern)].map(match => match[1]);
}

export function validateSeriesPattern(
    pattern: string,
    matchType: SeriesMatchType,
) {
    try {
        new RegExp(pattern);
    } catch {
        return "The Series Pattern must be a valid regex.";
    }

    if (matchType === "ambiguous") {
        return;
    }

    const namedCaptures = getNamedCaptures(pattern);

    if (namedCaptures.length === 0) {
        return "The Series Pattern must include one named capture called episode.";
    }

    if (namedCaptures.length > 1) {
        return "The Series Pattern must include only one named capture.";
    }

    if (namedCaptures[0] !== "episode") {
        return "The Series Pattern named capture must be called episode.";
    }
}

export function getEpisodeIdentity(pattern: string, url: string) {
    const regex = new RegExp(pattern, "i");
    const match = regex.exec(url);
    const episode = match?.groups?.episode;
    return episode;
}

function escapeRegexLiteral(value: string) {
    // Escape regex operators while keeping URL slugs readable.
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function createProviderSeriesPattern(pattern: string, title: string) {
    const titleCapture = findNamedCapture(pattern, "title");
    if (!titleCapture) return pattern;

    return (
        pattern.slice(0, titleCapture.start) +
        escapeRegexLiteral(title) +
        pattern.slice(titleCapture.end)
    );
}

export function validateProviderPattern(
    pattern: string,
    matchType: SeriesMatchType,
) {
    try {
        new RegExp(pattern);
    } catch {
        return "The Provider Detection Pattern must be a valid regex.";
    }

    if (matchType === "deterministic") {
        const namedCaptures = getNamedCaptures(pattern);

        if (namedCaptures.length !== 2) {
            return "The Provider Pattern must include one named capture called title and one called episode.";
        }

        if (
            namedCaptures.filter(capture => capture === "title").length !== 1 ||
            namedCaptures.filter(capture => capture === "episode").length !== 1
        ) {
            return "The Provider Pattern named captures must be called title and episode.";
        }
    }

    return validateSeriesPattern(
        createProviderSeriesPattern(pattern, "series-title"),
        matchType,
    );
}

function findNamedCapture(pattern: string, name: string) {
    let escaped = false;
    let inCharacterClass = false;

    for (let index = 0; index < pattern.length; index++) {
        const character = pattern[index];

        if (escaped) {
            escaped = false;
            continue;
        }

        if (character === "\\") {
            escaped = true;
            continue;
        }

        if (inCharacterClass) {
            if (character === "]") inCharacterClass = false;
            continue;
        }

        if (character === "[") {
            inCharacterClass = true;
            continue;
        }

        if (pattern.startsWith(`(?<${name}>`, index)) {
            return findCaptureEnd(pattern, index);
        }
    }
}

function findCaptureEnd(pattern: string, start: number) {
    let depth = 0;
    let escaped = false;
    let inCharacterClass = false;

    for (let index = start; index < pattern.length; index++) {
        const character = pattern[index];

        if (escaped) {
            escaped = false;
            continue;
        }

        if (character === "\\") {
            escaped = true;
            continue;
        }

        if (inCharacterClass) {
            if (character === "]") inCharacterClass = false;
            continue;
        }

        if (character === "[") {
            inCharacterClass = true;
        } else if (character === "(") {
            depth++;
        } else if (character === ")") {
            depth--;
            if (depth === 0) return { start, end: index + 1 };
        }
    }
}
