import { createCanvas } from "canvas";
import { CanvasGeneratorParams } from "./types.js";

export async function defaultCanvasGenerator(
    params: CanvasGeneratorParams,
): Promise<Buffer> {
    const { metadata, assetsDir } = params;

    const width = 1200;
    const height = 630;
    const backgroundColor = "#ffffff";
    const textColor = "#000000";
    const fontSize = 48;
    const fontFamily = "Arial";

    const title = metadata.title || metadata.contentTitle || "Page";
    const description = metadata.description;

    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = textColor;
    ctx.font = `${fontSize}px ${fontFamily}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const maxWidth = width - 100;
    const words = title.split(" ");
    const lines: string[] = [];
    let currentLine = "";

    for (const word of words) {
        const testLine = currentLine + (currentLine ? " " : "") + word;
        const metrics = ctx.measureText(testLine);

        if (metrics.width > maxWidth && currentLine) {
            lines.push(currentLine);
            currentLine = word;
        } else {
            currentLine = testLine;
        }
    }
    lines.push(currentLine);

    const lineHeight = fontSize * 1.2;
    let startY = height / 2 - ((lines.length - 1) * lineHeight) / 2;

    if (description) {
        startY -= fontSize * 0.3;
    }

    lines.forEach((line, index) => {
        ctx.fillText(line, width / 2, startY + index * lineHeight);
    });

    if (description) {
        ctx.font = `${fontSize * 0.6}px ${fontFamily}`;
        ctx.fillStyle = textColor;
        ctx.globalAlpha = 0.8;

        const descriptionY =
            startY + lines.length * lineHeight + fontSize * 0.5;
        const descriptionWords = description.split(" ");
        const descriptionLines: string[] = [];
        let currentDescLine = "";

        for (const word of descriptionWords) {
            const testLine =
                currentDescLine + (currentDescLine ? " " : "") + word;
            const metrics = ctx.measureText(testLine);

            if (metrics.width > maxWidth && currentDescLine) {
                descriptionLines.push(currentDescLine);
                currentDescLine = word;
            } else {
                currentDescLine = testLine;
            }
        }
        descriptionLines.push(currentDescLine);

        const descriptionLineHeight = fontSize * 0.6 * 1.2;
        descriptionLines.forEach((line, index) => {
            ctx.fillText(
                line,
                width / 2,
                descriptionY + index * descriptionLineHeight,
            );
        });

        ctx.globalAlpha = 1.0;
    }

    ctx.strokeStyle = "#e0e0e0";
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, width, height);

    return canvas.toBuffer("image/png");
}
