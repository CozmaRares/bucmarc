import { ASSET_VERSION } from "./assetVersion";

export function assetPath(path: string) {
    const publicPath = path.startsWith("/public/")
        ? path
        : `/public${path.startsWith("/") ? path : `/${path}`}`;
    const separator = publicPath.includes("?") ? "&" : "?";

    return `${publicPath}${separator}v=${encodeURIComponent(ASSET_VERSION)}`;
}
