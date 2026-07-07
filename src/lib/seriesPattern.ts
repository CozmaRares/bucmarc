const namedCapturePattern = /\(\?<([A-Za-z0-9_]*)>/g;

export function validateSeriesPattern(pattern: string) {
    try {
        new RegExp(pattern);
    } catch {
        return "The Series Pattern must be a valid regex.";
    }

    const namedCaptures = [...pattern.matchAll(namedCapturePattern)].map(
        match => match[1],
    );

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
