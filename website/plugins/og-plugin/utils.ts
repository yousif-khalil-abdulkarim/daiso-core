export function generateImageFileName(routePath: string): string {
    let filename =
        routePath === "/"
            ? "home"
            : routePath.replace(/^\//, "").replace(/\//g, "-");

    filename = filename.replace(/[^a-zA-Z0-9-_]/g, "");

    if (!filename) filename = "page";

    return `${filename}.png`;
}

export function generateTitleFromPath(pathname: string): string {
    if (pathname === "/") return "Home";

    const segments = pathname.split("/").filter(Boolean);
    const lastSegment = segments[segments.length - 1];

    if (!lastSegment) return "Page";

    return lastSegment
        .replace(/-/g, " ")
        .replace(/\b\w/g, (l) => l.toUpperCase());
}
