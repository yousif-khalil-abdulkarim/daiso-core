/**
 * The code is taken from [signalwire docs](https://github.com/signalwire/docs/blob/main/website/config/ogImages/signalwireOgGenerator.ts)
 */

import { themes as prismThemes } from "prism-react-renderer";
import type { Config, PluginModule } from "@docusaurus/types";
import type * as Preset from "@docusaurus/preset-classic";
// @ts-ignore
import docusaurusPluginLlmsTxt, {
    type PluginOptions,
} from "@signalwire/docusaurus-plugin-llms-txt";
import { ogGenerator } from "./utilities/og-generator.js";
import { PACKAGE_NAME, PACKAGE_VERSION } from "./utilities/package-json-data.js";
import codeImport from "remark-code-import";
import path from "path";

/**
 * Webpack tweaks required because this package is ESM (`"type": "module"`) and
 * uses fully extensioned, NodeNext-style relative imports.
 *
 * 1. `resolve.extensionAlias`
 *    TypeScript (`moduleResolution: nodenext`) maps a `./foo.js` specifier onto
 *    `foo.ts`/`foo.tsx`. Webpack does not, so without this alias every `.js`
 *    specifier fails with "Module not found".
 *
 * 2. `module.rules[].type = "javascript/auto"`
 *    Because `package.json` has `"type": "module"`, Webpack applies its default
 *    rule `{ test: /\.js$/i, descriptionData: { type: "module" }, type:
 *    "javascript/esm" }` to every `.js` file in this package. For ESM modules
 *    Webpack does not run `CommonJsImportsParserPlugin`, so `require.resolveWeak()`
 *    is left in the bundle as a literal call. Docusaurus generates
 *    `.docusaurus/registry.js` with exactly that call, and the SSG `require` shim
 *    (`ssgNodeRequire.ts`) only exposes `.resolve/.cache/.extensions/.main` — so
 *    the SSG step crashes with "require.resolveWeak is not a function".
 *    Pinning the generated files back to `javascript/auto` restores the rewrite.
 *    (`javascript/auto` accepts both `import`/`export` and `require`, so the
 *    generated `export default` object still parses.)
 */
const webpackEsmTweaksPlugin: PluginModule = () => {
    const docusaurusGeneratedDir = path.resolve(__dirname, ".docusaurus");

    return {
        name: "webpack-esm-tweaks-plugin",
        configureWebpack() {
            return {
                resolve: {
                    extensionAlias: {
                        ".js": [".ts", ".tsx", ".js"],
                    },
                },
                module: {
                    rules: [
                        {
                            test: /\.js$/,
                            include: [docusaurusGeneratedDir],
                            type: "javascript/auto",
                        },
                    ],
                },
            };
        },
    };
};

const title = `${PACKAGE_NAME} ${PACKAGE_VERSION}`;
const config: Config = {
    title: title,
    tagline:
        "Write business logic once. Replace infrastructure anytime. The adapter-first backend toolkit for TypeScript.",
    favicon: "img/favicon.ico",

    // Set the production url of your site here
    url: "https://www.eridu-tech.dev/",

    // Set the /<baseUrl>/ pathname under which your site is served
    // For GitHub pages deployment, it is often '/<projectName>/'
    baseUrl: "/",

    // GitHub pages deployment config.
    // If you aren't using GitHub pages, you don't need these.
    organizationName: "yousif-khalil-abdulkarim", // Usually your GitHub org/user name.
    projectName: PACKAGE_NAME, // Usually your repo name.

    onBrokenLinks: "throw",
    markdown: {
        hooks: {
            onBrokenMarkdownLinks: "throw",
        },
    },

    // Even if you don't use internationalization, you can use this field to set
    // useful metadata like html lang. For example, if your site is Chinese, you
    // may want to replace "en" with "zh-Hans".
    i18n: {
        defaultLocale: "en",
        locales: ["en"],
    },

    plugins: [
        webpackEsmTweaksPlugin,
        [
            docusaurusPluginLlmsTxt,
            {
                siteTitle: PACKAGE_NAME,
                siteDescription: `Mastering ${PACKAGE_NAME}: Comprehensive Guides for the Backend Server Component Library`,
                enableDescriptions: true,
                content: {
                    relativePaths: true,
                    includeDocs: true,
                    includeVersionedDocs: false,
                    includeBlog: false,
                    includePages: false,
                    includeGeneratedIndex: false,
                    enableLlmsFullTxt: true,
                },
            } satisfies PluginOptions,
        ],
        [
            require.resolve("./plugins/og-plugin/index.ts"),
            {
                ogGenerator,
                assetsDir: "og-assets",
            },
        ],
    ],

    presets: [
        [
            "classic",
            {
                docs: {
                    sidebarPath: "./sidebars.ts",
                    // Please change this to your repo.
                    // Remove this to remove the "edit this page" links.
                    editUrl:
                        "https://github.com/eridu-tech/eridu-tech-core/tree/main/website/",
                    remarkPlugins: [
                        [codeImport, { rootDir: path.resolve(__dirname) }],
                    ],
                },
                blog: {
                    showReadingTime: true,
                    feedOptions: {
                        type: ["rss", "atom"],
                        xslt: true,
                    },
                    onInlineTags: "warn",
                    onInlineAuthors: "warn",
                    onUntruncatedBlogPosts: "warn",
                },
                theme: {
                    customCss: "./src/css/custom.css",
                },
            } satisfies Preset.Options,
        ],
    ],

    themeConfig: {
        algolia:
            process.env["ALGOLIA_ID"] &&
            process.env["ALGOLIA_KEY"] &&
            process.env["ALGOLIA_INDEX"]
                ? {
                      appId: process.env["ALGOLIA_ID"],
                      apiKey: process.env["ALGOLIA_KEY"],
                      indexName: process.env["ALGOLIA_INDEX"],
                  }
                : undefined,
        docs: {
            sidebar: {
                hideable: true,
            },
        },
        // Site-wide social card, generated by `npm run og:social-card`
        image: "img/og-social-card.png",
        navbar: {
            title: PACKAGE_NAME,
            logo: {
                alt: `${PACKAGE_NAME} Logo`,
                src: "img/logo.svg",
            },
            items: [
                {
                    type: "docSidebar",
                    sidebarId: "docs",
                    position: "left",
                    label: "Docs",
                },
                {
                    to: "/blog",
                    label: "Blog",
                    position: "left",
                },
                {
                    to: "/roadmap",
                    label: "Roadmap",
                    position: "left",
                },
                {
                    label: "API docs",
                    href: "https://eridu-tech.github.io/eridu-tech-core/modules.html",
                    position: "left",
                },
                {
                    href: "https://github.com/eridu-tech/eridu-tech-core/",
                    label: "GitHub",
                    position: "right",
                },
                {
                    href: "https://www.npmjs.com/package/eridu-tech",
                    label: "NPM",
                    position: "right",
                },
            ],
        },
        footer: {
            style: "dark",
            copyright: `© ${String(new Date().getFullYear())} ${PACKAGE_NAME}. Built with Docusaurus.`,
        },
        prism: {
            theme: prismThemes.github,
            darkTheme: prismThemes.dracula,
        },
        metadata: [
            {
                name: "Descriptions",
                content:
                    "Write business logic once. Replace infrastructure anytime. The adapter-first backend toolkit for TypeScript with interchangeable components — cache, locks, file storage, event bus, and more.",
            },
            { name: "robots", content: "index, follow" },
        ],
    } satisfies Preset.ThemeConfig,
};

export default config;
