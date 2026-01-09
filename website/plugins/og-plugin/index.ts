// @ts-ignore
import * as fs from "fs-extra";
import * as path from "path";
import { LoadContext, Plugin } from "@docusaurus/types";

import {
    CanvasGeneratorParams,
    CanvasGenerator,
    PluginOptions,
    GenerateImageOptions,
    DocusaurusMetadata,
} from "./types.js";
import { defaultCanvasGenerator } from "./default-canvas-generator.js";
import { generateImageFileName, generateTitleFromPath } from "./utils.js";

function decodeHtmlEntities(text: string): string {
    const entities: { [key: string]: string } = {
        "&amp;": "&",
        "&lt;": "<",
        "&gt;": ">",
        "&quot;": '"',
        "&#39;": "'",
        "&#x27;": "'",
        "&apos;": "'",
    };

    return text.replace(/&[#\w]+;/g, (match) => {
        if (entities[match]) {
            return entities[match];
        }

        // Handle numeric entities like &#39;
        if (match.startsWith("&#") && match.endsWith(";")) {
            const num = match.slice(2, -1);
            if (num.startsWith("x")) {
                // Hexadecimal
                const code = parseInt(num.slice(1), 16);
                return String.fromCharCode(code);
            } else {
                // Decimal
                const code = parseInt(num, 10);
                return String.fromCharCode(code);
            }
        }

        return match;
    });
}

function cleanTitle(title: string): string {
    // Remove everything after the last pipe character
    const lastPipeIndex = title.lastIndexOf("|");
    if (lastPipeIndex !== -1) {
        return title.substring(0, lastPipeIndex).trim();
    }
    return title;
}

async function extractMetadataFromHtml(
    routePath: string,
    outDir: string,
    siteUrl: string,
): Promise<{ title: string; description: string } | null> {
    // Try primary path first: outDir + routePath + .html
    let htmlPath = path.join(outDir, routePath + ".html");

    try {
        await fs.access(htmlPath);
    } catch {
        // If primary path doesn't exist, try index.html version
        htmlPath = path.join(outDir, routePath, "index.html");
        try {
            await fs.access(htmlPath);
        } catch {
            console.warn(`HTML file not found for route: ${routePath}`);
            return null;
        }
    }

    try {
        let htmlContent = await fs.readFile(htmlPath, "utf8");

        // Extract title from <title> tag
        const titleMatch = htmlContent.match(/<title[^>]*>(.*?)<\/title>/i);
        const rawTitle = titleMatch
            ? decodeHtmlEntities(titleMatch[1].trim())
            : generateTitleFromPath(routePath);
        const title = cleanTitle(rawTitle);

        // Extract description from meta description tag
        const descriptionMatch = htmlContent.match(
            /<meta[^>]*name="description"[^>]*content="([^"]*)"[^>]*>/i,
        );
        const description = descriptionMatch
            ? decodeHtmlEntities(descriptionMatch[1].trim())
            : "";

        // Generate og:image URL
        const imageFileName = generateImageFileName(routePath);
        const ogImageUrl = `${siteUrl.replace(/\/$/, "")}/preview_images/${imageFileName}`;

        // Create og:image meta tags
        const ogImageTags = [
            `<meta property="og:image" content="${ogImageUrl}" />`,
            `<meta property="twitter:image" content="${ogImageUrl}" />`,
            `<meta property="twitter:card" content="summary_large_image" />`,
        ].join("\n    ");

        // Check if og:image already exists and replace it, or add it
        const ogImageRegex = /<meta[^>]*property="og:image"[^>]*>/i;
        if (ogImageRegex.test(htmlContent)) {
            // Replace existing og:image
            htmlContent = htmlContent.replace(ogImageRegex, ogImageTags);
        } else {
            // Add new og:image tags - insert before </head>
            const headCloseRegex = /<\/head>/i;
            if (headCloseRegex.test(htmlContent)) {
                htmlContent = htmlContent.replace(
                    headCloseRegex,
                    `    ${ogImageTags}\n  </head>`,
                );
            }
        }

        // Write the modified HTML back to the file
        await fs.writeFile(htmlPath, htmlContent, "utf8");

        return {
            title,
            description,
        };
    } catch (error) {
        console.error(`Error reading HTML file ${htmlPath}:`, error);
        return null;
    }
}

async function generatePreviewImage(
    metadata: DocusaurusMetadata,
    outputDir: string,
    options: GenerateImageOptions,
): Promise<void> {
    const { canvasGenerator, assetsDir } = options;

    const canvasParams: CanvasGeneratorParams = {
        metadata,
        assetsDir,
    };

    const buffer = await canvasGenerator(canvasParams);

    const imageFileName = generateImageFileName(metadata.routePath);
    const imagePath = path.join(outputDir, imageFileName);

    await fs.writeFile(imagePath, buffer);

    console.log(`Generated: ${imageFileName}`);
}

export default function previewImageGeneratorPlugin(
    context: LoadContext,
    options: PluginOptions,
): Plugin<void> {
    const { siteDir, outDir, siteConfig } = context;
    const { canvasGenerator = defaultCanvasGenerator, assetsDir = "assets" } =
        options;

    return {
        name: "preview-image-generator",

        async postBuild(props): Promise<void> {
            console.log("🖼️  Generating preview images...");
            const previewImagesDir = path.join(outDir, "preview_images");
            await fs.ensureDir(previewImagesDir);

            for (const routePath of props.routesPaths) {
                try {
                    const htmlMetadata = await extractMetadataFromHtml(
                        routePath,
                        outDir,
                        siteConfig.url,
                    );

                    if (!htmlMetadata) {
                        console.warn(
                            `Skipping image generation for ${routePath} - no HTML metadata found`,
                        );
                        continue;
                    }

                    const metadata: DocusaurusMetadata = {
                        title: htmlMetadata.title,
                        description: htmlMetadata.description,
                        routePath,
                        frontMatter: {},
                        contentTitle: htmlMetadata.title,
                    };

                    await generatePreviewImage(metadata, previewImagesDir, {
                        canvasGenerator,
                        assetsDir,
                    });
                } catch (error) {
                    console.error(
                        `Error generating preview image for ${routePath}:`,
                        error,
                    );
                }
            }

            console.log(
                `✅ Generated ${props.routesPaths.length} preview images`,
            );
        },
    };
}

export { defaultCanvasGenerator };
export type { CanvasGenerator, CanvasGeneratorParams, PluginOptions };
