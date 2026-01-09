/**
 * The code is taken from [signalwire docs](https://github.com/signalwire/docs/tree/eb2ff7ee3a6029edea4b0a1643ef65a05a195f88/website/src/plugins/docusaurus-plugin-og).
 */

import { createCanvas, loadImage, registerFont } from "canvas";
import * as path from "path";
import * as fs from "fs";

interface DocusaurusMetadata {
    title?: string;
    description?: string;
    routePath: string;
    frontMatter?: Record<string, any>;
    contentTitle?: string;
    category?: string;
    permalink?: string;
    editUrl?: string;
    tags?: Array<{ label: string; permalink: string }>;
    version?: string;
    lastUpdatedAt?: number;
    lastUpdatedBy?: string;
    formattedLastUpdatedAt?: string;
    [key: string]: any;
}

interface CanvasGeneratorParams {
    metadata: DocusaurusMetadata;
    assetsDir: string;
}

function registerSignalWireFonts(assetsDir: string) {
    try {
        const assetsPath = path.join(process.cwd(), assetsDir);

        const poppinsRegularPath = path.join(assetsPath, "Poppins-Regular.ttf");
        const poppinsBoldPath = path.join(assetsPath, "Poppins-Bold.ttf");

        if (fs.existsSync(poppinsRegularPath)) {
            registerFont(poppinsRegularPath, {
                family: "Poppins",
                weight: "normal",
            });
        }

        if (fs.existsSync(poppinsBoldPath)) {
            registerFont(poppinsBoldPath, { family: "Poppins", weight: "900" });
        }
    } catch (error) {
        console.warn("Could not register SignalWire fonts:", error);
    }
}

export async function ogGenerator(
    params: CanvasGeneratorParams,
): Promise<Buffer> {
    const { metadata, assetsDir } = params;

    console.log(metadata);

    // SignalWire-specific settings
    const width = 1200;
    const height = 630;
    const backgroundColor = "#2e8555";
    const textColor = "#ffffff";

    const title = metadata?.title || metadata?.contentTitle || "Page";
    const description = metadata?.description;

    registerSignalWireFonts(assetsDir);

    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext("2d");

    try {
        const backgroundPath = path.join(
            process.cwd(),
            assetsDir,
            "background.png",
        );
        const backgroundImage = await loadImage(backgroundPath);

        ctx.drawImage(backgroundImage, 0, 0, width, height);
    } catch (error) {
        console.warn(
            "Could not load background image, using solid color fallback:",
            error,
        );
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, width, height);
    }

    ctx.fillStyle = textColor;
    ctx.font = `900 55px Poppins`;
    ctx.textAlign = "left";
    ctx.textBaseline = "top";

    const maxWidth = width - 166;
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

    const titleLineHeight = 55 * 1.2;
    const titleX = 83;
    const titleY = 283;

    const titleHeight = lines.length * titleLineHeight;

    lines.forEach((line, index) => {
        ctx.fillText(line, titleX, titleY + index * titleLineHeight);
    });

    if (description) {
        ctx.font = `normal 22px Poppins`;
        ctx.fillStyle = textColor;
        ctx.globalAlpha = 0.8;

        const descriptionX = 83;
        const descriptionY = titleY + titleHeight + 30; // Add 20px spacing
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

        const descriptionLineHeight = 22 * 1.2;
        descriptionLines.forEach((line, index) => {
            ctx.fillText(
                line,
                descriptionX,
                descriptionY + index * descriptionLineHeight,
            );
        });

        ctx.globalAlpha = 1.0;
    }

    return canvas.toBuffer("image/png");
}
