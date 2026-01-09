export interface DocusaurusMetadata {
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

export interface CanvasGeneratorParams {
    metadata: DocusaurusMetadata;
    assetsDir: string;
}

export type CanvasGenerator = (
    params: CanvasGeneratorParams,
) => Promise<Buffer> | Buffer;

export interface PluginOptions {
    canvasGenerator?: CanvasGenerator;
    assetsDir?: string;
}

export interface GenerateImageOptions {
    canvasGenerator: CanvasGenerator;
    assetsDir: string;
}
