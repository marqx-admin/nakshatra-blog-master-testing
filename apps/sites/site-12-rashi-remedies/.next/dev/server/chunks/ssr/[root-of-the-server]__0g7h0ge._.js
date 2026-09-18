module.exports = [
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/node:stream [external] (node:stream, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("node:stream", () => require("node:stream"));

module.exports = mod;
}),
"[project]/apps/sites/site-12-rashi-remedies/src/pages/index.tsx [ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__,
    "getServerSideProps",
    ()=>getServerSideProps
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$sites$2f$site$2d$12$2d$rashi$2d$remedies$2f$src$2f$site$2f$pages$2f$router$2f$public$2d$route$2d$page$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/sites/site-12-rashi-remedies/src/site/pages/router/public-route-page.tsx [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$sites$2f$site$2d$12$2d$rashi$2d$remedies$2f$src$2f$site$2f$lib$2f$ssr$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/sites/site-12-rashi-remedies/src/site/lib/ssr.ts [ssr] (ecmascript)");
;
;
const getServerSideProps = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$sites$2f$site$2d$12$2d$rashi$2d$remedies$2f$src$2f$site$2f$lib$2f$ssr$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["createPublicGetServerSideProps"])([
    "PUB-HOME-01"
]);
const __TURBOPACK__default__export__ = __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$sites$2f$site$2d$12$2d$rashi$2d$remedies$2f$src$2f$site$2f$pages$2f$router$2f$public$2d$route$2d$page$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["PublicRoutePage"];
}),
"[project]/apps/sites/site-12-rashi-remedies/src/site/components/article-body.tsx [ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ArticleBodyRenderer",
    ()=>ArticleBodyRenderer
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react/jsx-dev-runtime [external] (react/jsx-dev-runtime, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$sites$2f$site$2d$12$2d$rashi$2d$remedies$2f$src$2f$site$2f$components$2f$destination$2d$link$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/sites/site-12-rashi-remedies/src/site/components/destination-link.tsx [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$sites$2f$site$2d$12$2d$rashi$2d$remedies$2f$src$2f$site$2f$components$2f$responsive$2d$media$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/sites/site-12-rashi-remedies/src/site/components/responsive-media.tsx [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$sites$2f$site$2d$12$2d$rashi$2d$remedies$2f$src$2f$site$2f$components$2f$semantic$2d$components$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/sites/site-12-rashi-remedies/src/site/components/semantic-components.tsx [ssr] (ecmascript)");
;
;
;
;
function ArticleBodyRenderer({ blocks }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
        className: "article-body",
        "data-component-id": "CMP12-ARTICLE-BODY",
        children: blocks.map((block)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(ArticleBlock, {
                block: block
            }, block.block_id, false, {
                fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/article-body.tsx",
                lineNumber: 7,
                columnNumber: 102
            }, this))
    }, void 0, false, {
        fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/article-body.tsx",
        lineNumber: 7,
        columnNumber: 10
    }, this);
}
function ArticleBlock({ block }) {
    switch(block.type){
        case "PARAGRAPH":
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(ParagraphBlock, {
                value: block.payload.content
            }, void 0, false, {
                fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/article-body.tsx",
                lineNumber: 12,
                columnNumber: 30
            }, this);
        case "HEADING":
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(HeadingBlock, {
                level: block.payload.level,
                value: block.payload.content
            }, void 0, false, {
                fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/article-body.tsx",
                lineNumber: 13,
                columnNumber: 28
            }, this);
        case "LIST":
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(ListBlock, {
                ordered: block.payload.style === "ORDERED",
                items: block.payload.items
            }, void 0, false, {
                fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/article-body.tsx",
                lineNumber: 14,
                columnNumber: 25
            }, this);
        case "QUOTE":
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(QuoteBlock, {
                quote: block.payload.quote,
                attribution: block.payload.attribution,
                source: block.payload.source
            }, void 0, false, {
                fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/article-body.tsx",
                lineNumber: 15,
                columnNumber: 26
            }, this);
        case "SEPARATOR":
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(SeparatorBlock, {}, void 0, false, {
                fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/article-body.tsx",
                lineNumber: 16,
                columnNumber: 30
            }, this);
        case "MEDIA":
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(MediaBlock, {
                payload: block.payload
            }, void 0, false, {
                fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/article-body.tsx",
                lineNumber: 17,
                columnNumber: 26
            }, this);
        case "TABLE":
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(TableBlock, {
                headerRow: block.payload.header_row,
                rows: block.payload.rows
            }, void 0, false, {
                fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/article-body.tsx",
                lineNumber: 18,
                columnNumber: 26
            }, this);
        case "EMBED":
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(EmbedBlock, {
                provider: block.payload.provider_key,
                source: block.payload.source_url_or_id,
                caption: block.payload.caption
            }, void 0, false, {
                fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/article-body.tsx",
                lineNumber: 19,
                columnNumber: 26
            }, this);
        case "CALLOUT":
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(CalloutBlock, {
                label: block.payload.label,
                body: block.payload.body
            }, void 0, false, {
                fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/article-body.tsx",
                lineNumber: 20,
                columnNumber: 28
            }, this);
        case "CTA":
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(CtaBlock, {
                label: block.payload.label,
                supportingText: block.payload.supporting_text,
                destination: block.payload.destination
            }, void 0, false, {
                fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/article-body.tsx",
                lineNumber: 21,
                columnNumber: 24
            }, this);
        case "DISCLAIMER":
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(DisclaimerBlock, {
                label: block.payload.label,
                body: block.payload.body
            }, void 0, false, {
                fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/article-body.tsx",
                lineNumber: 22,
                columnNumber: 31
            }, this);
        case "SOURCES_REFERENCES":
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(SourcesBlock, {
                entries: block.payload.entries
            }, void 0, false, {
                fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/article-body.tsx",
                lineNumber: 23,
                columnNumber: 39
            }, this);
    }
}
function ParagraphBlock({ value }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
        "data-component-id": "CMP12-BLOCK-PARAGRAPH",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$sites$2f$site$2d$12$2d$rashi$2d$remedies$2f$src$2f$site$2f$components$2f$semantic$2d$components$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["RichText"], {
            value: value
        }, void 0, false, {
            fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/article-body.tsx",
            lineNumber: 27,
            columnNumber: 115
        }, this)
    }, void 0, false, {
        fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/article-body.tsx",
        lineNumber: 27,
        columnNumber: 70
    }, this);
}
function HeadingBlock({ level, value }) {
    const Tag = `h${level}`;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(Tag, {
        "data-component-id": "CMP12-BLOCK-HEADING",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$sites$2f$site$2d$12$2d$rashi$2d$remedies$2f$src$2f$site$2f$components$2f$semantic$2d$components$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["RichText"], {
            value: value
        }, void 0, false, {
            fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/article-body.tsx",
            lineNumber: 28,
            columnNumber: 185
        }, this)
    }, void 0, false, {
        fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/article-body.tsx",
        lineNumber: 28,
        columnNumber: 140
    }, this);
}
function ListBlock({ ordered, items }) {
    const Tag = ordered ? "ol" : "ul";
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(Tag, {
        "data-component-id": "CMP12-BLOCK-LIST",
        children: items.map((item, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("li", {
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$sites$2f$site$2d$12$2d$rashi$2d$remedies$2f$src$2f$site$2f$components$2f$semantic$2d$components$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["RichText"], {
                    value: item
                }, void 0, false, {
                    fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/article-body.tsx",
                    lineNumber: 29,
                    columnNumber: 215
                }, this)
            }, index, false, {
                fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/article-body.tsx",
                lineNumber: 29,
                columnNumber: 199
            }, this))
    }, void 0, false, {
        fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/article-body.tsx",
        lineNumber: 29,
        columnNumber: 129
    }, this);
}
function QuoteBlock({ quote, attribution, source }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("blockquote", {
        "data-component-id": "CMP12-BLOCK-QUOTE",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$sites$2f$site$2d$12$2d$rashi$2d$remedies$2f$src$2f$site$2f$components$2f$semantic$2d$components$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["RichText"], {
                    value: quote
                }, void 0, false, {
                    fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/article-body.tsx",
                    lineNumber: 30,
                    columnNumber: 203
                }, this)
            }, void 0, false, {
                fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/article-body.tsx",
                lineNumber: 30,
                columnNumber: 200
            }, this),
            attribution || source ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("footer", {
                children: [
                    attribution ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("cite", {
                        children: attribution
                    }, void 0, false, {
                        fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/article-body.tsx",
                        lineNumber: 30,
                        columnNumber: 281
                    }, this) : null,
                    source ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                        children: source
                    }, void 0, false, {
                        fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/article-body.tsx",
                        lineNumber: 30,
                        columnNumber: 325
                    }, this) : null
                ]
            }, void 0, true, {
                fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/article-body.tsx",
                lineNumber: 30,
                columnNumber: 258
            }, this) : null
        ]
    }, void 0, true, {
        fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/article-body.tsx",
        lineNumber: 30,
        columnNumber: 150
    }, this);
}
function SeparatorBlock() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("hr", {
        "data-component-id": "CMP12-BLOCK-SEPARATOR"
    }, void 0, false, {
        fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/article-body.tsx",
        lineNumber: 31,
        columnNumber: 36
    }, this);
}
function MediaBlock({ payload }) {
    if (payload.resolution_state === "MISSING" || !payload.media) return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$sites$2f$site$2d$12$2d$rashi$2d$remedies$2f$src$2f$site$2f$components$2f$semantic$2d$components$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["MissingMediaFallback"], {
        label: "Article media unavailable"
    }, void 0, false, {
        fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/article-body.tsx",
        lineNumber: 32,
        columnNumber: 171
    }, this);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("figure", {
        "data-component-id": "CMP12-BLOCK-MEDIA",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$sites$2f$site$2d$12$2d$rashi$2d$remedies$2f$src$2f$site$2f$components$2f$responsive$2d$media$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["ResponsiveMedia"], {
                media: payload.media,
                altOverride: payload.alt_override
            }, void 0, false, {
                fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/article-body.tsx",
                lineNumber: 32,
                columnNumber: 284
            }, this),
            payload.caption ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("figcaption", {
                children: payload.caption
            }, void 0, false, {
                fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/article-body.tsx",
                lineNumber: 32,
                columnNumber: 379
            }, this) : null
        ]
    }, void 0, true, {
        fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/article-body.tsx",
        lineNumber: 32,
        columnNumber: 238
    }, this);
}
function TableBlock({ headerRow, rows }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
        className: "table-region",
        role: "region",
        "aria-label": "Article data table",
        tabIndex: 0,
        "data-component-id": "CMP12-BLOCK-TABLE",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("table", {
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("tbody", {
                children: rows.map((row, rowIndex)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("tr", {
                        children: row.map((cell, cellIndex)=>headerRow && rowIndex === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("th", {
                                scope: "col",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$sites$2f$site$2d$12$2d$rashi$2d$remedies$2f$src$2f$site$2f$components$2f$semantic$2d$components$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["RichText"], {
                                    value: cell
                                }, void 0, false, {
                                    fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/article-body.tsx",
                                    lineNumber: 33,
                                    columnNumber: 380
                                }, this)
                            }, cellIndex, false, {
                                fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/article-body.tsx",
                                lineNumber: 33,
                                columnNumber: 348
                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("td", {
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$sites$2f$site$2d$12$2d$rashi$2d$remedies$2f$src$2f$site$2f$components$2f$semantic$2d$components$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["RichText"], {
                                    value: cell
                                }, void 0, false, {
                                    fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/article-body.tsx",
                                    lineNumber: 33,
                                    columnNumber: 433
                                }, this)
                            }, cellIndex, false, {
                                fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/article-body.tsx",
                                lineNumber: 33,
                                columnNumber: 413
                            }, this))
                    }, rowIndex, false, {
                        fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/article-body.tsx",
                        lineNumber: 33,
                        columnNumber: 269
                    }, this))
            }, void 0, false, {
                fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/article-body.tsx",
                lineNumber: 33,
                columnNumber: 233
            }, this)
        }, void 0, false, {
            fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/article-body.tsx",
            lineNumber: 33,
            columnNumber: 226
        }, this)
    }, void 0, false, {
        fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/article-body.tsx",
        lineNumber: 33,
        columnNumber: 99
    }, this);
}
function safeEmbedUrl(value) {
    try {
        const url = new URL(value);
        return url.protocol === "https:" ? url.toString() : undefined;
    } catch  {
        return undefined;
    }
}
function EmbedBlock({ provider, source, caption }) {
    const href = safeEmbedUrl(source);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("aside", {
        className: "embed-fallback",
        "data-component-id": "CMP12-BLOCK-EMBED",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("strong", {
                children: provider
            }, void 0, false, {
                fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/article-body.tsx",
                lineNumber: 35,
                columnNumber: 236
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                children: caption ?? "Embedded media is unavailable in this rendering context."
            }, void 0, false, {
                fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/article-body.tsx",
                lineNumber: 35,
                columnNumber: 263
            }, this),
            href ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("a", {
                href: href,
                target: "_blank",
                rel: "noopener noreferrer",
                children: "Open approved source"
            }, void 0, false, {
                fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/article-body.tsx",
                lineNumber: 35,
                columnNumber: 349
            }, this) : null
        ]
    }, void 0, true, {
        fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/article-body.tsx",
        lineNumber: 35,
        columnNumber: 164
    }, this);
}
function CalloutBlock({ label, body }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("aside", {
        className: "callout",
        "data-component-id": "CMP12-BLOCK-CALLOUT",
        children: [
            label ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("strong", {
                children: label
            }, void 0, false, {
                fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/article-body.tsx",
                lineNumber: 36,
                columnNumber: 177
            }, this) : null,
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$sites$2f$site$2d$12$2d$rashi$2d$remedies$2f$src$2f$site$2f$components$2f$semantic$2d$components$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["RichText"], {
                    value: body
                }, void 0, false, {
                    fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/article-body.tsx",
                    lineNumber: 36,
                    columnNumber: 212
                }, this)
            }, void 0, false, {
                fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/article-body.tsx",
                lineNumber: 36,
                columnNumber: 209
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/article-body.tsx",
        lineNumber: 36,
        columnNumber: 101
    }, this);
}
function CtaBlock({ label, supportingText, destination }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("aside", {
        className: "article-cta",
        "data-component-id": "CMP12-BLOCK-CTA",
        children: [
            supportingText ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                children: supportingText
            }, void 0, false, {
                fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/article-body.tsx",
                lineNumber: 37,
                columnNumber: 288
            }, this) : null,
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$sites$2f$site$2d$12$2d$rashi$2d$remedies$2f$src$2f$site$2f$components$2f$destination$2d$link$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["DestinationLink"], {
                destination: destination,
                className: "button-primary",
                children: label
            }, void 0, false, {
                fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/article-body.tsx",
                lineNumber: 37,
                columnNumber: 319
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/article-body.tsx",
        lineNumber: 37,
        columnNumber: 203
    }, this);
}
function DisclaimerBlock({ label, body }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("aside", {
        className: "disclaimer",
        "data-component-id": "CMP12-BLOCK-DISCLAIMER",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("strong", {
                children: label ?? "Disclaimer"
            }, void 0, false, {
                fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/article-body.tsx",
                lineNumber: 38,
                columnNumber: 177
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$sites$2f$site$2d$12$2d$rashi$2d$remedies$2f$src$2f$site$2f$components$2f$semantic$2d$components$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["RichText"], {
                    value: body
                }, void 0, false, {
                    fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/article-body.tsx",
                    lineNumber: 38,
                    columnNumber: 220
                }, this)
            }, void 0, false, {
                fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/article-body.tsx",
                lineNumber: 38,
                columnNumber: 217
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/article-body.tsx",
        lineNumber: 38,
        columnNumber: 104
    }, this);
}
function SourcesBlock({ entries }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("section", {
        className: "sources",
        "data-component-id": "CMP12-BLOCK-SOURCES",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("h2", {
                children: "Sources and references"
            }, void 0, false, {
                fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/article-body.tsx",
                lineNumber: 39,
                columnNumber: 204
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("ol", {
                children: entries.map((entry, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("li", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("strong", {
                                children: entry.url ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("a", {
                                    href: entry.url,
                                    target: "_blank",
                                    rel: "noopener noreferrer",
                                    children: entry.title
                                }, void 0, false, {
                                    fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/article-body.tsx",
                                    lineNumber: 39,
                                    columnNumber: 327
                                }, this) : entry.title
                            }, void 0, false, {
                                fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/article-body.tsx",
                                lineNumber: 39,
                                columnNumber: 306
                            }, this),
                            entry.publisher ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                children: entry.publisher
                            }, void 0, false, {
                                fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/article-body.tsx",
                                lineNumber: 39,
                                columnNumber: 449
                            }, this) : null,
                            entry.note ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                                children: entry.note
                            }, void 0, false, {
                                fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/article-body.tsx",
                                lineNumber: 39,
                                columnNumber: 501
                            }, this) : null
                        ]
                    }, `${entry.title}-${index}`, true, {
                        fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/article-body.tsx",
                        lineNumber: 39,
                        columnNumber: 270
                    }, this))
            }, void 0, false, {
                fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/article-body.tsx",
                lineNumber: 39,
                columnNumber: 235
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/article-body.tsx",
        lineNumber: 39,
        columnNumber: 135
    }, this);
}
}),
"[project]/apps/sites/site-12-rashi-remedies/src/site/components/destination-link.tsx [ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DestinationLink",
    ()=>DestinationLink
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react/jsx-dev-runtime [external] (react/jsx-dev-runtime, cjs)");
;
function DestinationLink({ destination, children, className, ariaCurrent }) {
    const externalProps = destination.is_external ? {
        target: "_blank",
        rel: "noopener noreferrer"
    } : {};
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("a", {
        href: destination.url,
        className: className,
        "aria-current": ariaCurrent,
        ...externalProps,
        children: children
    }, void 0, false, {
        fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/destination-link.tsx",
        lineNumber: 6,
        columnNumber: 10
    }, this);
}
}),
"[project]/apps/sites/site-12-rashi-remedies/src/site/components/responsive-media.tsx [ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ResponsiveMedia",
    ()=>ResponsiveMedia
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react/jsx-dev-runtime [external] (react/jsx-dev-runtime, cjs)");
;
function srcSet(media, mimeType) {
    const entries = media.variants.filter((variant)=>variant.mime_type === mimeType && variant.width).sort((a, b)=>(a.width ?? 0) - (b.width ?? 0)).map((variant)=>`${variant.url} ${variant.width}w`);
    return entries.length ? entries.join(", ") : undefined;
}
function ResponsiveMedia({ media, altOverride, priority = false, className = "" }) {
    const avif = srcSet(media, "image/avif");
    const webp = srcSet(media, "image/webp");
    const alt = altOverride ?? media.alt_text ?? "";
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("picture", {
        className: className,
        children: [
            avif ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("source", {
                type: "image/avif",
                srcSet: avif,
                sizes: "(max-width: 767px) 100vw, (max-width: 1199px) 50vw, 800px"
            }, void 0, false, {
                fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/responsive-media.tsx",
                lineNumber: 17,
                columnNumber: 15
            }, this) : null,
            webp ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("source", {
                type: "image/webp",
                srcSet: webp,
                sizes: "(max-width: 767px) 100vw, (max-width: 1199px) 50vw, 800px"
            }, void 0, false, {
                fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/responsive-media.tsx",
                lineNumber: 18,
                columnNumber: 15
            }, this) : null,
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("img", {
                src: media.url,
                width: media.width,
                height: media.height,
                alt: alt,
                loading: priority ? "eager" : "lazy",
                decoding: "async",
                fetchPriority: priority ? "high" : "auto"
            }, void 0, false, {
                fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/responsive-media.tsx",
                lineNumber: 19,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/responsive-media.tsx",
        lineNumber: 16,
        columnNumber: 5
    }, this);
}
}),
"[project]/apps/sites/site-12-rashi-remedies/src/site/components/semantic-components.tsx [ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ArticleAuthorBlock",
    ()=>ArticleAuthorBlock,
    "ArticleCard",
    ()=>ArticleCard,
    "ArticleCollection",
    ()=>ArticleCollection,
    "ArticleFeaturedMedia",
    ()=>ArticleFeaturedMedia,
    "ArticleHeader",
    ()=>ArticleHeader,
    "ArticleMeta",
    ()=>ArticleMeta,
    "ArticleTagList",
    ()=>ArticleTagList,
    "AuthorCard",
    ()=>AuthorCard,
    "Breadcrumbs",
    ()=>Breadcrumbs,
    "CollectionIntroduction",
    ()=>CollectionIntroduction,
    "CompactArticleItem",
    ()=>CompactArticleItem,
    "EmptyState",
    ()=>EmptyState,
    "ErrorState",
    ()=>ErrorState,
    "FeaturedArticleCard",
    ()=>FeaturedArticleCard,
    "HomeFeaturedCategoriesSection",
    ()=>HomeFeaturedCategoriesSection,
    "HomeFeaturedPostsSection",
    ()=>HomeFeaturedPostsSection,
    "HomeLeadRegion",
    ()=>HomeLeadRegion,
    "HomePrimaryArticleCollection",
    ()=>HomePrimaryArticleCollection,
    "HomeSectionContainer",
    ()=>HomeSectionContainer,
    "MissingMediaFallback",
    ()=>MissingMediaFallback,
    "PageIntro",
    ()=>PageIntro,
    "Pagination",
    ()=>Pagination,
    "PreviewStatusNotice",
    ()=>PreviewStatusNotice,
    "RecoveryActions",
    ()=>RecoveryActions,
    "RelatedPostsSection",
    ()=>RelatedPostsSection,
    "RichText",
    ()=>RichText,
    "SearchForm",
    ()=>SearchForm,
    "SearchResultsRegion",
    ()=>SearchResultsRegion,
    "SectionHeader",
    ()=>SectionHeader,
    "StaticInformationBody",
    ()=>StaticInformationBody,
    "SystemMessageView",
    ()=>SystemMessageView,
    "TaxonomyCard",
    ()=>TaxonomyCard,
    "formatDate",
    ()=>formatDate,
    "initials",
    ()=>initials
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react/jsx-dev-runtime [external] (react/jsx-dev-runtime, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$sites$2f$site$2d$12$2d$rashi$2d$remedies$2f$src$2f$site$2f$components$2f$destination$2d$link$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/sites/site-12-rashi-remedies/src/site/components/destination-link.tsx [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$sites$2f$site$2d$12$2d$rashi$2d$remedies$2f$src$2f$site$2f$components$2f$responsive$2d$media$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/sites/site-12-rashi-remedies/src/site/components/responsive-media.tsx [ssr] (ecmascript)");
;
;
;
function RichText({ value }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["Fragment"], {
        children: value.runs.map((run, index)=>{
            let node = run.text;
            if (run.marks.includes("ITALIC")) node = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("em", {
                children: node
            }, void 0, false, {
                fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/semantic-components.tsx",
                lineNumber: 10,
                columnNumber: 46
            }, this);
            if (run.marks.includes("BOLD")) node = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("strong", {
                children: node
            }, void 0, false, {
                fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/semantic-components.tsx",
                lineNumber: 11,
                columnNumber: 44
            }, this);
            if (run.link) node = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$sites$2f$site$2d$12$2d$rashi$2d$remedies$2f$src$2f$site$2f$components$2f$destination$2d$link$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["DestinationLink"], {
                destination: run.link,
                children: node
            }, void 0, false, {
                fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/semantic-components.tsx",
                lineNumber: 12,
                columnNumber: 26
            }, this);
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                children: node
            }, `${index}-${run.text.slice(0, 12)}`, false, {
                fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/semantic-components.tsx",
                lineNumber: 13,
                columnNumber: 12
            }, this);
        })
    }, void 0, false, {
        fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/semantic-components.tsx",
        lineNumber: 8,
        columnNumber: 10
    }, this);
}
function Breadcrumbs({ trail }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("nav", {
        className: "breadcrumbs container",
        "aria-label": "Breadcrumb",
        "data-component-id": "CMP12-BREADCRUMBS",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("ol", {
            children: trail.items.map((item)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("li", {
                    "aria-current": item.is_current ? "page" : undefined,
                    children: item.destination && !item.is_current ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$sites$2f$site$2d$12$2d$rashi$2d$remedies$2f$src$2f$site$2f$components$2f$destination$2d$link$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["DestinationLink"], {
                        destination: item.destination,
                        children: item.label
                    }, void 0, false, {
                        fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/semantic-components.tsx",
                        lineNumber: 18,
                        columnNumber: 279
                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                        children: item.label
                    }, void 0, false, {
                        fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/semantic-components.tsx",
                        lineNumber: 18,
                        columnNumber: 360
                    }, this)
                }, `${item.label}-${item.is_current}`, false, {
                    fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/semantic-components.tsx",
                    lineNumber: 18,
                    columnNumber: 142
                }, this))
        }, void 0, false, {
            fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/semantic-components.tsx",
            lineNumber: 18,
            columnNumber: 111
        }, this)
    }, void 0, false, {
        fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/semantic-components.tsx",
        lineNumber: 18,
        columnNumber: 10
    }, this);
}
function PageIntro({ h1, introText }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("header", {
        className: "page-intro",
        "data-component-id": "CMP12-PAGE-INTRO",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("h1", {
                children: h1
            }, void 0, false, {
                fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/semantic-components.tsx",
                lineNumber: 22,
                columnNumber: 78
            }, this),
            introText ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                children: introText
            }, void 0, false, {
                fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/semantic-components.tsx",
                lineNumber: 22,
                columnNumber: 104
            }, this) : null
        ]
    }, void 0, true, {
        fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/semantic-components.tsx",
        lineNumber: 22,
        columnNumber: 10
    }, this);
}
function SectionHeader({ label }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("header", {
        className: "section-header",
        "data-component-id": "CMP12-SECTION-HEADER",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                className: "section-kicker",
                "aria-hidden": "true"
            }, void 0, false, {
                fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/semantic-components.tsx",
                lineNumber: 26,
                columnNumber: 86
            }, this),
            " ",
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("h2", {
                children: label
            }, void 0, false, {
                fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/semantic-components.tsx",
                lineNumber: 26,
                columnNumber: 141
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/semantic-components.tsx",
        lineNumber: 26,
        columnNumber: 10
    }, this);
}
function ArticleCard({ article }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("article", {
        className: "article-card",
        "data-component-id": "CMP12-ARTICLE-CARD",
        children: [
            article.featured_media ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$sites$2f$site$2d$12$2d$rashi$2d$remedies$2f$src$2f$site$2f$components$2f$responsive$2d$media$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["ResponsiveMedia"], {
                media: article.featured_media
            }, void 0, false, {
                fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/semantic-components.tsx",
                lineNumber: 30,
                columnNumber: 109
            }, this) : null,
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                className: "card-body",
                children: [
                    article.taxonomy_label ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                        className: "eyebrow",
                        children: article.taxonomy_label
                    }, void 0, false, {
                        fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/semantic-components.tsx",
                        lineNumber: 30,
                        columnNumber: 220
                    }, this) : null,
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("h3", {
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$sites$2f$site$2d$12$2d$rashi$2d$remedies$2f$src$2f$site$2f$components$2f$destination$2d$link$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["DestinationLink"], {
                            destination: article.destination,
                            children: article.title
                        }, void 0, false, {
                            fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/semantic-components.tsx",
                            lineNumber: 30,
                            columnNumber: 283
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/semantic-components.tsx",
                        lineNumber: 30,
                        columnNumber: 279
                    }, this),
                    article.excerpt ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                        children: article.excerpt
                    }, void 0, false, {
                        fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/semantic-components.tsx",
                        lineNumber: 30,
                        columnNumber: 391
                    }, this) : null,
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                        className: "meta",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("time", {
                            dateTime: article.published_at,
                            children: formatDate(article.published_at)
                        }, void 0, false, {
                            fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/semantic-components.tsx",
                            lineNumber: 30,
                            columnNumber: 443
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/semantic-components.tsx",
                        lineNumber: 30,
                        columnNumber: 423
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/semantic-components.tsx",
                lineNumber: 30,
                columnNumber: 167
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/semantic-components.tsx",
        lineNumber: 30,
        columnNumber: 10
    }, this);
}
function FeaturedArticleCard({ article }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("article", {
        className: "featured-article",
        "data-component-id": "CMP12-FEATURED-ARTICLE-CARD",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                className: "featured-copy",
                children: [
                    article.taxonomy_label ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                        className: "eyebrow",
                        children: article.taxonomy_label
                    }, void 0, false, {
                        fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/semantic-components.tsx",
                        lineNumber: 34,
                        columnNumber: 153
                    }, this) : null,
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("h2", {
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$sites$2f$site$2d$12$2d$rashi$2d$remedies$2f$src$2f$site$2f$components$2f$destination$2d$link$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["DestinationLink"], {
                            destination: article.destination,
                            children: article.title
                        }, void 0, false, {
                            fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/semantic-components.tsx",
                            lineNumber: 34,
                            columnNumber: 216
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/semantic-components.tsx",
                        lineNumber: 34,
                        columnNumber: 212
                    }, this),
                    article.excerpt ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                        children: article.excerpt
                    }, void 0, false, {
                        fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/semantic-components.tsx",
                        lineNumber: 34,
                        columnNumber: 324
                    }, this) : null,
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                        className: "meta",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("time", {
                                dateTime: article.published_at,
                                children: formatDate(article.published_at)
                            }, void 0, false, {
                                fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/semantic-components.tsx",
                                lineNumber: 34,
                                columnNumber: 376
                            }, this),
                            article.author ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["Fragment"], {
                                children: [
                                    " ",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                        "aria-hidden": "true",
                                        children: "/"
                                    }, void 0, false, {
                                        fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/semantic-components.tsx",
                                        lineNumber: 34,
                                        columnNumber: 476
                                    }, this),
                                    " ",
                                    article.author.display_name
                                ]
                            }, void 0, true, {
                                fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/semantic-components.tsx",
                                lineNumber: 34,
                                columnNumber: 473
                            }, this) : null
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/semantic-components.tsx",
                        lineNumber: 34,
                        columnNumber: 356
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/semantic-components.tsx",
                lineNumber: 34,
                columnNumber: 96
            }, this),
            article.featured_media ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$sites$2f$site$2d$12$2d$rashi$2d$remedies$2f$src$2f$site$2f$components$2f$responsive$2d$media$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["ResponsiveMedia"], {
                media: article.featured_media,
                priority: true,
                className: "featured-media"
            }, void 0, false, {
                fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/semantic-components.tsx",
                lineNumber: 34,
                columnNumber: 586
            }, this) : null
        ]
    }, void 0, true, {
        fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/semantic-components.tsx",
        lineNumber: 34,
        columnNumber: 10
    }, this);
}
function CompactArticleItem({ article }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("article", {
        className: "compact-article",
        "data-component-id": "CMP12-COMPACT-ARTICLE-ITEM",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                        className: "eyebrow",
                        children: article.taxonomy_label ?? "Article"
                    }, void 0, false, {
                        fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/semantic-components.tsx",
                        lineNumber: 38,
                        columnNumber: 99
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("h3", {
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$sites$2f$site$2d$12$2d$rashi$2d$remedies$2f$src$2f$site$2f$components$2f$destination$2d$link$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["DestinationLink"], {
                            destination: article.destination,
                            children: article.title
                        }, void 0, false, {
                            fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/semantic-components.tsx",
                            lineNumber: 38,
                            columnNumber: 167
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/semantic-components.tsx",
                        lineNumber: 38,
                        columnNumber: 163
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/semantic-components.tsx",
                lineNumber: 38,
                columnNumber: 94
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("time", {
                dateTime: article.published_at,
                children: formatDate(article.published_at)
            }, void 0, false, {
                fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/semantic-components.tsx",
                lineNumber: 38,
                columnNumber: 262
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/semantic-components.tsx",
        lineNumber: 38,
        columnNumber: 10
    }, this);
}
function TaxonomyCard({ item }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("article", {
        className: "taxonomy-card",
        "data-component-id": "CMP12-TAXONOMY-CARD",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                className: "eyebrow",
                children: item.kind === "CATEGORY" ? "Category" : "Topic"
            }, void 0, false, {
                fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/semantic-components.tsx",
                lineNumber: 42,
                columnNumber: 85
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("h3", {
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$sites$2f$site$2d$12$2d$rashi$2d$remedies$2f$src$2f$site$2f$components$2f$destination$2d$link$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["DestinationLink"], {
                    destination: item.destination,
                    children: item.name
                }, void 0, false, {
                    fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/semantic-components.tsx",
                    lineNumber: 42,
                    columnNumber: 165
                }, this)
            }, void 0, false, {
                fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/semantic-components.tsx",
                lineNumber: 42,
                columnNumber: 161
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/semantic-components.tsx",
        lineNumber: 42,
        columnNumber: 10
    }, this);
}
function AuthorCard({ author }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("article", {
        className: "author-card",
        "data-component-id": "CMP12-AUTHOR-CARD",
        children: [
            author.avatar_media ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$sites$2f$site$2d$12$2d$rashi$2d$remedies$2f$src$2f$site$2f$components$2f$responsive$2d$media$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["ResponsiveMedia"], {
                media: author.avatar_media
            }, void 0, false, {
                fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/semantic-components.tsx",
                lineNumber: 46,
                columnNumber: 104
            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                className: "avatar-fallback",
                "aria-hidden": "true",
                children: initials(author.display_name)
            }, void 0, false, {
                fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/semantic-components.tsx",
                lineNumber: 46,
                columnNumber: 154
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("h3", {
                        children: author.destination ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$sites$2f$site$2d$12$2d$rashi$2d$remedies$2f$src$2f$site$2f$components$2f$destination$2d$link$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["DestinationLink"], {
                            destination: author.destination,
                            children: author.display_name
                        }, void 0, false, {
                            fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/semantic-components.tsx",
                            lineNumber: 46,
                            columnNumber: 277
                        }, this) : author.display_name
                    }, void 0, false, {
                        fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/semantic-components.tsx",
                        lineNumber: 46,
                        columnNumber: 251
                    }, this),
                    author.short_bio ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                        children: author.short_bio
                    }, void 0, false, {
                        fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/semantic-components.tsx",
                        lineNumber: 46,
                        columnNumber: 414
                    }, this) : null
                ]
            }, void 0, true, {
                fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/semantic-components.tsx",
                lineNumber: 46,
                columnNumber: 246
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/semantic-components.tsx",
        lineNumber: 46,
        columnNumber: 10
    }, this);
}
function ArticleCollection({ articles, label = "Articles" }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("section", {
        "aria-label": label,
        className: "article-grid",
        "data-component-id": "CMP12-ARTICLE-COLLECTION",
        children: articles.map((article)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(ArticleCard, {
                article: article
            }, article.article_id, false, {
                fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/semantic-components.tsx",
                lineNumber: 50,
                columnNumber: 135
            }, this))
    }, void 0, false, {
        fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/semantic-components.tsx",
        lineNumber: 50,
        columnNumber: 10
    }, this);
}
function Pagination({ pagination }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("nav", {
        className: "pagination",
        "aria-label": "Pagination",
        "data-component-id": "CMP12-PAGINATION",
        children: [
            pagination.previous ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$sites$2f$site$2d$12$2d$rashi$2d$remedies$2f$src$2f$site$2f$components$2f$destination$2d$link$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["DestinationLink"], {
                destination: pagination.previous,
                className: "page-step",
                children: "Previous"
            }, void 0, false, {
                fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/semantic-components.tsx",
                lineNumber: 54,
                columnNumber: 122
            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {}, void 0, false, {
                fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/semantic-components.tsx",
                lineNumber: 54,
                columnNumber: 224
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("ol", {
                children: pagination.links.map((link)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("li", {
                        children: link.is_current ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                            "aria-current": "page",
                            children: link.page_number
                        }, void 0, false, {
                            fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/semantic-components.tsx",
                            lineNumber: 55,
                            columnNumber: 87
                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$sites$2f$site$2d$12$2d$rashi$2d$remedies$2f$src$2f$site$2f$components$2f$destination$2d$link$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["DestinationLink"], {
                            destination: link.destination,
                            children: link.page_number
                        }, void 0, false, {
                            fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/semantic-components.tsx",
                            lineNumber: 55,
                            columnNumber: 141
                        }, this)
                    }, link.page_number, false, {
                        fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/semantic-components.tsx",
                        lineNumber: 55,
                        columnNumber: 41
                    }, this))
            }, void 0, false, {
                fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/semantic-components.tsx",
                lineNumber: 55,
                columnNumber: 5
            }, this),
            pagination.next ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$sites$2f$site$2d$12$2d$rashi$2d$remedies$2f$src$2f$site$2f$components$2f$destination$2d$link$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["DestinationLink"], {
                destination: pagination.next,
                className: "page-step",
                children: "Next"
            }, void 0, false, {
                fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/semantic-components.tsx",
                lineNumber: 56,
                columnNumber: 24
            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {}, void 0, false, {
                fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/semantic-components.tsx",
                lineNumber: 56,
                columnNumber: 118
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/semantic-components.tsx",
        lineNumber: 54,
        columnNumber: 10
    }, this);
}
function EmptyState({ title, body }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("section", {
        className: "state-card",
        role: "status",
        "data-component-id": "CMP12-EMPTY-STATE",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("h2", {
                children: title
            }, void 0, false, {
                fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/semantic-components.tsx",
                lineNumber: 59,
                columnNumber: 171
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                children: body
            }, void 0, false, {
                fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/semantic-components.tsx",
                lineNumber: 59,
                columnNumber: 187
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/semantic-components.tsx",
        lineNumber: 59,
        columnNumber: 87
    }, this);
}
function ErrorState({ title, body }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("section", {
        className: "state-card state-error",
        role: "alert",
        "data-component-id": "CMP12-ERROR-STATE",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("h1", {
                children: title
            }, void 0, false, {
                fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/semantic-components.tsx",
                lineNumber: 60,
                columnNumber: 182
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                children: body
            }, void 0, false, {
                fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/semantic-components.tsx",
                lineNumber: 60,
                columnNumber: 198
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/semantic-components.tsx",
        lineNumber: 60,
        columnNumber: 87
    }, this);
}
function MissingMediaFallback({ label = "Media unavailable" }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
        className: "missing-media",
        role: "img",
        "aria-label": label,
        "data-component-id": "CMP12-MISSING-MEDIA",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                "aria-hidden": "true"
            }, void 0, false, {
                fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/semantic-components.tsx",
                lineNumber: 61,
                columnNumber: 213
            }, this),
            " ",
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                children: label
            }, void 0, false, {
                fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/semantic-components.tsx",
                lineNumber: 61,
                columnNumber: 241
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/semantic-components.tsx",
        lineNumber: 61,
        columnNumber: 112
    }, this);
}
function HomeLeadRegion({ article }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("section", {
        className: "home-lead",
        "data-component-id": "CMP12-HOME-LEAD",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(FeaturedArticleCard, {
            article: article
        }, void 0, false, {
            fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/semantic-components.tsx",
            lineNumber: 63,
            columnNumber: 150
        }, this)
    }, void 0, false, {
        fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/semantic-components.tsx",
        lineNumber: 63,
        columnNumber: 83
    }, this);
}
function HomeSectionContainer({ label, children }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("section", {
        className: "home-section",
        "data-component-id": "CMP12-HOME-SECTION",
        children: [
            label ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(SectionHeader, {
                label: label
            }, void 0, false, {
                fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/semantic-components.tsx",
                lineNumber: 64,
                columnNumber: 203
            }, this) : null,
            children
        ]
    }, void 0, true, {
        fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/semantic-components.tsx",
        lineNumber: 64,
        columnNumber: 121
    }, this);
}
function HomeFeaturedPostsSection({ articles }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
        className: "article-grid",
        "data-component-id": "CMP12-HOME-FEATURED-POSTS",
        children: articles.map((article)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(ArticleCard, {
                article: article
            }, article.article_id, false, {
                fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/semantic-components.tsx",
                lineNumber: 65,
                columnNumber: 200
            }, this))
    }, void 0, false, {
        fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/semantic-components.tsx",
        lineNumber: 65,
        columnNumber: 97
    }, this);
}
function HomeFeaturedCategoriesSection({ categories }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
        className: "taxonomy-grid",
        "data-component-id": "CMP12-HOME-FEATURED-CATEGORIES",
        children: categories.map((item)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(TaxonomyCard, {
                item: item
            }, `${item.kind}-${item.name}-${item.destination.url}`, false, {
                fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/semantic-components.tsx",
                lineNumber: 66,
                columnNumber: 240
            }, this))
    }, void 0, false, {
        fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/semantic-components.tsx",
        lineNumber: 66,
        columnNumber: 132
    }, this);
}
function HomePrimaryArticleCollection({ articles }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
        "data-component-id": "CMP12-HOME-LATEST",
        children: articles.length ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(ArticleCollection, {
            articles: articles,
            label: "Latest articles"
        }, void 0, false, {
            fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/semantic-components.tsx",
            lineNumber: 67,
            columnNumber: 163
        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(EmptyState, {
            title: "No articles yet",
            body: "There are no publicly eligible articles to show right now."
        }, void 0, false, {
            fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/semantic-components.tsx",
            lineNumber: 67,
            columnNumber: 231
        }, this)
    }, void 0, false, {
        fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/semantic-components.tsx",
        lineNumber: 67,
        columnNumber: 101
    }, this);
}
function ArticleHeader({ article }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("header", {
        className: "article-header",
        "data-component-id": "CMP12-ARTICLE-HEADER",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("h1", {
                children: article.title
            }, void 0, false, {
                fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/semantic-components.tsx",
                lineNumber: 69,
                columnNumber: 224
            }, this),
            article.excerpt ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                className: "article-deck",
                children: article.excerpt
            }, void 0, false, {
                fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/semantic-components.tsx",
                lineNumber: 69,
                columnNumber: 267
            }, this) : null
        ]
    }, void 0, true, {
        fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/semantic-components.tsx",
        lineNumber: 69,
        columnNumber: 148
    }, this);
}
function ArticleMeta({ article }) {
    const published = article.published_at;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
        className: "article-meta",
        "data-component-id": "CMP12-ARTICLE-META",
        children: [
            article.author ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                children: [
                    "By ",
                    article.author.display_name
                ]
            }, void 0, true, {
                fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/semantic-components.tsx",
                lineNumber: 70,
                columnNumber: 273
            }, this) : null,
            published ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("time", {
                dateTime: published,
                children: formatDate(published)
            }, void 0, false, {
                fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/semantic-components.tsx",
                lineNumber: 70,
                columnNumber: 339
            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                children: "Unpublished preview"
            }, void 0, false, {
                fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/semantic-components.tsx",
                lineNumber: 70,
                columnNumber: 399
            }, this),
            article.updated_at ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                children: [
                    "Updated ",
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("time", {
                        dateTime: article.updated_at,
                        children: formatDate(article.updated_at)
                    }, void 0, false, {
                        fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/semantic-components.tsx",
                        lineNumber: 70,
                        columnNumber: 468
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/semantic-components.tsx",
                lineNumber: 70,
                columnNumber: 454
            }, this) : null
        ]
    }, void 0, true, {
        fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/semantic-components.tsx",
        lineNumber: 70,
        columnNumber: 186
    }, this);
}
function ArticleFeaturedMedia({ article }) {
    return article.featured_media ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("figure", {
        className: "article-featured-media",
        "data-component-id": "CMP12-ARTICLE-FEATURED-MEDIA",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$sites$2f$site$2d$12$2d$rashi$2d$remedies$2f$src$2f$site$2f$components$2f$responsive$2d$media$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["ResponsiveMedia"], {
                media: article.featured_media,
                priority: true
            }, void 0, false, {
                fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/semantic-components.tsx",
                lineNumber: 71,
                columnNumber: 272
            }, this),
            article.featured_media.caption ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("figcaption", {
                children: article.featured_media.caption
            }, void 0, false, {
                fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/semantic-components.tsx",
                lineNumber: 71,
                columnNumber: 365
            }, this) : null
        ]
    }, void 0, true, {
        fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/semantic-components.tsx",
        lineNumber: 71,
        columnNumber: 180
    }, this) : null;
}
function ArticleAuthorBlock({ author }) {
    return author ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("aside", {
        className: "article-author",
        "data-component-id": "CMP12-ARTICLE-AUTHOR",
        "aria-label": "Author",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(AuthorCard, {
            author: author
        }, void 0, false, {
            fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/semantic-components.tsx",
            lineNumber: 72,
            columnNumber: 226
        }, this)
    }, void 0, false, {
        fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/semantic-components.tsx",
        lineNumber: 72,
        columnNumber: 131
    }, this) : null;
}
function ArticleTagList({ tags }) {
    return tags.length ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("nav", {
        className: "tag-list",
        "aria-label": "Article topics",
        "data-component-id": "CMP12-ARTICLE-TAGS",
        children: tags.map((tag)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$sites$2f$site$2d$12$2d$rashi$2d$remedies$2f$src$2f$site$2f$components$2f$destination$2d$link$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["DestinationLink"], {
                destination: tag.destination,
                children: tag.name
            }, `${tag.name}-${tag.destination.url}`, false, {
                fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/semantic-components.tsx",
                lineNumber: 73,
                columnNumber: 231
            }, this))
    }, void 0, false, {
        fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/semantic-components.tsx",
        lineNumber: 73,
        columnNumber: 119
    }, this) : null;
}
function RelatedPostsSection({ articles }) {
    return articles.length ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("section", {
        className: "related-posts",
        "data-component-id": "CMP12-RELATED-POSTS",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(SectionHeader, {
                label: "Related reading"
            }, void 0, false, {
                fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/semantic-components.tsx",
                lineNumber: 74,
                columnNumber: 185
            }, this),
            articles.map((article)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(CompactArticleItem, {
                    article: article
                }, article.article_id, false, {
                    fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/semantic-components.tsx",
                    lineNumber: 74,
                    columnNumber: 253
                }, this))
        ]
    }, void 0, true, {
        fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/semantic-components.tsx",
        lineNumber: 74,
        columnNumber: 110
    }, this) : null;
}
function CollectionIntroduction({ title, description, marker }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("header", {
        className: "collection-intro",
        "data-component-id": "CMP12-COLLECTION-INTRO",
        children: [
            marker ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                className: "eyebrow",
                children: marker
            }, void 0, false, {
                fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/semantic-components.tsx",
                lineNumber: 76,
                columnNumber: 253
            }, this) : null,
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("h1", {
                children: title
            }, void 0, false, {
                fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/semantic-components.tsx",
                lineNumber: 76,
                columnNumber: 296
            }, this),
            description ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                children: description
            }, void 0, false, {
                fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/semantic-components.tsx",
                lineNumber: 76,
                columnNumber: 327
            }, this) : null
        ]
    }, void 0, true, {
        fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/semantic-components.tsx",
        lineNumber: 76,
        columnNumber: 163
    }, this);
}
function SearchForm({ query }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("form", {
        className: "search-form",
        method: "get",
        action: "/search",
        role: "search",
        "data-component-id": "CMP12-SEARCH-FORM",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("label", {
                htmlFor: "site-search-query",
                children: "Search this site"
            }, void 0, false, {
                fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/semantic-components.tsx",
                lineNumber: 77,
                columnNumber: 179
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                className: "search-row",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("input", {
                        id: "site-search-query",
                        name: "q",
                        type: "search",
                        defaultValue: query,
                        placeholder: "Search published articles",
                        autoComplete: "off"
                    }, void 0, false, {
                        fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/semantic-components.tsx",
                        lineNumber: 77,
                        columnNumber: 266
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                        type: "submit",
                        children: "Search"
                    }, void 0, false, {
                        fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/semantic-components.tsx",
                        lineNumber: 77,
                        columnNumber: 401
                    }, this),
                    query ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("a", {
                        href: "/search",
                        className: "button-secondary",
                        children: "Clear"
                    }, void 0, false, {
                        fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/semantic-components.tsx",
                        lineNumber: 77,
                        columnNumber: 447
                    }, this) : null
                ]
            }, void 0, true, {
                fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/semantic-components.tsx",
                lineNumber: 77,
                columnNumber: 238
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/semantic-components.tsx",
        lineNumber: 77,
        columnNumber: 67
    }, this);
}
function SearchResultsRegion({ articles, state, summary }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("section", {
        className: "search-results",
        "aria-live": "polite",
        "data-component-id": "CMP12-SEARCH-RESULTS",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                className: "result-summary",
                children: summary
            }, void 0, false, {
                fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/semantic-components.tsx",
                lineNumber: 78,
                columnNumber: 262
            }, this),
            state === "NO_QUERY" ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(EmptyState, {
                title: "Start a search",
                body: "Enter a query to search publicly eligible articles on this site."
            }, void 0, false, {
                fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/semantic-components.tsx",
                lineNumber: 78,
                columnNumber: 329
            }, this) : state === "EMPTY" ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(EmptyState, {
                title: "No results",
                body: "No matching public articles were found. Try a different query."
            }, void 0, false, {
                fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/semantic-components.tsx",
                lineNumber: 78,
                columnNumber: 461
            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(ArticleCollection, {
                articles: articles,
                label: "Search results"
            }, void 0, false, {
                fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/semantic-components.tsx",
                lineNumber: 78,
                columnNumber: 567
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/semantic-components.tsx",
        lineNumber: 78,
        columnNumber: 166
    }, this);
}
function StaticInformationBody({ content, contactInfo }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
        className: "static-body",
        "data-component-id": "CMP12-STATIC-BODY",
        children: [
            content.intro_text ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                className: "static-intro",
                children: content.intro_text
            }, void 0, false, {
                fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/semantic-components.tsx",
                lineNumber: 80,
                columnNumber: 280
            }, this) : null,
            content.sections.map((section, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("section", {
                    children: [
                        section.heading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("h2", {
                            children: section.heading
                        }, void 0, false, {
                            fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/semantic-components.tsx",
                            lineNumber: 80,
                            columnNumber: 459
                        }, this) : null,
                        section.paragraphs.map((paragraph, pIndex)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(RichText, {
                                    value: paragraph
                                }, void 0, false, {
                                    fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/semantic-components.tsx",
                                    lineNumber: 80,
                                    columnNumber: 556
                                }, this)
                            }, pIndex, false, {
                                fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/semantic-components.tsx",
                                lineNumber: 80,
                                columnNumber: 540
                            }, this)),
                        section.list_items.length ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("ul", {
                            children: section.list_items.map((item, itemIndex)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("li", {
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(RichText, {
                                        value: item
                                    }, void 0, false, {
                                        fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/semantic-components.tsx",
                                        lineNumber: 80,
                                        columnNumber: 690
                                    }, this)
                                }, itemIndex, false, {
                                    fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/semantic-components.tsx",
                                    lineNumber: 80,
                                    columnNumber: 670
                                }, this))
                        }, void 0, false, {
                            fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/semantic-components.tsx",
                            lineNumber: 80,
                            columnNumber: 621
                        }, this) : null
                    ]
                }, `${section.heading ?? "section"}-${index}`, true, {
                    fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/semantic-components.tsx",
                    lineNumber: 80,
                    columnNumber: 382
                }, this)),
            contactInfo ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("address", {
                className: "contact-info",
                children: contactInfo.items.map((item)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("strong", {
                                children: item.label
                            }, void 0, false, {
                                fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/semantic-components.tsx",
                                lineNumber: 80,
                                columnNumber: 869
                            }, this),
                            item.destination ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$sites$2f$site$2d$12$2d$rashi$2d$remedies$2f$src$2f$site$2f$components$2f$destination$2d$link$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["DestinationLink"], {
                                destination: item.destination,
                                children: item.display_value
                            }, void 0, false, {
                                fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/semantic-components.tsx",
                                lineNumber: 80,
                                columnNumber: 918
                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                children: item.display_value
                            }, void 0, false, {
                                fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/semantic-components.tsx",
                                lineNumber: 80,
                                columnNumber: 1007
                            }, this)
                        ]
                    }, `${item.kind}-${item.label}`, true, {
                        fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/semantic-components.tsx",
                        lineNumber: 80,
                        columnNumber: 829
                    }, this))
            }, void 0, false, {
                fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/semantic-components.tsx",
                lineNumber: 80,
                columnNumber: 762
            }, this) : null
        ]
    }, void 0, true, {
        fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/semantic-components.tsx",
        lineNumber: 80,
        columnNumber: 191
    }, this);
}
function PreviewStatusNotice({ preview }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("aside", {
        className: "preview-status",
        role: "status",
        "data-component-id": "CMP12-PREVIEW-STATUS",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("strong", {
                children: "Private preview"
            }, void 0, false, {
                fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/semantic-components.tsx",
                lineNumber: 81,
                columnNumber: 199
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                children: preview.notice_text
            }, void 0, false, {
                fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/semantic-components.tsx",
                lineNumber: 81,
                columnNumber: 231
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("small", {
                children: [
                    preview.lifecycle_status,
                    " / ",
                    preview.source_kind
                ]
            }, void 0, true, {
                fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/semantic-components.tsx",
                lineNumber: 81,
                columnNumber: 265
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/semantic-components.tsx",
        lineNumber: 81,
        columnNumber: 110
    }, this);
}
function SystemMessageView({ code, title, body }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("section", {
        className: "system-message",
        "data-component-id": "CMP12-SYSTEM-MESSAGE",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                className: "system-code",
                children: code
            }, void 0, false, {
                fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/semantic-components.tsx",
                lineNumber: 82,
                columnNumber: 194
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("h1", {
                children: title
            }, void 0, false, {
                fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/semantic-components.tsx",
                lineNumber: 82,
                columnNumber: 231
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                children: body
            }, void 0, false, {
                fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/semantic-components.tsx",
                lineNumber: 82,
                columnNumber: 247
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/semantic-components.tsx",
        lineNumber: 82,
        columnNumber: 117
    }, this);
}
function RecoveryActions({ home, search }) {
    return home || search ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("nav", {
        className: "recovery-actions",
        "aria-label": "Recovery actions",
        "data-component-id": "CMP12-RECOVERY-ACTIONS",
        children: [
            home ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$sites$2f$site$2d$12$2d$rashi$2d$remedies$2f$src$2f$site$2f$components$2f$destination$2d$link$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["DestinationLink"], {
                destination: home,
                className: "button-primary",
                children: "Go to home"
            }, void 0, false, {
                fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/semantic-components.tsx",
                lineNumber: 83,
                columnNumber: 274
            }, this) : null,
            search ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$sites$2f$site$2d$12$2d$rashi$2d$remedies$2f$src$2f$site$2f$components$2f$destination$2d$link$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["DestinationLink"], {
                destination: search,
                className: "button-secondary",
                children: "Search this site"
            }, void 0, false, {
                fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/semantic-components.tsx",
                lineNumber: 83,
                columnNumber: 383
            }, this) : null
        ]
    }, void 0, true, {
        fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/semantic-components.tsx",
        lineNumber: 83,
        columnNumber: 159
    }, this) : null;
}
function formatDate(value) {
    const date = new Date(value);
    if (Number.isNaN(date.valueOf())) return value;
    return new Intl.DateTimeFormat("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    }).format(date);
}
function initials(value) {
    return value.split(/\s+/).filter(Boolean).slice(0, 2).map((part)=>part[0]?.toUpperCase() ?? "").join("") || "A";
}
}),
"[project]/apps/sites/site-12-rashi-remedies/src/site/components/seo-head.tsx [ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "SeoHead",
    ()=>SeoHead
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react/jsx-dev-runtime [external] (react/jsx-dev-runtime, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$3$2e$5_$40$types$2b$node$40$24$2e$13$2e$4_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$head$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.3.5_@types+node@24.13.4_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/head.js [ssr] (ecmascript)");
;
;
function jsonLd(value) {
    return JSON.stringify(value).replace(/</g, "\\u003c");
}
function SeoHead({ seo, pagination }) {
    const robots = `${seo.robots.index ? "index" : "noindex"},${seo.robots.follow ? "follow" : "nofollow"}`;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$3$2e$5_$40$types$2b$node$40$24$2e$13$2e$4_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$head$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["default"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("title", {
                children: seo.title
            }, void 0, false, {
                fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/seo-head.tsx",
                lineNumber: 12,
                columnNumber: 7
            }, this),
            seo.meta_description ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("meta", {
                name: "description",
                content: seo.meta_description
            }, void 0, false, {
                fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/seo-head.tsx",
                lineNumber: 13,
                columnNumber: 31
            }, this) : null,
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("meta", {
                name: "robots",
                content: robots
            }, void 0, false, {
                fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/seo-head.tsx",
                lineNumber: 14,
                columnNumber: 7
            }, this),
            seo.canonical_url ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("link", {
                rel: "canonical",
                href: seo.canonical_url
            }, void 0, false, {
                fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/seo-head.tsx",
                lineNumber: 15,
                columnNumber: 28
            }, this) : null,
            pagination?.previous ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("link", {
                rel: "prev",
                href: pagination.previous.url
            }, void 0, false, {
                fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/seo-head.tsx",
                lineNumber: 16,
                columnNumber: 31
            }, this) : null,
            pagination?.next ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("link", {
                rel: "next",
                href: pagination.next.url
            }, void 0, false, {
                fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/seo-head.tsx",
                lineNumber: 17,
                columnNumber: 27
            }, this) : null,
            seo.open_graph ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("meta", {
                property: "og:title",
                content: seo.open_graph.title
            }, void 0, false, {
                fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/seo-head.tsx",
                lineNumber: 18,
                columnNumber: 25
            }, this) : null,
            seo.open_graph?.description ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("meta", {
                property: "og:description",
                content: seo.open_graph.description
            }, void 0, false, {
                fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/seo-head.tsx",
                lineNumber: 19,
                columnNumber: 38
            }, this) : null,
            seo.open_graph?.url ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("meta", {
                property: "og:url",
                content: seo.open_graph.url
            }, void 0, false, {
                fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/seo-head.tsx",
                lineNumber: 20,
                columnNumber: 30
            }, this) : null,
            seo.open_graph ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("meta", {
                property: "og:type",
                content: seo.open_graph.type.toLowerCase()
            }, void 0, false, {
                fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/seo-head.tsx",
                lineNumber: 21,
                columnNumber: 25
            }, this) : null,
            seo.open_graph?.image ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("meta", {
                property: "og:image",
                content: seo.open_graph.image.url
            }, void 0, false, {
                fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/seo-head.tsx",
                lineNumber: 22,
                columnNumber: 32
            }, this) : null,
            seo.structured_data.map((item, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("script", {
                    type: "application/ld+json",
                    dangerouslySetInnerHTML: {
                        __html: jsonLd(item)
                    }
                }, `structured-data-${index}`, false, {
                    fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/seo-head.tsx",
                    lineNumber: 24,
                    columnNumber: 9
                }, this))
        ]
    }, void 0, true, {
        fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/components/seo-head.tsx",
        lineNumber: 11,
        columnNumber: 5
    }, this);
}
}),
"[project]/apps/sites/site-12-rashi-remedies/src/site/lib/destination.ts [ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "destinationPath",
    ()=>destinationPath,
    "isCurrentDestination",
    ()=>isCurrentDestination
]);
function destinationPath(destination) {
    try {
        const url = new URL(destination.url);
        return `${url.pathname}${url.search}`;
    } catch  {
        return destination.url;
    }
}
function isCurrentDestination(destination, requestPath) {
    const path = destinationPath(destination).split("?")[0] || "/";
    const current = requestPath.split("?")[0] || "/";
    return path === current;
}
}),
"[project]/apps/sites/site-12-rashi-remedies/src/site/lib/ssr.ts [ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createPreviewGetServerSideProps",
    ()=>createPreviewGetServerSideProps,
    "createPublicGetServerSideProps",
    ()=>createPublicGetServerSideProps
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ts$2f$api$2d$client$2d$public$2f$src$2f$index$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/ts/api-client-public/src/index.ts [ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ts$2f$api$2d$client$2d$public$2f$src$2f$generated$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/ts/api-client-public/src/generated.ts [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$sites$2f$site$2d$12$2d$rashi$2d$remedies$2f$src$2f$site$2f$tests$2f$fixtures$2f$fixture$2d$resolver$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/sites/site-12-rashi-remedies/src/site/tests/fixtures/fixture-resolver.ts [ssr] (ecmascript)");
;
;
const EXPECTED_SITE_KEY = "SITE-12";
const EXPECTED_DOMAIN = "RashiRemedies.com";
function first(value) {
    return Array.isArray(value) ? value[0] : value;
}
function positiveInt(value, fallback) {
    const parsed = Number.parseInt(first(value) ?? "", 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}
function requestPath(ctx) {
    try {
        return new URL(ctx.resolvedUrl, "https://frontend.invalid").pathname;
    } catch  {
        return "/";
    }
}
function hostOf(ctx) {
    return ("TURBOPACK compile-time value", "development") !== "production" && process.env.BP_PUBLIC_HOST_OVERRIDE ? process.env.BP_PUBLIC_HOST_OVERRIDE : String(ctx.req.headers.host ?? "");
}
function forwardedProto(ctx) {
    const value = first(ctx.req.headers["x-forwarded-proto"]);
    return value === "http" ? "http" : "https";
}
function apiOrigin(ctx) {
    return process.env.BP_API_INTERNAL_ORIGIN || `${forwardedProto(ctx)}://${hostOf(ctx)}`;
}
function copyHeader(ctx, headers, name) {
    const value = headers.get(name);
    if (value) ctx.res.setHeader(name, value);
}
function fixtureModeEnabled() {
    return ("TURBOPACK compile-time value", "development") === "test" && process.env.BP_PUBLIC_FIXTURE_MODE === "1";
}
function hasSite(data) {
    return "site" in data && Boolean(data.site);
}
function siteMatches(data) {
    if (!hasSite(data)) return true;
    return data.site.site_key === EXPECTED_SITE_KEY && data.site.canonical_domain.toLowerCase() === EXPECTED_DOMAIN.toLowerCase();
}
function failClosed(ctx, path) {
    ctx.res.statusCode = 404;
    ctx.res.setHeader("Cache-Control", "no-store");
    return {
        props: {
            render: {
                kind: "failure",
                status: 404,
                title: "Page not found",
                message: "The requested page is unavailable.",
                requestPath: path,
                reason: "isolation"
            }
        }
    };
}
function createPublicGetServerSideProps(expectedPageIds) {
    return async function getServerSideProps(ctx) {
        const path = requestPath(ctx);
        const host = hostOf(ctx);
        const q = first(ctx.query.q);
        const page = positiveInt(ctx.query.page, 1);
        const pageSize = Math.min(50, positiveInt(ctx.query.page_size, 20));
        try {
            let response;
            if (fixtureModeEnabled()) //TURBOPACK unreachable
            ;
            else {
                const client = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ts$2f$api$2d$client$2d$public$2f$src$2f$generated$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["createPublicApiClient"])({
                    baseUrl: apiOrigin(ctx),
                    defaultInit: {
                        cache: "no-store",
                        headers: {
                            "X-BP-Public-Host": host
                        }
                    }
                });
                response = await client.request("API15-PUB-001", {
                    query: {
                        path,
                        ...q !== undefined ? {
                            q
                        } : {},
                        page,
                        page_size: pageSize
                    }
                });
            }
            if (response.status === 301 || response.status === 302 || response.status === 308) {
                const destination = response.headers.get("location");
                if (!destination) throw new Error("Canonical redirect response did not include Location");
                return {
                    redirect: {
                        destination,
                        statusCode: response.status
                    }
                };
            }
            if (response.status === 200 || response.status === 404 || response.status === 410) {
                const data = response.data;
                if (!data || !data.context || !siteMatches(data)) return failClosed(ctx, path);
                if (response.status === 200 && expectedPageIds && !expectedPageIds.includes(data.context.page_id)) {
                    ctx.res.statusCode = 500;
                    ctx.res.setHeader("Cache-Control", "no-store");
                    return {
                        props: {
                            render: {
                                kind: "failure",
                                status: 500,
                                title: "Page unavailable",
                                message: "The public response did not match this route contract.",
                                requestPath: path,
                                reason: "contract"
                            }
                        }
                    };
                }
                ctx.res.statusCode = response.status;
                copyHeader(ctx, response.headers, "Cache-Control");
                return {
                    props: {
                        render: {
                            kind: "page",
                            data,
                            requestPath: path
                        }
                    }
                };
            }
            ctx.res.statusCode = response.status;
            ctx.res.setHeader("Cache-Control", "no-store");
            return {
                props: {
                    render: {
                        kind: "failure",
                        status: response.status,
                        title: "Page temporarily unavailable",
                        message: "The public service could not complete this request. Please try again.",
                        requestPath: path,
                        reason: "transport"
                    }
                }
            };
        } catch  {
            ctx.res.statusCode = 503;
            ctx.res.setHeader("Cache-Control", "no-store");
            return {
                props: {
                    render: {
                        kind: "failure",
                        status: 503,
                        title: "Page temporarily unavailable",
                        message: "The public service is currently unavailable. Please try again.",
                        requestPath: path,
                        reason: "transport"
                    }
                }
            };
        }
    };
}
function createPreviewGetServerSideProps() {
    return async function getServerSideProps(ctx) {
        const path = requestPath(ctx);
        const host = hostOf(ctx);
        const postId = first(ctx.params?.post_id);
        ctx.res.setHeader("Cache-Control", "no-store, private");
        ctx.res.setHeader("Referrer-Policy", "no-referrer");
        if (!postId) {
            ctx.res.statusCode = 404;
            return {
                props: {
                    render: {
                        kind: "failure",
                        status: 404,
                        title: "Preview unavailable",
                        message: "The private preview is unavailable.",
                        requestPath: path,
                        reason: "preview"
                    }
                }
            };
        }
        try {
            let response;
            if (fixtureModeEnabled()) //TURBOPACK unreachable
            ;
            else {
                const cookie = first(ctx.req.headers.cookie) ?? "";
                const client = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ts$2f$api$2d$client$2d$public$2f$src$2f$generated$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["createPublicApiClient"])({
                    baseUrl: apiOrigin(ctx),
                    defaultInit: {
                        cache: "no-store",
                        headers: {
                            "X-BP-Public-Host": host,
                            ...cookie ? {
                                Cookie: cookie
                            } : {}
                        }
                    }
                });
                response = await client.request("API15-PUB-002", {
                    path: {
                        post_id: postId
                    }
                });
            }
            if (response.status === 200) {
                const data = response.data;
                if (!data || !data.context || data.context.page_id !== "PUB-SYS-PREVIEW-01" || !siteMatches(data)) return failClosed(ctx, path);
                return {
                    props: {
                        render: {
                            kind: "page",
                            data,
                            requestPath: path
                        }
                    }
                };
            }
            ctx.res.statusCode = response.status;
            return {
                props: {
                    render: {
                        kind: "failure",
                        status: response.status,
                        title: "Preview unavailable",
                        message: "This private preview cannot be displayed.",
                        requestPath: path,
                        reason: "preview"
                    }
                }
            };
        } catch  {
            ctx.res.statusCode = 503;
            return {
                props: {
                    render: {
                        kind: "failure",
                        status: 503,
                        title: "Preview unavailable",
                        message: "This private preview cannot be displayed.",
                        requestPath: path,
                        reason: "preview"
                    }
                }
            };
        }
    };
}
}),
"[project]/apps/sites/site-12-rashi-remedies/src/site/pages/article/article-page.tsx [ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ArticlePage",
    ()=>ArticlePage
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react/jsx-dev-runtime [external] (react/jsx-dev-runtime, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$sites$2f$site$2d$12$2d$rashi$2d$remedies$2f$src$2f$site$2f$components$2f$article$2d$body$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/sites/site-12-rashi-remedies/src/site/components/article-body.tsx [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$sites$2f$site$2d$12$2d$rashi$2d$remedies$2f$src$2f$site$2f$components$2f$seo$2d$head$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/sites/site-12-rashi-remedies/src/site/components/seo-head.tsx [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$sites$2f$site$2d$12$2d$rashi$2d$remedies$2f$src$2f$site$2f$components$2f$semantic$2d$components$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/sites/site-12-rashi-remedies/src/site/components/semantic-components.tsx [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$sites$2f$site$2d$12$2d$rashi$2d$remedies$2f$src$2f$site$2f$shell$2f$navigation$2f$site$2d$shell$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/sites/site-12-rashi-remedies/src/site/shell/navigation/site-shell.tsx [ssr] (ecmascript)");
;
;
;
;
;
function ArticlePage({ data, requestPath }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$sites$2f$site$2d$12$2d$rashi$2d$remedies$2f$src$2f$site$2f$components$2f$seo$2d$head$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["SeoHead"], {
                seo: data.seo
            }, void 0, false, {
                fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/pages/article/article-page.tsx",
                lineNumber: 8,
                columnNumber: 12
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$sites$2f$site$2d$12$2d$rashi$2d$remedies$2f$src$2f$site$2f$shell$2f$navigation$2f$site$2d$shell$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["SiteShell"], {
                site: data.site,
                navigation: data.navigation,
                settings: data.settings,
                requestPath: requestPath,
                children: [
                    data.breadcrumbs ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$sites$2f$site$2d$12$2d$rashi$2d$remedies$2f$src$2f$site$2f$components$2f$semantic$2d$components$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["Breadcrumbs"], {
                        trail: data.breadcrumbs
                    }, void 0, false, {
                        fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/pages/article/article-page.tsx",
                        lineNumber: 8,
                        columnNumber: 166
                    }, this) : null,
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("article", {
                        className: "container article-page",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$sites$2f$site$2d$12$2d$rashi$2d$remedies$2f$src$2f$site$2f$components$2f$semantic$2d$components$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["ArticleHeader"], {
                                article: data.article
                            }, void 0, false, {
                                fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/pages/article/article-page.tsx",
                                lineNumber: 8,
                                columnNumber: 258
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$sites$2f$site$2d$12$2d$rashi$2d$remedies$2f$src$2f$site$2f$components$2f$semantic$2d$components$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["ArticleMeta"], {
                                article: data.article
                            }, void 0, false, {
                                fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/pages/article/article-page.tsx",
                                lineNumber: 8,
                                columnNumber: 298
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$sites$2f$site$2d$12$2d$rashi$2d$remedies$2f$src$2f$site$2f$components$2f$semantic$2d$components$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["ArticleFeaturedMedia"], {
                                article: data.article
                            }, void 0, false, {
                                fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/pages/article/article-page.tsx",
                                lineNumber: 8,
                                columnNumber: 336
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$sites$2f$site$2d$12$2d$rashi$2d$remedies$2f$src$2f$site$2f$components$2f$article$2d$body$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["ArticleBodyRenderer"], {
                                blocks: data.article.body.blocks
                            }, void 0, false, {
                                fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/pages/article/article-page.tsx",
                                lineNumber: 8,
                                columnNumber: 383
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                className: "article-after",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$sites$2f$site$2d$12$2d$rashi$2d$remedies$2f$src$2f$site$2f$components$2f$semantic$2d$components$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["ArticleAuthorBlock"], {
                                        author: data.article.author
                                    }, void 0, false, {
                                        fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/pages/article/article-page.tsx",
                                        lineNumber: 8,
                                        columnNumber: 471
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$sites$2f$site$2d$12$2d$rashi$2d$remedies$2f$src$2f$site$2f$components$2f$semantic$2d$components$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["ArticleTagList"], {
                                        tags: data.article.tags
                                    }, void 0, false, {
                                        fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/pages/article/article-page.tsx",
                                        lineNumber: 8,
                                        columnNumber: 522
                                    }, this),
                                    data.related_content ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$sites$2f$site$2d$12$2d$rashi$2d$remedies$2f$src$2f$site$2f$components$2f$semantic$2d$components$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["RelatedPostsSection"], {
                                        articles: data.related_content.articles
                                    }, void 0, false, {
                                        fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/pages/article/article-page.tsx",
                                        lineNumber: 8,
                                        columnNumber: 589
                                    }, this) : null
                                ]
                            }, void 0, true, {
                                fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/pages/article/article-page.tsx",
                                lineNumber: 8,
                                columnNumber: 440
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/pages/article/article-page.tsx",
                        lineNumber: 8,
                        columnNumber: 214
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/pages/article/article-page.tsx",
                lineNumber: 8,
                columnNumber: 38
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/pages/article/article-page.tsx",
        lineNumber: 8,
        columnNumber: 10
    }, this);
}
}),
"[project]/apps/sites/site-12-rashi-remedies/src/site/pages/author/author-page.tsx [ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AuthorPage",
    ()=>AuthorPage
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react/jsx-dev-runtime [external] (react/jsx-dev-runtime, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$sites$2f$site$2d$12$2d$rashi$2d$remedies$2f$src$2f$site$2f$components$2f$seo$2d$head$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/sites/site-12-rashi-remedies/src/site/components/seo-head.tsx [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$sites$2f$site$2d$12$2d$rashi$2d$remedies$2f$src$2f$site$2f$components$2f$semantic$2d$components$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/sites/site-12-rashi-remedies/src/site/components/semantic-components.tsx [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$sites$2f$site$2d$12$2d$rashi$2d$remedies$2f$src$2f$site$2f$components$2f$responsive$2d$media$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/sites/site-12-rashi-remedies/src/site/components/responsive-media.tsx [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$sites$2f$site$2d$12$2d$rashi$2d$remedies$2f$src$2f$site$2f$shell$2f$navigation$2f$site$2d$shell$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/sites/site-12-rashi-remedies/src/site/shell/navigation/site-shell.tsx [ssr] (ecmascript)");
;
;
;
;
;
function AuthorPage({ data, requestPath }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$sites$2f$site$2d$12$2d$rashi$2d$remedies$2f$src$2f$site$2f$components$2f$seo$2d$head$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["SeoHead"], {
                seo: data.seo,
                pagination: data.pagination
            }, void 0, false, {
                fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/pages/author/author-page.tsx",
                lineNumber: 8,
                columnNumber: 12
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$sites$2f$site$2d$12$2d$rashi$2d$remedies$2f$src$2f$site$2f$shell$2f$navigation$2f$site$2d$shell$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["SiteShell"], {
                site: data.site,
                navigation: data.navigation,
                settings: data.settings,
                requestPath: requestPath,
                children: [
                    data.breadcrumbs ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$sites$2f$site$2d$12$2d$rashi$2d$remedies$2f$src$2f$site$2f$components$2f$semantic$2d$components$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["Breadcrumbs"], {
                        trail: data.breadcrumbs
                    }, void 0, false, {
                        fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/pages/author/author-page.tsx",
                        lineNumber: 8,
                        columnNumber: 195
                    }, this) : null,
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                        className: "container page-stack author-page",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("header", {
                                className: "author-intro",
                                "data-component-id": "CMP12-COLLECTION-INTRO",
                                children: [
                                    data.author.avatar_media ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$sites$2f$site$2d$12$2d$rashi$2d$remedies$2f$src$2f$site$2f$components$2f$responsive$2d$media$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["ResponsiveMedia"], {
                                        media: data.author.avatar_media
                                    }, void 0, false, {
                                        fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/pages/author/author-page.tsx",
                                        lineNumber: 8,
                                        columnNumber: 397
                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                        className: "avatar-fallback large",
                                        "aria-hidden": "true",
                                        children: data.author.display_name.split(/\s+/).slice(0, 2).map((p)=>p[0]).join("")
                                    }, void 0, false, {
                                        fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/pages/author/author-page.tsx",
                                        lineNumber: 8,
                                        columnNumber: 452
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                                                className: "eyebrow",
                                                children: "Author"
                                            }, void 0, false, {
                                                fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/pages/author/author-page.tsx",
                                                lineNumber: 8,
                                                columnNumber: 600
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("h1", {
                                                children: data.author.display_name
                                            }, void 0, false, {
                                                fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/pages/author/author-page.tsx",
                                                lineNumber: 8,
                                                columnNumber: 633
                                            }, this),
                                            data.author.designation ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                                                className: "author-designation",
                                                children: data.author.designation
                                            }, void 0, false, {
                                                fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/pages/author/author-page.tsx",
                                                lineNumber: 8,
                                                columnNumber: 695
                                            }, this) : null,
                                            data.author.bio ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                                                children: data.author.bio
                                            }, void 0, false, {
                                                fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/pages/author/author-page.tsx",
                                                lineNumber: 8,
                                                columnNumber: 785
                                            }, this) : null,
                                            data.author.expertise.length ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("ul", {
                                                className: "expertise-list",
                                                children: data.author.expertise.map((item)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("li", {
                                                        children: item
                                                    }, item, false, {
                                                        fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/pages/author/author-page.tsx",
                                                        lineNumber: 8,
                                                        columnNumber: 917
                                                    }, this))
                                            }, void 0, false, {
                                                fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/pages/author/author-page.tsx",
                                                lineNumber: 8,
                                                columnNumber: 849
                                            }, this) : null
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/pages/author/author-page.tsx",
                                        lineNumber: 8,
                                        columnNumber: 595
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/pages/author/author-page.tsx",
                                lineNumber: 8,
                                columnNumber: 293
                            }, this),
                            data.articles.length ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$sites$2f$site$2d$12$2d$rashi$2d$remedies$2f$src$2f$site$2f$components$2f$semantic$2d$components$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["ArticleCollection"], {
                                articles: data.articles
                            }, void 0, false, {
                                fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/pages/author/author-page.tsx",
                                lineNumber: 8,
                                columnNumber: 997
                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$sites$2f$site$2d$12$2d$rashi$2d$remedies$2f$src$2f$site$2f$components$2f$semantic$2d$components$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["EmptyState"], {
                                title: "No public articles",
                                body: "This author profile exists, but it currently has no eligible articles."
                            }, void 0, false, {
                                fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/pages/author/author-page.tsx",
                                lineNumber: 8,
                                columnNumber: 1046
                            }, this),
                            data.pagination ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$sites$2f$site$2d$12$2d$rashi$2d$remedies$2f$src$2f$site$2f$components$2f$semantic$2d$components$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["Pagination"], {
                                pagination: data.pagination
                            }, void 0, false, {
                                fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/pages/author/author-page.tsx",
                                lineNumber: 8,
                                columnNumber: 1185
                            }, this) : null
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/pages/author/author-page.tsx",
                        lineNumber: 8,
                        columnNumber: 243
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/pages/author/author-page.tsx",
                lineNumber: 8,
                columnNumber: 67
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/pages/author/author-page.tsx",
        lineNumber: 8,
        columnNumber: 10
    }, this);
}
}),
"[project]/apps/sites/site-12-rashi-remedies/src/site/pages/collection/collection-page.tsx [ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CollectionPage",
    ()=>CollectionPage
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react/jsx-dev-runtime [external] (react/jsx-dev-runtime, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$sites$2f$site$2d$12$2d$rashi$2d$remedies$2f$src$2f$site$2f$components$2f$seo$2d$head$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/sites/site-12-rashi-remedies/src/site/components/seo-head.tsx [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$sites$2f$site$2d$12$2d$rashi$2d$remedies$2f$src$2f$site$2f$components$2f$semantic$2d$components$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/sites/site-12-rashi-remedies/src/site/components/semantic-components.tsx [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$sites$2f$site$2d$12$2d$rashi$2d$remedies$2f$src$2f$site$2f$shell$2f$navigation$2f$site$2d$shell$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/sites/site-12-rashi-remedies/src/site/shell/navigation/site-shell.tsx [ssr] (ecmascript)");
;
;
;
;
function CollectionPage({ data, requestPath }) {
    const entity = "category" in data ? data.category : data.tag;
    const marker = "category" in data ? "Category" : "Topic";
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$sites$2f$site$2d$12$2d$rashi$2d$remedies$2f$src$2f$site$2f$components$2f$seo$2d$head$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["SeoHead"], {
                seo: data.seo,
                pagination: data.pagination
            }, void 0, false, {
                fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/pages/collection/collection-page.tsx",
                lineNumber: 10,
                columnNumber: 12
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$sites$2f$site$2d$12$2d$rashi$2d$remedies$2f$src$2f$site$2f$shell$2f$navigation$2f$site$2d$shell$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["SiteShell"], {
                site: data.site,
                navigation: data.navigation,
                settings: data.settings,
                requestPath: requestPath,
                children: [
                    data.breadcrumbs ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$sites$2f$site$2d$12$2d$rashi$2d$remedies$2f$src$2f$site$2f$components$2f$semantic$2d$components$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["Breadcrumbs"], {
                        trail: data.breadcrumbs
                    }, void 0, false, {
                        fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/pages/collection/collection-page.tsx",
                        lineNumber: 10,
                        columnNumber: 195
                    }, this) : null,
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                        className: "container page-stack collection-page",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$sites$2f$site$2d$12$2d$rashi$2d$remedies$2f$src$2f$site$2f$components$2f$semantic$2d$components$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["CollectionIntroduction"], {
                                title: entity.name,
                                description: entity.description,
                                marker: marker
                            }, void 0, false, {
                                fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/pages/collection/collection-page.tsx",
                                lineNumber: 10,
                                columnNumber: 297
                            }, this),
                            data.articles.length ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$sites$2f$site$2d$12$2d$rashi$2d$remedies$2f$src$2f$site$2f$components$2f$semantic$2d$components$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["ArticleCollection"], {
                                articles: data.articles
                            }, void 0, false, {
                                fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/pages/collection/collection-page.tsx",
                                lineNumber: 10,
                                columnNumber: 416
                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$sites$2f$site$2d$12$2d$rashi$2d$remedies$2f$src$2f$site$2f$components$2f$semantic$2d$components$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["EmptyState"], {
                                title: `No articles in ${entity.name}`,
                                body: "This public archive exists, but there are no eligible articles to show."
                            }, void 0, false, {
                                fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/pages/collection/collection-page.tsx",
                                lineNumber: 10,
                                columnNumber: 465
                            }, this),
                            data.pagination ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$sites$2f$site$2d$12$2d$rashi$2d$remedies$2f$src$2f$site$2f$components$2f$semantic$2d$components$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["Pagination"], {
                                pagination: data.pagination
                            }, void 0, false, {
                                fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/pages/collection/collection-page.tsx",
                                lineNumber: 10,
                                columnNumber: 618
                            }, this) : null
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/pages/collection/collection-page.tsx",
                        lineNumber: 10,
                        columnNumber: 243
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/pages/collection/collection-page.tsx",
                lineNumber: 10,
                columnNumber: 67
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/pages/collection/collection-page.tsx",
        lineNumber: 10,
        columnNumber: 10
    }, this);
}
}),
"[project]/apps/sites/site-12-rashi-remedies/src/site/pages/home/home-page.tsx [ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "HomePage",
    ()=>HomePage
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react/jsx-dev-runtime [external] (react/jsx-dev-runtime, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$sites$2f$site$2d$12$2d$rashi$2d$remedies$2f$src$2f$site$2f$components$2f$seo$2d$head$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/sites/site-12-rashi-remedies/src/site/components/seo-head.tsx [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$sites$2f$site$2d$12$2d$rashi$2d$remedies$2f$src$2f$site$2f$components$2f$semantic$2d$components$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/sites/site-12-rashi-remedies/src/site/components/semantic-components.tsx [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$sites$2f$site$2d$12$2d$rashi$2d$remedies$2f$src$2f$site$2f$shell$2f$navigation$2f$site$2d$shell$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/sites/site-12-rashi-remedies/src/site/shell/navigation/site-shell.tsx [ssr] (ecmascript)");
;
;
;
;
function HomePage({ data, requestPath }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$sites$2f$site$2d$12$2d$rashi$2d$remedies$2f$src$2f$site$2f$components$2f$seo$2d$head$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["SeoHead"], {
                seo: data.seo
            }, void 0, false, {
                fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/pages/home/home-page.tsx",
                lineNumber: 7,
                columnNumber: 12
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$sites$2f$site$2d$12$2d$rashi$2d$remedies$2f$src$2f$site$2f$shell$2f$navigation$2f$site$2d$shell$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["SiteShell"], {
                site: data.site,
                navigation: data.navigation,
                settings: data.settings,
                requestPath: requestPath,
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                    className: "container page-stack home-page",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$sites$2f$site$2d$12$2d$rashi$2d$remedies$2f$src$2f$site$2f$components$2f$semantic$2d$components$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["PageIntro"], {
                            h1: data.intro.h1,
                            introText: data.intro.intro_text
                        }, void 0, false, {
                            fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/pages/home/home-page.tsx",
                            lineNumber: 7,
                            columnNumber: 194
                        }, this),
                        data.lead_article ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$sites$2f$site$2d$12$2d$rashi$2d$remedies$2f$src$2f$site$2f$components$2f$semantic$2d$components$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["HomeLeadRegion"], {
                            article: data.lead_article
                        }, void 0, false, {
                            fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/pages/home/home-page.tsx",
                            lineNumber: 7,
                            columnNumber: 281
                        }, this) : null,
                        data.sections.map((section)=>{
                            if (section.section_kind === "POST_SELECTION" && section.posts?.length) return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$sites$2f$site$2d$12$2d$rashi$2d$remedies$2f$src$2f$site$2f$components$2f$semantic$2d$components$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["HomeSectionContainer"], {
                                label: section.label,
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$sites$2f$site$2d$12$2d$rashi$2d$remedies$2f$src$2f$site$2f$components$2f$semantic$2d$components$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["HomeFeaturedPostsSection"], {
                                    articles: section.posts
                                }, void 0, false, {
                                    fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/pages/home/home-page.tsx",
                                    lineNumber: 7,
                                    columnNumber: 518
                                }, this)
                            }, section.section_key, false, {
                                fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/pages/home/home-page.tsx",
                                lineNumber: 7,
                                columnNumber: 448
                            }, this);
                            if (section.section_kind === "CATEGORY_SELECTION" && section.categories?.length) return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$sites$2f$site$2d$12$2d$rashi$2d$remedies$2f$src$2f$site$2f$components$2f$semantic$2d$components$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["HomeSectionContainer"], {
                                label: section.label,
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$sites$2f$site$2d$12$2d$rashi$2d$remedies$2f$src$2f$site$2f$components$2f$semantic$2d$components$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["HomeFeaturedCategoriesSection"], {
                                    categories: section.categories
                                }, void 0, false, {
                                    fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/pages/home/home-page.tsx",
                                    lineNumber: 7,
                                    columnNumber: 754
                                }, this)
                            }, section.section_key, false, {
                                fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/pages/home/home-page.tsx",
                                lineNumber: 7,
                                columnNumber: 684
                            }, this);
                            if (section.section_kind === "TOGGLE_ONLY" && section.label) return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$sites$2f$site$2d$12$2d$rashi$2d$remedies$2f$src$2f$site$2f$components$2f$semantic$2d$components$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["HomeSectionContainer"], {
                                label: section.label,
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                    className: "section-presence",
                                    "aria-hidden": "true"
                                }, void 0, false, {
                                    fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/pages/home/home-page.tsx",
                                    lineNumber: 7,
                                    columnNumber: 982
                                }, this)
                            }, section.section_key, false, {
                                fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/pages/home/home-page.tsx",
                                lineNumber: 7,
                                columnNumber: 912
                            }, this);
                            return null;
                        }),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$sites$2f$site$2d$12$2d$rashi$2d$remedies$2f$src$2f$site$2f$components$2f$semantic$2d$components$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["HomeSectionContainer"], {
                            label: "Latest articles",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$sites$2f$site$2d$12$2d$rashi$2d$remedies$2f$src$2f$site$2f$components$2f$semantic$2d$components$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["HomePrimaryArticleCollection"], {
                                articles: data.latest_articles
                            }, void 0, false, {
                                fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/pages/home/home-page.tsx",
                                lineNumber: 7,
                                columnNumber: 1125
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/pages/home/home-page.tsx",
                            lineNumber: 7,
                            columnNumber: 1079
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/pages/home/home-page.tsx",
                    lineNumber: 7,
                    columnNumber: 146
                }, this)
            }, void 0, false, {
                fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/pages/home/home-page.tsx",
                lineNumber: 7,
                columnNumber: 38
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/pages/home/home-page.tsx",
        lineNumber: 7,
        columnNumber: 10
    }, this);
}
}),
"[project]/apps/sites/site-12-rashi-remedies/src/site/pages/preview/preview-page.tsx [ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "PreviewPage",
    ()=>PreviewPage
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react/jsx-dev-runtime [external] (react/jsx-dev-runtime, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$3$2e$5_$40$types$2b$node$40$24$2e$13$2e$4_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$head$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.3.5_@types+node@24.13.4_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/head.js [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$sites$2f$site$2d$12$2d$rashi$2d$remedies$2f$src$2f$site$2f$components$2f$article$2d$body$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/sites/site-12-rashi-remedies/src/site/components/article-body.tsx [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$sites$2f$site$2d$12$2d$rashi$2d$remedies$2f$src$2f$site$2f$components$2f$seo$2d$head$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/sites/site-12-rashi-remedies/src/site/components/seo-head.tsx [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$sites$2f$site$2d$12$2d$rashi$2d$remedies$2f$src$2f$site$2f$components$2f$semantic$2d$components$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/sites/site-12-rashi-remedies/src/site/components/semantic-components.tsx [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$sites$2f$site$2d$12$2d$rashi$2d$remedies$2f$src$2f$site$2f$shell$2f$navigation$2f$site$2d$shell$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/sites/site-12-rashi-remedies/src/site/shell/navigation/site-shell.tsx [ssr] (ecmascript)");
;
;
;
;
;
;
function PreviewPage({ data, requestPath }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$sites$2f$site$2d$12$2d$rashi$2d$remedies$2f$src$2f$site$2f$components$2f$seo$2d$head$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["SeoHead"], {
                seo: data.seo
            }, void 0, false, {
                fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/pages/preview/preview-page.tsx",
                lineNumber: 9,
                columnNumber: 12
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$3$2e$5_$40$types$2b$node$40$24$2e$13$2e$4_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$head$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["default"], {
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("meta", {
                    name: "robots",
                    content: "noindex,nofollow,noarchive"
                }, void 0, false, {
                    fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/pages/preview/preview-page.tsx",
                    lineNumber: 9,
                    columnNumber: 44
                }, this)
            }, void 0, false, {
                fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/pages/preview/preview-page.tsx",
                lineNumber: 9,
                columnNumber: 38
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$sites$2f$site$2d$12$2d$rashi$2d$remedies$2f$src$2f$site$2f$shell$2f$navigation$2f$site$2d$shell$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["SiteShell"], {
                site: data.site,
                navigation: data.navigation,
                settings: data.settings,
                requestPath: requestPath,
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("article", {
                    className: "container article-page preview-page",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$sites$2f$site$2d$12$2d$rashi$2d$remedies$2f$src$2f$site$2f$components$2f$semantic$2d$components$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["PreviewStatusNotice"], {
                            preview: data.preview
                        }, void 0, false, {
                            fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/pages/preview/preview-page.tsx",
                            lineNumber: 9,
                            columnNumber: 275
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$sites$2f$site$2d$12$2d$rashi$2d$remedies$2f$src$2f$site$2f$components$2f$semantic$2d$components$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["ArticleHeader"], {
                            article: data.article
                        }, void 0, false, {
                            fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/pages/preview/preview-page.tsx",
                            lineNumber: 9,
                            columnNumber: 321
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$sites$2f$site$2d$12$2d$rashi$2d$remedies$2f$src$2f$site$2f$components$2f$semantic$2d$components$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["ArticleMeta"], {
                            article: data.article
                        }, void 0, false, {
                            fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/pages/preview/preview-page.tsx",
                            lineNumber: 9,
                            columnNumber: 361
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$sites$2f$site$2d$12$2d$rashi$2d$remedies$2f$src$2f$site$2f$components$2f$semantic$2d$components$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["ArticleFeaturedMedia"], {
                            article: data.article
                        }, void 0, false, {
                            fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/pages/preview/preview-page.tsx",
                            lineNumber: 9,
                            columnNumber: 399
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$sites$2f$site$2d$12$2d$rashi$2d$remedies$2f$src$2f$site$2f$components$2f$article$2d$body$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["ArticleBodyRenderer"], {
                            blocks: data.article.body.blocks
                        }, void 0, false, {
                            fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/pages/preview/preview-page.tsx",
                            lineNumber: 9,
                            columnNumber: 446
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                            className: "article-after",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$sites$2f$site$2d$12$2d$rashi$2d$remedies$2f$src$2f$site$2f$components$2f$semantic$2d$components$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["ArticleAuthorBlock"], {
                                    author: data.article.author
                                }, void 0, false, {
                                    fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/pages/preview/preview-page.tsx",
                                    lineNumber: 9,
                                    columnNumber: 534
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$sites$2f$site$2d$12$2d$rashi$2d$remedies$2f$src$2f$site$2f$components$2f$semantic$2d$components$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["ArticleTagList"], {
                                    tags: data.article.tags
                                }, void 0, false, {
                                    fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/pages/preview/preview-page.tsx",
                                    lineNumber: 9,
                                    columnNumber: 585
                                }, this),
                                data.related_content ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$sites$2f$site$2d$12$2d$rashi$2d$remedies$2f$src$2f$site$2f$components$2f$semantic$2d$components$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["RelatedPostsSection"], {
                                    articles: data.related_content.articles
                                }, void 0, false, {
                                    fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/pages/preview/preview-page.tsx",
                                    lineNumber: 9,
                                    columnNumber: 652
                                }, this) : null
                            ]
                        }, void 0, true, {
                            fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/pages/preview/preview-page.tsx",
                            lineNumber: 9,
                            columnNumber: 503
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/pages/preview/preview-page.tsx",
                    lineNumber: 9,
                    columnNumber: 218
                }, this)
            }, void 0, false, {
                fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/pages/preview/preview-page.tsx",
                lineNumber: 9,
                columnNumber: 110
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/pages/preview/preview-page.tsx",
        lineNumber: 9,
        columnNumber: 10
    }, this);
}
}),
"[project]/apps/sites/site-12-rashi-remedies/src/site/pages/router/public-route-page.tsx [ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "PublicRoutePage",
    ()=>PublicRoutePage
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react/jsx-dev-runtime [external] (react/jsx-dev-runtime, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$sites$2f$site$2d$12$2d$rashi$2d$remedies$2f$src$2f$site$2f$components$2f$semantic$2d$components$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/sites/site-12-rashi-remedies/src/site/components/semantic-components.tsx [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$sites$2f$site$2d$12$2d$rashi$2d$remedies$2f$src$2f$site$2f$pages$2f$home$2f$home$2d$page$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/sites/site-12-rashi-remedies/src/site/pages/home/home-page.tsx [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$sites$2f$site$2d$12$2d$rashi$2d$remedies$2f$src$2f$site$2f$pages$2f$article$2f$article$2d$page$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/sites/site-12-rashi-remedies/src/site/pages/article/article-page.tsx [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$sites$2f$site$2d$12$2d$rashi$2d$remedies$2f$src$2f$site$2f$pages$2f$collection$2f$collection$2d$page$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/sites/site-12-rashi-remedies/src/site/pages/collection/collection-page.tsx [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$sites$2f$site$2d$12$2d$rashi$2d$remedies$2f$src$2f$site$2f$pages$2f$author$2f$author$2d$page$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/sites/site-12-rashi-remedies/src/site/pages/author/author-page.tsx [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$sites$2f$site$2d$12$2d$rashi$2d$remedies$2f$src$2f$site$2f$pages$2f$search$2f$search$2d$page$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/sites/site-12-rashi-remedies/src/site/pages/search/search-page.tsx [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$sites$2f$site$2d$12$2d$rashi$2d$remedies$2f$src$2f$site$2f$pages$2f$static$2f$static$2d$page$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/sites/site-12-rashi-remedies/src/site/pages/static/static-page.tsx [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$sites$2f$site$2d$12$2d$rashi$2d$remedies$2f$src$2f$site$2f$pages$2f$preview$2f$preview$2d$page$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/sites/site-12-rashi-remedies/src/site/pages/preview/preview-page.tsx [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$sites$2f$site$2d$12$2d$rashi$2d$remedies$2f$src$2f$site$2f$pages$2f$system$2f$system$2d$page$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/sites/site-12-rashi-remedies/src/site/pages/system/system-page.tsx [ssr] (ecmascript)");
;
;
;
;
;
;
;
;
;
;
function PublicRoutePage({ render }) {
    if (render.kind === "failure") return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("main", {
        id: "main-content",
        className: "neutral-system-shell",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
            className: "container system-page",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$sites$2f$site$2d$12$2d$rashi$2d$remedies$2f$src$2f$site$2f$components$2f$semantic$2d$components$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["ErrorState"], {
                title: render.title,
                body: render.message
            }, void 0, false, {
                fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/pages/router/public-route-page.tsx",
                lineNumber: 14,
                columnNumber: 137
            }, this)
        }, void 0, false, {
            fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/pages/router/public-route-page.tsx",
            lineNumber: 14,
            columnNumber: 98
        }, this)
    }, void 0, false, {
        fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/pages/router/public-route-page.tsx",
        lineNumber: 14,
        columnNumber: 41
    }, this);
    const data = render.data;
    switch(data.context.page_id){
        case "PUB-HOME-01":
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$sites$2f$site$2d$12$2d$rashi$2d$remedies$2f$src$2f$site$2f$pages$2f$home$2f$home$2d$page$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["HomePage"], {
                data: data,
                requestPath: render.requestPath
            }, void 0, false, {
                fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/pages/router/public-route-page.tsx",
                lineNumber: 17,
                columnNumber: 32
            }, this);
        case "PUB-ARTICLE-01":
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$sites$2f$site$2d$12$2d$rashi$2d$remedies$2f$src$2f$site$2f$pages$2f$article$2f$article$2d$page$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["ArticlePage"], {
                data: data,
                requestPath: render.requestPath
            }, void 0, false, {
                fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/pages/router/public-route-page.tsx",
                lineNumber: 18,
                columnNumber: 35
            }, this);
        case "PUB-CATEGORY-01":
        case "PUB-TAG-01":
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$sites$2f$site$2d$12$2d$rashi$2d$remedies$2f$src$2f$site$2f$pages$2f$collection$2f$collection$2d$page$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["CollectionPage"], {
                data: data,
                requestPath: render.requestPath
            }, void 0, false, {
                fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/pages/router/public-route-page.tsx",
                lineNumber: 20,
                columnNumber: 31
            }, this);
        case "PUB-AUTHOR-01":
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$sites$2f$site$2d$12$2d$rashi$2d$remedies$2f$src$2f$site$2f$pages$2f$author$2f$author$2d$page$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["AuthorPage"], {
                data: data,
                requestPath: render.requestPath
            }, void 0, false, {
                fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/pages/router/public-route-page.tsx",
                lineNumber: 21,
                columnNumber: 34
            }, this);
        case "PUB-SEARCH-01":
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$sites$2f$site$2d$12$2d$rashi$2d$remedies$2f$src$2f$site$2f$pages$2f$search$2f$search$2d$page$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["SearchPage"], {
                data: data,
                requestPath: render.requestPath
            }, void 0, false, {
                fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/pages/router/public-route-page.tsx",
                lineNumber: 22,
                columnNumber: 34
            }, this);
        case "PUB-STATIC-ABOUT-01":
        case "PUB-STATIC-CONTACT-01":
        case "PUB-STATIC-PRIVACY-01":
        case "PUB-STATIC-TERMS-01":
        case "PUB-STATIC-DISCLAIMER-01":
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$sites$2f$site$2d$12$2d$rashi$2d$remedies$2f$src$2f$site$2f$pages$2f$static$2f$static$2d$page$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["StaticInformationPage"], {
                data: data,
                requestPath: render.requestPath
            }, void 0, false, {
                fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/pages/router/public-route-page.tsx",
                lineNumber: 27,
                columnNumber: 45
            }, this);
        case "PUB-SYS-PREVIEW-01":
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$sites$2f$site$2d$12$2d$rashi$2d$remedies$2f$src$2f$site$2f$pages$2f$preview$2f$preview$2d$page$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["PreviewPage"], {
                data: data,
                requestPath: render.requestPath
            }, void 0, false, {
                fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/pages/router/public-route-page.tsx",
                lineNumber: 28,
                columnNumber: 39
            }, this);
        case "PUB-SYS-404-01":
        case "PUB-SYS-410-01":
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$sites$2f$site$2d$12$2d$rashi$2d$remedies$2f$src$2f$site$2f$pages$2f$system$2f$system$2d$page$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["SystemPage"], {
                data: data,
                requestPath: render.requestPath
            }, void 0, false, {
                fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/pages/router/public-route-page.tsx",
                lineNumber: 30,
                columnNumber: 35
            }, this);
    }
}
}),
"[project]/apps/sites/site-12-rashi-remedies/src/site/pages/search/search-page.tsx [ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "SearchPage",
    ()=>SearchPage
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react/jsx-dev-runtime [external] (react/jsx-dev-runtime, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$sites$2f$site$2d$12$2d$rashi$2d$remedies$2f$src$2f$site$2f$components$2f$seo$2d$head$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/sites/site-12-rashi-remedies/src/site/components/seo-head.tsx [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$sites$2f$site$2d$12$2d$rashi$2d$remedies$2f$src$2f$site$2f$components$2f$semantic$2d$components$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/sites/site-12-rashi-remedies/src/site/components/semantic-components.tsx [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$sites$2f$site$2d$12$2d$rashi$2d$remedies$2f$src$2f$site$2f$shell$2f$navigation$2f$site$2d$shell$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/sites/site-12-rashi-remedies/src/site/shell/navigation/site-shell.tsx [ssr] (ecmascript)");
;
;
;
;
function SearchPage({ data, requestPath }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$sites$2f$site$2d$12$2d$rashi$2d$remedies$2f$src$2f$site$2f$components$2f$seo$2d$head$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["SeoHead"], {
                seo: data.seo,
                pagination: data.pagination
            }, void 0, false, {
                fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/pages/search/search-page.tsx",
                lineNumber: 7,
                columnNumber: 12
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$sites$2f$site$2d$12$2d$rashi$2d$remedies$2f$src$2f$site$2f$shell$2f$navigation$2f$site$2d$shell$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["SiteShell"], {
                site: data.site,
                navigation: data.navigation,
                settings: data.settings,
                requestPath: requestPath,
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                    className: "container page-stack search-page",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$sites$2f$site$2d$12$2d$rashi$2d$remedies$2f$src$2f$site$2f$components$2f$semantic$2d$components$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["PageIntro"], {
                            h1: data.intro.h1,
                            introText: data.intro.intro_text
                        }, void 0, false, {
                            fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/pages/search/search-page.tsx",
                            lineNumber: 7,
                            columnNumber: 225
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$sites$2f$site$2d$12$2d$rashi$2d$remedies$2f$src$2f$site$2f$components$2f$semantic$2d$components$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["SearchForm"], {
                            query: data.query
                        }, void 0, false, {
                            fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/pages/search/search-page.tsx",
                            lineNumber: 7,
                            columnNumber: 291
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$sites$2f$site$2d$12$2d$rashi$2d$remedies$2f$src$2f$site$2f$components$2f$semantic$2d$components$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["SearchResultsRegion"], {
                            articles: data.articles,
                            state: data.search_state,
                            summary: data.result_summary
                        }, void 0, false, {
                            fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/pages/search/search-page.tsx",
                            lineNumber: 7,
                            columnNumber: 324
                        }, this),
                        data.pagination ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$sites$2f$site$2d$12$2d$rashi$2d$remedies$2f$src$2f$site$2f$components$2f$semantic$2d$components$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["Pagination"], {
                            pagination: data.pagination
                        }, void 0, false, {
                            fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/pages/search/search-page.tsx",
                            lineNumber: 7,
                            columnNumber: 447
                        }, this) : null
                    ]
                }, void 0, true, {
                    fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/pages/search/search-page.tsx",
                    lineNumber: 7,
                    columnNumber: 175
                }, this)
            }, void 0, false, {
                fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/pages/search/search-page.tsx",
                lineNumber: 7,
                columnNumber: 67
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/pages/search/search-page.tsx",
        lineNumber: 7,
        columnNumber: 10
    }, this);
}
}),
"[project]/apps/sites/site-12-rashi-remedies/src/site/pages/static/static-page.tsx [ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "StaticInformationPage",
    ()=>StaticInformationPage
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react/jsx-dev-runtime [external] (react/jsx-dev-runtime, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$sites$2f$site$2d$12$2d$rashi$2d$remedies$2f$src$2f$site$2f$components$2f$seo$2d$head$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/sites/site-12-rashi-remedies/src/site/components/seo-head.tsx [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$sites$2f$site$2d$12$2d$rashi$2d$remedies$2f$src$2f$site$2f$components$2f$semantic$2d$components$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/sites/site-12-rashi-remedies/src/site/components/semantic-components.tsx [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$sites$2f$site$2d$12$2d$rashi$2d$remedies$2f$src$2f$site$2f$shell$2f$navigation$2f$site$2d$shell$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/sites/site-12-rashi-remedies/src/site/shell/navigation/site-shell.tsx [ssr] (ecmascript)");
;
;
;
;
function StaticInformationPage({ data, requestPath }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$sites$2f$site$2d$12$2d$rashi$2d$remedies$2f$src$2f$site$2f$components$2f$seo$2d$head$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["SeoHead"], {
                seo: data.seo
            }, void 0, false, {
                fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/pages/static/static-page.tsx",
                lineNumber: 7,
                columnNumber: 12
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$sites$2f$site$2d$12$2d$rashi$2d$remedies$2f$src$2f$site$2f$shell$2f$navigation$2f$site$2d$shell$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["SiteShell"], {
                site: data.site,
                navigation: data.navigation,
                settings: data.settings,
                requestPath: requestPath,
                children: [
                    data.breadcrumbs ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$sites$2f$site$2d$12$2d$rashi$2d$remedies$2f$src$2f$site$2f$components$2f$semantic$2d$components$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["Breadcrumbs"], {
                        trail: data.breadcrumbs
                    }, void 0, false, {
                        fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/pages/static/static-page.tsx",
                        lineNumber: 7,
                        columnNumber: 166
                    }, this) : null,
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                        className: "container page-stack static-page",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$sites$2f$site$2d$12$2d$rashi$2d$remedies$2f$src$2f$site$2f$components$2f$semantic$2d$components$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["PageIntro"], {
                                h1: data.content.title,
                                introText: data.content.intro_text
                            }, void 0, false, {
                                fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/pages/static/static-page.tsx",
                                lineNumber: 7,
                                columnNumber: 264
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$sites$2f$site$2d$12$2d$rashi$2d$remedies$2f$src$2f$site$2f$components$2f$semantic$2d$components$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["StaticInformationBody"], {
                                content: data.content,
                                contactInfo: data.contact_info
                            }, void 0, false, {
                                fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/pages/static/static-page.tsx",
                                lineNumber: 7,
                                columnNumber: 337
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/pages/static/static-page.tsx",
                        lineNumber: 7,
                        columnNumber: 214
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/pages/static/static-page.tsx",
                lineNumber: 7,
                columnNumber: 38
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/pages/static/static-page.tsx",
        lineNumber: 7,
        columnNumber: 10
    }, this);
}
}),
"[project]/apps/sites/site-12-rashi-remedies/src/site/pages/system/system-page.tsx [ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "SystemPage",
    ()=>SystemPage
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react/jsx-dev-runtime [external] (react/jsx-dev-runtime, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$sites$2f$site$2d$12$2d$rashi$2d$remedies$2f$src$2f$site$2f$components$2f$seo$2d$head$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/sites/site-12-rashi-remedies/src/site/components/seo-head.tsx [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$sites$2f$site$2d$12$2d$rashi$2d$remedies$2f$src$2f$site$2f$components$2f$semantic$2d$components$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/sites/site-12-rashi-remedies/src/site/components/semantic-components.tsx [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$sites$2f$site$2d$12$2d$rashi$2d$remedies$2f$src$2f$site$2f$shell$2f$navigation$2f$site$2d$shell$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/sites/site-12-rashi-remedies/src/site/shell/navigation/site-shell.tsx [ssr] (ecmascript)");
;
;
;
;
function SystemPage({ data, requestPath }) {
    const content = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
        className: "container system-page",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$sites$2f$site$2d$12$2d$rashi$2d$remedies$2f$src$2f$site$2f$components$2f$semantic$2d$components$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["SystemMessageView"], {
                code: data.message.code,
                title: data.message.title,
                body: data.message.body
            }, void 0, false, {
                fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/pages/system/system-page.tsx",
                lineNumber: 7,
                columnNumber: 58
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$sites$2f$site$2d$12$2d$rashi$2d$remedies$2f$src$2f$site$2f$components$2f$semantic$2d$components$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["RecoveryActions"], {
                home: data.recovery?.home,
                search: data.recovery?.search
            }, void 0, false, {
                fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/pages/system/system-page.tsx",
                lineNumber: 7,
                columnNumber: 156
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/pages/system/system-page.tsx",
        lineNumber: 7,
        columnNumber: 19
    }, this);
    if (!data.site || !data.navigation || !data.settings) return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$sites$2f$site$2d$12$2d$rashi$2d$remedies$2f$src$2f$site$2f$components$2f$seo$2d$head$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["SeoHead"], {
                seo: data.seo
            }, void 0, false, {
                fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/pages/system/system-page.tsx",
                lineNumber: 8,
                columnNumber: 66
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("main", {
                id: "main-content",
                className: "neutral-system-shell",
                children: content
            }, void 0, false, {
                fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/pages/system/system-page.tsx",
                lineNumber: 8,
                columnNumber: 92
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/pages/system/system-page.tsx",
        lineNumber: 8,
        columnNumber: 64
    }, this);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$sites$2f$site$2d$12$2d$rashi$2d$remedies$2f$src$2f$site$2f$components$2f$seo$2d$head$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["SeoHead"], {
                seo: data.seo
            }, void 0, false, {
                fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/pages/system/system-page.tsx",
                lineNumber: 9,
                columnNumber: 12
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$sites$2f$site$2d$12$2d$rashi$2d$remedies$2f$src$2f$site$2f$shell$2f$navigation$2f$site$2d$shell$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["SiteShell"], {
                site: data.site,
                navigation: data.navigation,
                settings: data.settings,
                requestPath: requestPath,
                children: content
            }, void 0, false, {
                fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/pages/system/system-page.tsx",
                lineNumber: 9,
                columnNumber: 38
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/pages/system/system-page.tsx",
        lineNumber: 9,
        columnNumber: 10
    }, this);
}
}),
"[project]/apps/sites/site-12-rashi-remedies/src/site/shell/footer/site-footer.tsx [ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "SiteFooter",
    ()=>SiteFooter
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react/jsx-dev-runtime [external] (react/jsx-dev-runtime, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$sites$2f$site$2d$12$2d$rashi$2d$remedies$2f$src$2f$site$2f$components$2f$destination$2d$link$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/sites/site-12-rashi-remedies/src/site/components/destination-link.tsx [ssr] (ecmascript)");
;
;
function SiteFooter({ site, navigation, settings }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("footer", {
        className: "site-footer",
        "data-component-id": "CMP12-SHELL-FOOTER",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                className: "container footer-grid",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                        className: "footer-brand",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("strong", {
                                children: site.display_name
                            }, void 0, false, {
                                fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/shell/footer/site-footer.tsx",
                                lineNumber: 8,
                                columnNumber: 39
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                                children: site.canonical_domain
                            }, void 0, false, {
                                fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/shell/footer/site-footer.tsx",
                                lineNumber: 8,
                                columnNumber: 75
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/shell/footer/site-footer.tsx",
                        lineNumber: 8,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("nav", {
                        "aria-label": "Footer navigation",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("ul", {
                            children: navigation.footer.items.map((item)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("li", {
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$sites$2f$site$2d$12$2d$rashi$2d$remedies$2f$src$2f$site$2f$components$2f$destination$2d$link$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["DestinationLink"], {
                                        destination: item.destination,
                                        children: item.label
                                    }, void 0, false, {
                                        fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/shell/footer/site-footer.tsx",
                                        lineNumber: 9,
                                        columnNumber: 138
                                    }, this)
                                }, `${item.label}-${item.destination.url}`, false, {
                                    fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/shell/footer/site-footer.tsx",
                                    lineNumber: 9,
                                    columnNumber: 88
                                }, this))
                        }, void 0, false, {
                            fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/shell/footer/site-footer.tsx",
                            lineNumber: 9,
                            columnNumber: 45
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/shell/footer/site-footer.tsx",
                        lineNumber: 9,
                        columnNumber: 9
                    }, this),
                    settings.social_profiles.length ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                        className: "footer-social",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                                children: "Elsewhere"
                            }, void 0, false, {
                                fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/shell/footer/site-footer.tsx",
                                lineNumber: 10,
                                columnNumber: 75
                            }, this),
                            settings.social_profiles.map((profile)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("a", {
                                    href: profile.url,
                                    rel: "noopener noreferrer",
                                    target: "_blank",
                                    children: profile.label ?? profile.platform
                                }, profile.url, false, {
                                    fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/shell/footer/site-footer.tsx",
                                    lineNumber: 10,
                                    columnNumber: 134
                                }, this))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/shell/footer/site-footer.tsx",
                        lineNumber: 10,
                        columnNumber: 44
                    }, this) : null
                ]
            }, void 0, true, {
                fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/shell/footer/site-footer.tsx",
                lineNumber: 7,
                columnNumber: 7
            }, this),
            settings.copyright_text ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                className: "container footer-legal",
                children: settings.copyright_text
            }, void 0, false, {
                fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/shell/footer/site-footer.tsx",
                lineNumber: 12,
                columnNumber: 34
            }, this) : null
        ]
    }, void 0, true, {
        fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/shell/footer/site-footer.tsx",
        lineNumber: 6,
        columnNumber: 5
    }, this);
}
}),
"[project]/apps/sites/site-12-rashi-remedies/src/site/shell/header/site-header.tsx [ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "SiteHeader",
    ()=>SiteHeader
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react/jsx-dev-runtime [external] (react/jsx-dev-runtime, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$sites$2f$site$2d$12$2d$rashi$2d$remedies$2f$src$2f$site$2f$components$2f$destination$2d$link$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/sites/site-12-rashi-remedies/src/site/components/destination-link.tsx [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$sites$2f$site$2d$12$2d$rashi$2d$remedies$2f$src$2f$site$2f$lib$2f$destination$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/sites/site-12-rashi-remedies/src/site/lib/destination.ts [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$sites$2f$site$2d$12$2d$rashi$2d$remedies$2f$src$2f$site$2f$shell$2f$navigation$2f$mobile$2d$navigation$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/sites/site-12-rashi-remedies/src/site/shell/navigation/mobile-navigation.tsx [ssr] (ecmascript)");
;
;
;
;
function findSearch(items) {
    for (const item of items){
        if (item.destination.kind === "SEARCH") return item.destination;
        const child = item.children.find((value)=>value.destination.kind === "SEARCH");
        if (child) return child.destination;
    }
    return undefined;
}
function SiteHeader({ site, navigation, requestPath }) {
    const searchDestination = findSearch(navigation.header.items);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("header", {
        className: "site-header",
        "data-component-id": "CMP12-SHELL-HEADER",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
            className: "container header-inner",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$sites$2f$site$2d$12$2d$rashi$2d$remedies$2f$src$2f$site$2f$components$2f$destination$2d$link$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["DestinationLink"], {
                    destination: site.home_destination,
                    className: "brand-link",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                            className: "brand-mark",
                            "aria-hidden": "true"
                        }, void 0, false, {
                            fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/shell/header/site-header.tsx",
                            lineNumber: 21,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                            className: "brand-copy",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("strong", {
                                    children: site.display_name
                                }, void 0, false, {
                                    fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/shell/header/site-header.tsx",
                                    lineNumber: 22,
                                    columnNumber: 40
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("small", {
                                    children: site.canonical_domain
                                }, void 0, false, {
                                    fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/shell/header/site-header.tsx",
                                    lineNumber: 22,
                                    columnNumber: 76
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/shell/header/site-header.tsx",
                            lineNumber: 22,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/shell/header/site-header.tsx",
                    lineNumber: 20,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("nav", {
                    className: "desktop-nav",
                    "aria-label": "Primary navigation",
                    "data-component-id": "CMP12-SHELL-NAV",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("ul", {
                        children: navigation.header.items.map((item)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("li", {
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$sites$2f$site$2d$12$2d$rashi$2d$remedies$2f$src$2f$site$2f$components$2f$destination$2d$link$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["DestinationLink"], {
                                    destination: item.destination,
                                    ariaCurrent: (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$sites$2f$site$2d$12$2d$rashi$2d$remedies$2f$src$2f$site$2f$lib$2f$destination$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["isCurrentDestination"])(item.destination, requestPath) ? "page" : undefined,
                                    children: item.label
                                }, void 0, false, {
                                    fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/shell/header/site-header.tsx",
                                    lineNumber: 26,
                                    columnNumber: 102
                                }, this)
                            }, `${item.label}-${item.destination.url}`, false, {
                                fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/shell/header/site-header.tsx",
                                lineNumber: 26,
                                columnNumber: 52
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/shell/header/site-header.tsx",
                        lineNumber: 25,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/shell/header/site-header.tsx",
                    lineNumber: 24,
                    columnNumber: 9
                }, this),
                searchDestination ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$sites$2f$site$2d$12$2d$rashi$2d$remedies$2f$src$2f$site$2f$components$2f$destination$2d$link$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["DestinationLink"], {
                    destination: searchDestination,
                    className: "header-search",
                    ariaCurrent: (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$sites$2f$site$2d$12$2d$rashi$2d$remedies$2f$src$2f$site$2f$lib$2f$destination$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["isCurrentDestination"])(searchDestination, requestPath) ? "page" : undefined,
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                        "data-component-id": "CMP12-SHELL-SEARCH-ENTRY",
                        children: "Search"
                    }, void 0, false, {
                        fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/shell/header/site-header.tsx",
                        lineNumber: 29,
                        columnNumber: 193
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/shell/header/site-header.tsx",
                    lineNumber: 29,
                    columnNumber: 30
                }, this) : null,
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$sites$2f$site$2d$12$2d$rashi$2d$remedies$2f$src$2f$site$2f$shell$2f$navigation$2f$mobile$2d$navigation$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["MobileNavigation"], {
                    items: navigation.header.items,
                    requestPath: requestPath,
                    searchDestination: searchDestination
                }, void 0, false, {
                    fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/shell/header/site-header.tsx",
                    lineNumber: 30,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/shell/header/site-header.tsx",
            lineNumber: 19,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/shell/header/site-header.tsx",
        lineNumber: 18,
        columnNumber: 5
    }, this);
}
}),
"[project]/apps/sites/site-12-rashi-remedies/src/site/shell/navigation/mobile-navigation.tsx [ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "MobileNavigation",
    ()=>MobileNavigation
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react/jsx-dev-runtime [external] (react/jsx-dev-runtime, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react [external] (react, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$sites$2f$site$2d$12$2d$rashi$2d$remedies$2f$src$2f$site$2f$components$2f$destination$2d$link$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/sites/site-12-rashi-remedies/src/site/components/destination-link.tsx [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$sites$2f$site$2d$12$2d$rashi$2d$remedies$2f$src$2f$site$2f$lib$2f$destination$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/sites/site-12-rashi-remedies/src/site/lib/destination.ts [ssr] (ecmascript)");
"use client";
;
;
;
;
function MobileNavigation({ items, requestPath, searchDestination }) {
    const [open, setOpen] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(false);
    const buttonRef = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useRef"])(null);
    const firstLinkRef = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useRef"])(null);
    const panelId = "site-mobile-navigation";
    (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useEffect"])(()=>{
        if (!open) return;
        firstLinkRef.current?.focus();
        const onKeyDown = (event)=>{
            if (event.key === "Escape") {
                event.preventDefault();
                setOpen(false);
                buttonRef.current?.focus();
            }
        };
        document.addEventListener("keydown", onKeyDown);
        return ()=>document.removeEventListener("keydown", onKeyDown);
    }, [
        open
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
        className: "mobile-nav",
        "data-component-id": "CMP12-SHELL-MOBILE-NAV",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                ref: buttonRef,
                type: "button",
                className: "menu-trigger",
                "aria-expanded": open,
                "aria-controls": panelId,
                onClick: ()=>setOpen((value)=>!value),
                children: "Menu"
            }, void 0, false, {
                fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/shell/navigation/mobile-navigation.tsx",
                lineNumber: 30,
                columnNumber: 7
            }, this),
            open ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                id: panelId,
                className: "mobile-nav-panel",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("nav", {
                        "aria-label": "Primary navigation",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("ul", {
                            children: items.map((item, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("li", {
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("a", {
                                        ref: index === 0 ? firstLinkRef : undefined,
                                        href: item.destination.url,
                                        "aria-current": (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$sites$2f$site$2d$12$2d$rashi$2d$remedies$2f$src$2f$site$2f$lib$2f$destination$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["isCurrentDestination"])(item.destination, requestPath) ? "page" : undefined,
                                        children: item.label
                                    }, void 0, false, {
                                        fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/shell/navigation/mobile-navigation.tsx",
                                        lineNumber: 37,
                                        columnNumber: 19
                                    }, this)
                                }, `${item.label}-${item.destination.url}`, false, {
                                    fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/shell/navigation/mobile-navigation.tsx",
                                    lineNumber: 36,
                                    columnNumber: 17
                                }, this))
                        }, void 0, false, {
                            fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/shell/navigation/mobile-navigation.tsx",
                            lineNumber: 34,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/shell/navigation/mobile-navigation.tsx",
                        lineNumber: 33,
                        columnNumber: 11
                    }, this),
                    searchDestination ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$sites$2f$site$2d$12$2d$rashi$2d$remedies$2f$src$2f$site$2f$components$2f$destination$2d$link$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["DestinationLink"], {
                        destination: searchDestination,
                        className: "mobile-search-link",
                        children: "Search"
                    }, void 0, false, {
                        fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/shell/navigation/mobile-navigation.tsx",
                        lineNumber: 42,
                        columnNumber: 32
                    }, this) : null
                ]
            }, void 0, true, {
                fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/shell/navigation/mobile-navigation.tsx",
                lineNumber: 32,
                columnNumber: 9
            }, this) : null
        ]
    }, void 0, true, {
        fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/shell/navigation/mobile-navigation.tsx",
        lineNumber: 29,
        columnNumber: 5
    }, this);
}
}),
"[project]/apps/sites/site-12-rashi-remedies/src/site/shell/navigation/site-shell.tsx [ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "SiteShell",
    ()=>SiteShell
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react/jsx-dev-runtime [external] (react/jsx-dev-runtime, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$sites$2f$site$2d$12$2d$rashi$2d$remedies$2f$src$2f$site$2f$shell$2f$header$2f$site$2d$header$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/sites/site-12-rashi-remedies/src/site/shell/header/site-header.tsx [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$sites$2f$site$2d$12$2d$rashi$2d$remedies$2f$src$2f$site$2f$shell$2f$footer$2f$site$2d$footer$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/sites/site-12-rashi-remedies/src/site/shell/footer/site-footer.tsx [ssr] (ecmascript)");
;
;
;
function SiteShell({ site, navigation, settings, requestPath, children }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("a", {
                href: "#main-content",
                className: "skip-link",
                "data-component-id": "CMP12-SHELL-SKIP",
                children: "Skip to main content"
            }, void 0, false, {
                fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/shell/navigation/site-shell.tsx",
                lineNumber: 7,
                columnNumber: 12
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$sites$2f$site$2d$12$2d$rashi$2d$remedies$2f$src$2f$site$2f$shell$2f$header$2f$site$2d$header$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["SiteHeader"], {
                site: site,
                navigation: navigation,
                requestPath: requestPath
            }, void 0, false, {
                fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/shell/navigation/site-shell.tsx",
                lineNumber: 7,
                columnNumber: 119
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("main", {
                id: "main-content",
                tabIndex: -1,
                children: children
            }, void 0, false, {
                fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/shell/navigation/site-shell.tsx",
                lineNumber: 7,
                columnNumber: 195
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$sites$2f$site$2d$12$2d$rashi$2d$remedies$2f$src$2f$site$2f$shell$2f$footer$2f$site$2d$footer$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["SiteFooter"], {
                site: site,
                navigation: navigation,
                settings: settings
            }, void 0, false, {
                fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/shell/navigation/site-shell.tsx",
                lineNumber: 7,
                columnNumber: 250
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/sites/site-12-rashi-remedies/src/site/shell/navigation/site-shell.tsx",
        lineNumber: 7,
        columnNumber: 10
    }, this);
}
}),
"[project]/apps/sites/site-12-rashi-remedies/src/site/tests/fixtures/fixture-resolver.ts [ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "resolveFixture",
    ()=>resolveFixture,
    "resolvePreviewFixture",
    ()=>resolvePreviewFixture
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$sites$2f$site$2d$12$2d$rashi$2d$remedies$2f$src$2f$site$2f$tests$2f$fixtures$2f$public$2d$pages$2e$json$2e5b$json$5d2e$cjs__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/sites/site-12-rashi-remedies/src/site/tests/fixtures/public-pages.json.[json].cjs [ssr] (ecmascript)");
;
const pages = __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$sites$2f$site$2d$12$2d$rashi$2d$remedies$2f$src$2f$site$2f$tests$2f$fixtures$2f$public$2d$pages$2e$json$2e5b$json$5d2e$cjs__$5b$ssr$5d$__$28$ecmascript$29$__["default"].pages;
const redirects = __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$sites$2f$site$2d$12$2d$rashi$2d$remedies$2f$src$2f$site$2f$tests$2f$fixtures$2f$public$2d$pages$2e$json$2e5b$json$5d2e$cjs__$5b$ssr$5d$__$28$ecmascript$29$__["default"].redirects;
function resolveFixture(host, path, query, page) {
    const normalized = host.toLowerCase().split(":")[0];
    const expected = __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$sites$2f$site$2d$12$2d$rashi$2d$remedies$2f$src$2f$site$2f$tests$2f$fixtures$2f$public$2d$pages$2e$json$2e5b$json$5d2e$cjs__$5b$ssr$5d$__$28$ecmascript$29$__["default"].canonical_domain.toLowerCase();
    // DOC-09: no alias is implicit. A www host is not accepted unless an explicit active alias exists upstream.
    if (normalized !== expected) return {
        status: 404,
        data: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$sites$2f$site$2d$12$2d$rashi$2d$remedies$2f$src$2f$site$2f$tests$2f$fixtures$2f$public$2d$pages$2e$json$2e5b$json$5d2e$cjs__$5b$ssr$5d$__$28$ecmascript$29$__["default"].neutral_not_found
    };
    const redirect = redirects[path];
    if (redirect) return {
        status: 308,
        location: redirect
    };
    if (path === "/article/gone-example") return {
        status: 410,
        data: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$sites$2f$site$2d$12$2d$rashi$2d$remedies$2f$src$2f$site$2f$tests$2f$fixtures$2f$public$2d$pages$2e$json$2e5b$json$5d2e$cjs__$5b$ssr$5d$__$28$ecmascript$29$__["default"].gone
    };
    if (path === "/search") {
        const raw = pages["/search"];
        if (!raw) return {
            status: 404,
            data: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$sites$2f$site$2d$12$2d$rashi$2d$remedies$2f$src$2f$site$2f$tests$2f$fixtures$2f$public$2d$pages$2e$json$2e5b$json$5d2e$cjs__$5b$ssr$5d$__$28$ecmascript$29$__["default"].not_found
        };
        const base = structuredClone(raw);
        base.query = query ?? "";
        if (!query) {
            base.search_state = "NO_QUERY";
            base.articles = [];
            base.result_summary = "Enter a query to search this site";
            delete base.pagination;
        } else if (query.toLowerCase() === "none") {
            base.search_state = "EMPTY";
            base.articles = [];
            base.result_summary = `0 results for ${query}`;
            delete base.pagination;
        }
        if (page > 1) base.result_summary = `${base.result_summary} - page ${page}`;
        return {
            status: 200,
            data: base
        };
    }
    const pageData = pages[path];
    if (pageData) return {
        status: 200,
        data: pageData
    };
    return {
        status: 404,
        data: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$sites$2f$site$2d$12$2d$rashi$2d$remedies$2f$src$2f$site$2f$tests$2f$fixtures$2f$public$2d$pages$2e$json$2e5b$json$5d2e$cjs__$5b$ssr$5d$__$28$ecmascript$29$__["default"].not_found
    };
}
function resolvePreviewFixture(host) {
    const normalized = host.toLowerCase().split(":")[0];
    if (normalized !== __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$sites$2f$site$2d$12$2d$rashi$2d$remedies$2f$src$2f$site$2f$tests$2f$fixtures$2f$public$2d$pages$2e$json$2e5b$json$5d2e$cjs__$5b$ssr$5d$__$28$ecmascript$29$__["default"].canonical_domain.toLowerCase()) return {
        status: 404,
        data: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$sites$2f$site$2d$12$2d$rashi$2d$remedies$2f$src$2f$site$2f$tests$2f$fixtures$2f$public$2d$pages$2e$json$2e5b$json$5d2e$cjs__$5b$ssr$5d$__$28$ecmascript$29$__["default"].neutral_not_found
    };
    return {
        status: 200,
        data: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$sites$2f$site$2d$12$2d$rashi$2d$remedies$2f$src$2f$site$2f$tests$2f$fixtures$2f$public$2d$pages$2e$json$2e5b$json$5d2e$cjs__$5b$ssr$5d$__$28$ecmascript$29$__["default"].preview
    };
}
}),
"[project]/apps/sites/site-12-rashi-remedies/src/site/tests/fixtures/public-pages.json.[json].cjs [ssr] (ecmascript)", ((__turbopack_context__, module, exports) => {

module.exports = JSON.parse("{\"site_key\":\"SITE-12\",\"canonical_domain\":\"RashiRemedies.com\",\"same_slug\":\"shared-slug\",\"pages\":{\"/\":{\"context\":{\"page_id\":\"PUB-HOME-01\",\"page_kind\":\"CONTENT\",\"render_mode\":\"PUBLIC\",\"locale_code\":\"en-IN\"},\"site\":{\"site_key\":\"SITE-12\",\"display_name\":\"RashiRemedies\",\"canonical_domain\":\"RashiRemedies.com\",\"home_destination\":{\"kind\":\"HOME\",\"url\":\"https://rashiremedies.com/\",\"is_external\":false,\"page_id\":\"PUB-HOME-01\"},\"default_language\":\"en\",\"locale_code\":\"en-IN\",\"timezone_id\":\"Asia/Kolkata\"},\"settings\":{\"copyright_text\":\"2026 RashiRemedies. Editorial information only.\",\"social_profiles\":[]},\"navigation\":{\"header\":{\"menu_key\":\"HEADER\",\"items\":[{\"label\":\"Home\",\"destination\":{\"kind\":\"HOME\",\"url\":\"https://rashiremedies.com/\",\"is_external\":false,\"page_id\":\"PUB-HOME-01\"},\"children\":[]},{\"label\":\"Remedy guidance\",\"destination\":{\"kind\":\"CATEGORY\",\"url\":\"https://rashiremedies.com/category/remedy-guidance\",\"is_external\":false,\"page_id\":\"PUB-CATEGORY-01\"},\"children\":[]},{\"label\":\"Traditional remedy\",\"destination\":{\"kind\":\"TAG\",\"url\":\"https://rashiremedies.com/tag/traditional-remedy\",\"is_external\":false,\"page_id\":\"PUB-TAG-01\"},\"children\":[]},{\"label\":\"About\",\"destination\":{\"kind\":\"STATIC\",\"url\":\"https://rashiremedies.com/about\",\"is_external\":false,\"page_id\":\"PUB-STATIC-ABOUT-01\"},\"children\":[]},{\"label\":\"Search\",\"destination\":{\"kind\":\"SEARCH\",\"url\":\"https://RashiRemedies.com/search\",\"is_external\":false,\"page_id\":\"PUB-SEARCH-01\"},\"children\":[]}]},\"footer\":{\"menu_key\":\"FOOTER\",\"items\":[{\"label\":\"About\",\"destination\":{\"kind\":\"STATIC\",\"url\":\"https://rashiremedies.com/about\",\"is_external\":false,\"page_id\":\"PUB-STATIC-ABOUT-01\"},\"children\":[]},{\"label\":\"Contact\",\"destination\":{\"kind\":\"STATIC\",\"url\":\"https://rashiremedies.com/contact\",\"is_external\":false,\"page_id\":\"PUB-STATIC-CONTACT-01\"},\"children\":[]},{\"label\":\"Privacy Policy\",\"destination\":{\"kind\":\"STATIC\",\"url\":\"https://rashiremedies.com/privacy-policy\",\"is_external\":false,\"page_id\":\"PUB-STATIC-PRIVACY-01\"},\"children\":[]},{\"label\":\"Terms of Use\",\"destination\":{\"kind\":\"STATIC\",\"url\":\"https://rashiremedies.com/terms-of-use\",\"is_external\":false,\"page_id\":\"PUB-STATIC-TERMS-01\"},\"children\":[]},{\"label\":\"Disclaimer\",\"destination\":{\"kind\":\"STATIC\",\"url\":\"https://rashiremedies.com/disclaimer\",\"is_external\":false,\"page_id\":\"PUB-STATIC-DISCLAIMER-01\"},\"children\":[]}]}},\"intro\":{\"h1\":\"What does your Remedy tell you? - RashiRemedies\",\"intro_text\":\"Explore clear, site-scoped Remedy knowledge without cross-site personalization.\"},\"lead_article\":{\"article_id\":\"site-12-article-shared\",\"destination\":{\"kind\":\"ARTICLE\",\"url\":\"https://rashiremedies.com/article/shared-slug\",\"is_external\":false,\"page_id\":\"PUB-ARTICLE-01\"},\"title\":\"RashiRemedies: Understanding your Remedy step by step\",\"excerpt\":\"A practical introduction to Remedy concepts, written for clear editorial reading.\",\"featured_media\":{\"media_id\":\"site-12-media-hero\",\"url\":\"https://cdn.example.invalid/site-01/hero-1200.webp\",\"mime_type\":\"image/webp\",\"width\":1200,\"height\":900,\"alt_text\":\"RashiRemedies editorial Traditional remedy editorial illustration\",\"variants\":[{\"variant_key\":\"card-480-webp\",\"url\":\"https://cdn.example.invalid/site-01/hero-480.webp\",\"mime_type\":\"image/webp\",\"width\":480,\"height\":360},{\"variant_key\":\"card-800-webp\",\"url\":\"https://cdn.example.invalid/site-01/hero-800.webp\",\"mime_type\":\"image/webp\",\"width\":800,\"height\":600},{\"variant_key\":\"card-1200-avif\",\"url\":\"https://cdn.example.invalid/site-01/hero-1200.avif\",\"mime_type\":\"image/avif\",\"width\":1200,\"height\":900}],\"credit_text\":\"Fixture artwork\"},\"author\":{\"author_id\":\"site-12-author-1\",\"display_name\":\"Editorial Desk\",\"destination\":{\"kind\":\"AUTHOR\",\"url\":\"https://rashiremedies.com/author/editorial-desk\",\"is_external\":false,\"page_id\":\"PUB-AUTHOR-01\"},\"short_bio\":\"Astrology education editor focused on clear, source-aware explanations.\"},\"published_at\":\"2026-09-12T06:30:00Z\",\"taxonomy_label\":\"Remedy guidance\"},\"sections\":[{\"section_key\":\"featured-rashi\",\"section_kind\":\"POST_SELECTION\",\"label\":\"Start with the essentials\",\"posts\":[{\"article_id\":\"site-12-article-shared\",\"destination\":{\"kind\":\"ARTICLE\",\"url\":\"https://rashiremedies.com/article/shared-slug\",\"is_external\":false,\"page_id\":\"PUB-ARTICLE-01\"},\"title\":\"RashiRemedies: Understanding your Remedy step by step\",\"excerpt\":\"A practical introduction to Remedy concepts, written for clear editorial reading.\",\"featured_media\":{\"media_id\":\"site-12-media-hero\",\"url\":\"https://cdn.example.invalid/site-01/hero-1200.webp\",\"mime_type\":\"image/webp\",\"width\":1200,\"height\":900,\"alt_text\":\"RashiRemedies editorial Traditional remedy editorial illustration\",\"variants\":[{\"variant_key\":\"card-480-webp\",\"url\":\"https://cdn.example.invalid/site-01/hero-480.webp\",\"mime_type\":\"image/webp\",\"width\":480,\"height\":360},{\"variant_key\":\"card-800-webp\",\"url\":\"https://cdn.example.invalid/site-01/hero-800.webp\",\"mime_type\":\"image/webp\",\"width\":800,\"height\":600},{\"variant_key\":\"card-1200-avif\",\"url\":\"https://cdn.example.invalid/site-01/hero-1200.avif\",\"mime_type\":\"image/avif\",\"width\":1200,\"height\":900}],\"credit_text\":\"Fixture artwork\"},\"author\":{\"author_id\":\"site-12-author-1\",\"display_name\":\"Editorial Desk\",\"destination\":{\"kind\":\"AUTHOR\",\"url\":\"https://rashiremedies.com/author/editorial-desk\",\"is_external\":false,\"page_id\":\"PUB-AUTHOR-01\"},\"short_bio\":\"Astrology education editor focused on clear, source-aware explanations.\"},\"published_at\":\"2026-09-12T06:30:00Z\",\"taxonomy_label\":\"Remedy guidance\"},{\"article_id\":\"site-12-article-moon\",\"destination\":{\"kind\":\"ARTICLE\",\"url\":\"https://rashiremedies.com/article/traditional-remedy-guide\",\"is_external\":false,\"page_id\":\"PUB-ARTICLE-01\"},\"title\":\"RashiRemedies: Traditional remedy reference guide\",\"excerpt\":\"How to read Moon-sign context without turning editorial content into a calculator.\",\"author\":{\"author_id\":\"site-12-author-1\",\"display_name\":\"Editorial Desk\",\"destination\":{\"kind\":\"AUTHOR\",\"url\":\"https://rashiremedies.com/author/editorial-desk\",\"is_external\":false,\"page_id\":\"PUB-AUTHOR-01\"},\"short_bio\":\"Astrology education editor focused on clear, source-aware explanations.\"},\"published_at\":\"2026-09-11T05:00:00Z\",\"taxonomy_label\":\"Traditional remedy\"}]},{\"section_key\":\"featured-categories\",\"section_kind\":\"CATEGORY_SELECTION\",\"label\":\"Browse by topic\",\"categories\":[{\"kind\":\"CATEGORY\",\"name\":\"Remedy guidance\",\"destination\":{\"kind\":\"CATEGORY\",\"url\":\"https://rashiremedies.com/category/remedy-guidance\",\"is_external\":false,\"page_id\":\"PUB-CATEGORY-01\"}},{\"kind\":\"TAG\",\"name\":\"Traditional remedy\",\"destination\":{\"kind\":\"TAG\",\"url\":\"https://rashiremedies.com/tag/traditional-remedy\",\"is_external\":false,\"page_id\":\"PUB-TAG-01\"}}]}],\"latest_articles\":[{\"article_id\":\"site-12-article-shared\",\"destination\":{\"kind\":\"ARTICLE\",\"url\":\"https://rashiremedies.com/article/shared-slug\",\"is_external\":false,\"page_id\":\"PUB-ARTICLE-01\"},\"title\":\"RashiRemedies: Understanding your Remedy step by step\",\"excerpt\":\"A practical introduction to Remedy concepts, written for clear editorial reading.\",\"featured_media\":{\"media_id\":\"site-12-media-hero\",\"url\":\"https://cdn.example.invalid/site-01/hero-1200.webp\",\"mime_type\":\"image/webp\",\"width\":1200,\"height\":900,\"alt_text\":\"RashiRemedies editorial Traditional remedy editorial illustration\",\"variants\":[{\"variant_key\":\"card-480-webp\",\"url\":\"https://cdn.example.invalid/site-01/hero-480.webp\",\"mime_type\":\"image/webp\",\"width\":480,\"height\":360},{\"variant_key\":\"card-800-webp\",\"url\":\"https://cdn.example.invalid/site-01/hero-800.webp\",\"mime_type\":\"image/webp\",\"width\":800,\"height\":600},{\"variant_key\":\"card-1200-avif\",\"url\":\"https://cdn.example.invalid/site-01/hero-1200.avif\",\"mime_type\":\"image/avif\",\"width\":1200,\"height\":900}],\"credit_text\":\"Fixture artwork\"},\"author\":{\"author_id\":\"site-12-author-1\",\"display_name\":\"Editorial Desk\",\"destination\":{\"kind\":\"AUTHOR\",\"url\":\"https://rashiremedies.com/author/editorial-desk\",\"is_external\":false,\"page_id\":\"PUB-AUTHOR-01\"},\"short_bio\":\"Astrology education editor focused on clear, source-aware explanations.\"},\"published_at\":\"2026-09-12T06:30:00Z\",\"taxonomy_label\":\"Remedy guidance\"},{\"article_id\":\"site-12-article-moon\",\"destination\":{\"kind\":\"ARTICLE\",\"url\":\"https://rashiremedies.com/article/traditional-remedy-guide\",\"is_external\":false,\"page_id\":\"PUB-ARTICLE-01\"},\"title\":\"RashiRemedies: Traditional remedy reference guide\",\"excerpt\":\"How to read Moon-sign context without turning editorial content into a calculator.\",\"author\":{\"author_id\":\"site-12-author-1\",\"display_name\":\"Editorial Desk\",\"destination\":{\"kind\":\"AUTHOR\",\"url\":\"https://rashiremedies.com/author/editorial-desk\",\"is_external\":false,\"page_id\":\"PUB-AUTHOR-01\"},\"short_bio\":\"Astrology education editor focused on clear, source-aware explanations.\"},\"published_at\":\"2026-09-11T05:00:00Z\",\"taxonomy_label\":\"Traditional remedy\"}],\"seo\":{\"baseline_indexability\":\"INDEX-ELIGIBLE\",\"title\":\"RashiRemedies | Remedy knowledge\",\"meta_description\":\"Explore Remedy knowledge on RashiRemedies.\",\"canonical_url\":\"https://rashiremedies.com/\",\"open_graph\":{\"title\":\"RashiRemedies | Remedy knowledge\",\"description\":\"Explore Remedy knowledge on RashiRemedies.\",\"url\":\"https://rashiremedies.com/\",\"type\":\"WEBSITE\",\"image\":{\"media_id\":\"site-12-media-hero\",\"url\":\"https://cdn.example.invalid/site-01/hero-1200.webp\",\"mime_type\":\"image/webp\",\"width\":1200,\"height\":900,\"alt_text\":\"RashiRemedies editorial Traditional remedy editorial illustration\",\"variants\":[{\"variant_key\":\"card-480-webp\",\"url\":\"https://cdn.example.invalid/site-01/hero-480.webp\",\"mime_type\":\"image/webp\",\"width\":480,\"height\":360},{\"variant_key\":\"card-800-webp\",\"url\":\"https://cdn.example.invalid/site-01/hero-800.webp\",\"mime_type\":\"image/webp\",\"width\":800,\"height\":600},{\"variant_key\":\"card-1200-avif\",\"url\":\"https://cdn.example.invalid/site-01/hero-1200.avif\",\"mime_type\":\"image/avif\",\"width\":1200,\"height\":900}],\"credit_text\":\"Fixture artwork\"}},\"robots\":{\"index\":true,\"follow\":true},\"structured_data\":[{\"@context\":\"https://schema.org\",\"@type\":\"WebSite\",\"name\":\"RashiRemedies\",\"url\":\"https://rashiremedies.com/\"}]}},\"/article/shared-slug\":{\"context\":{\"page_id\":\"PUB-ARTICLE-01\",\"page_kind\":\"CONTENT\",\"render_mode\":\"PUBLIC\",\"locale_code\":\"en-IN\"},\"site\":{\"site_key\":\"SITE-12\",\"display_name\":\"RashiRemedies\",\"canonical_domain\":\"RashiRemedies.com\",\"home_destination\":{\"kind\":\"HOME\",\"url\":\"https://rashiremedies.com/\",\"is_external\":false,\"page_id\":\"PUB-HOME-01\"},\"default_language\":\"en\",\"locale_code\":\"en-IN\",\"timezone_id\":\"Asia/Kolkata\"},\"settings\":{\"copyright_text\":\"2026 RashiRemedies. Editorial information only.\",\"social_profiles\":[]},\"navigation\":{\"header\":{\"menu_key\":\"HEADER\",\"items\":[{\"label\":\"Home\",\"destination\":{\"kind\":\"HOME\",\"url\":\"https://rashiremedies.com/\",\"is_external\":false,\"page_id\":\"PUB-HOME-01\"},\"children\":[]},{\"label\":\"Remedy guidance\",\"destination\":{\"kind\":\"CATEGORY\",\"url\":\"https://rashiremedies.com/category/remedy-guidance\",\"is_external\":false,\"page_id\":\"PUB-CATEGORY-01\"},\"children\":[]},{\"label\":\"Traditional remedy\",\"destination\":{\"kind\":\"TAG\",\"url\":\"https://rashiremedies.com/tag/traditional-remedy\",\"is_external\":false,\"page_id\":\"PUB-TAG-01\"},\"children\":[]},{\"label\":\"About\",\"destination\":{\"kind\":\"STATIC\",\"url\":\"https://rashiremedies.com/about\",\"is_external\":false,\"page_id\":\"PUB-STATIC-ABOUT-01\"},\"children\":[]},{\"label\":\"Search\",\"destination\":{\"kind\":\"SEARCH\",\"url\":\"https://RashiRemedies.com/search\",\"is_external\":false,\"page_id\":\"PUB-SEARCH-01\"},\"children\":[]}]},\"footer\":{\"menu_key\":\"FOOTER\",\"items\":[{\"label\":\"About\",\"destination\":{\"kind\":\"STATIC\",\"url\":\"https://rashiremedies.com/about\",\"is_external\":false,\"page_id\":\"PUB-STATIC-ABOUT-01\"},\"children\":[]},{\"label\":\"Contact\",\"destination\":{\"kind\":\"STATIC\",\"url\":\"https://rashiremedies.com/contact\",\"is_external\":false,\"page_id\":\"PUB-STATIC-CONTACT-01\"},\"children\":[]},{\"label\":\"Privacy Policy\",\"destination\":{\"kind\":\"STATIC\",\"url\":\"https://rashiremedies.com/privacy-policy\",\"is_external\":false,\"page_id\":\"PUB-STATIC-PRIVACY-01\"},\"children\":[]},{\"label\":\"Terms of Use\",\"destination\":{\"kind\":\"STATIC\",\"url\":\"https://rashiremedies.com/terms-of-use\",\"is_external\":false,\"page_id\":\"PUB-STATIC-TERMS-01\"},\"children\":[]},{\"label\":\"Disclaimer\",\"destination\":{\"kind\":\"STATIC\",\"url\":\"https://rashiremedies.com/disclaimer\",\"is_external\":false,\"page_id\":\"PUB-STATIC-DISCLAIMER-01\"},\"children\":[]}]}},\"breadcrumbs\":{\"items\":[{\"label\":\"Home\",\"destination\":{\"kind\":\"HOME\",\"url\":\"https://rashiremedies.com/\",\"is_external\":false,\"page_id\":\"PUB-HOME-01\"},\"is_current\":false},{\"label\":\"RashiRemedies: Understanding your Remedy step by step\",\"is_current\":true}]},\"article\":{\"article_id\":\"site-12-article-shared\",\"destination\":{\"kind\":\"ARTICLE\",\"url\":\"https://rashiremedies.com/article/shared-slug\",\"is_external\":false,\"page_id\":\"PUB-ARTICLE-01\"},\"title\":\"RashiRemedies: Understanding your Remedy step by step\",\"excerpt\":\"A practical introduction to Remedy concepts, written for clear editorial reading.\",\"body\":{\"content_schema_version\":\"1.0\",\"blocks\":[{\"block_id\":\"b1\",\"type\":\"PARAGRAPH\",\"payload\":{\"content\":{\"runs\":[{\"text\":\"Remedy is a structured editorial topic here; this paragraph is deterministic fixture content.\",\"marks\":[]}]}}},{\"block_id\":\"b2\",\"type\":\"HEADING\",\"payload\":{\"level\":2,\"content\":{\"runs\":[{\"text\":\"A clear starting point\",\"marks\":[]}]}}},{\"block_id\":\"b3\",\"type\":\"LIST\",\"payload\":{\"style\":\"UNORDERED\",\"items\":[{\"runs\":[{\"text\":\"Read the supplied PageData in order.\",\"marks\":[]}]},{\"runs\":[{\"text\":\"Keep site context isolated.\",\"marks\":[]}]}]}},{\"block_id\":\"b4\",\"type\":\"QUOTE\",\"payload\":{\"quote\":{\"runs\":[{\"text\":\"Clarity is more useful than decorative certainty.\",\"marks\":[]}]},\"attribution\":\"Editorial Desk\",\"source\":\"Fixture note\"}},{\"block_id\":\"b5\",\"type\":\"SEPARATOR\",\"payload\":{}},{\"block_id\":\"b6\",\"type\":\"MEDIA\",\"payload\":{\"resolution_state\":\"READY\",\"media\":{\"media_id\":\"site-12-media-hero\",\"url\":\"https://cdn.example.invalid/site-01/hero-1200.webp\",\"mime_type\":\"image/webp\",\"width\":1200,\"height\":900,\"alt_text\":\"RashiRemedies editorial Traditional remedy editorial illustration\",\"variants\":[{\"variant_key\":\"card-480-webp\",\"url\":\"https://cdn.example.invalid/site-01/hero-480.webp\",\"mime_type\":\"image/webp\",\"width\":480,\"height\":360},{\"variant_key\":\"card-800-webp\",\"url\":\"https://cdn.example.invalid/site-01/hero-800.webp\",\"mime_type\":\"image/webp\",\"width\":800,\"height\":600},{\"variant_key\":\"card-1200-avif\",\"url\":\"https://cdn.example.invalid/site-01/hero-1200.avif\",\"mime_type\":\"image/avif\",\"width\":1200,\"height\":900}],\"credit_text\":\"Fixture artwork\"},\"alt_override\":\"RashiRemedies Remedy diagram\",\"caption\":\"Fixture media using public CDN-style variants.\"}},{\"block_id\":\"b7\",\"type\":\"TABLE\",\"payload\":{\"header_row\":true,\"rows\":[[{\"runs\":[{\"text\":\"Reading cue\",\"marks\":[]}]},{\"runs\":[{\"text\":\"Meaning\",\"marks\":[]}]}],[{\"runs\":[{\"text\":\"Order\",\"marks\":[]}]},{\"runs\":[{\"text\":\"Preserve server order\",\"marks\":[]}]}],[{\"runs\":[{\"text\":\"Scope\",\"marks\":[]}]},{\"runs\":[{\"text\":\"One trusted site\",\"marks\":[]}]}]]}},{\"block_id\":\"b8\",\"type\":\"EMBED\",\"payload\":{\"provider_key\":\"approved-video-provider\",\"source_url_or_id\":\"https://example.invalid/editorial-reference\",\"caption\":\"Safe textual fallback when provider playback is unavailable.\"}},{\"block_id\":\"b9\",\"type\":\"CALLOUT\",\"payload\":{\"label\":\"Remember\",\"body\":{\"runs\":[{\"text\":\"Presentation can differ by site; semantic contracts do not.\",\"marks\":[]}]}}},{\"block_id\":\"b10\",\"type\":\"CTA\",\"payload\":{\"label\":\"Browse Remedy guidance\",\"supporting_text\":\"Continue with the same-site category archive.\",\"destination\":{\"kind\":\"CATEGORY\",\"url\":\"https://rashiremedies.com/category/remedy-guidance\",\"is_external\":false,\"page_id\":\"PUB-CATEGORY-01\"}}},{\"block_id\":\"b11\",\"type\":\"DISCLAIMER\",\"payload\":{\"label\":\"Editorial disclaimer\",\"body\":{\"runs\":[{\"text\":\"This fixture demonstrates layout behavior and is not personalized astrological advice.\",\"marks\":[]}]}}},{\"block_id\":\"b12\",\"type\":\"SOURCES_REFERENCES\",\"payload\":{\"entries\":[{\"title\":\"Fixture source reference\",\"url\":\"https://example.invalid/reference\",\"publisher\":\"Documentation fixture\",\"note\":\"Used only for CHAT07 UI verification.\"}]}}]},\"featured_media\":{\"media_id\":\"site-12-media-hero\",\"url\":\"https://cdn.example.invalid/site-01/hero-1200.webp\",\"mime_type\":\"image/webp\",\"width\":1200,\"height\":900,\"alt_text\":\"RashiRemedies editorial Traditional remedy editorial illustration\",\"variants\":[{\"variant_key\":\"card-480-webp\",\"url\":\"https://cdn.example.invalid/site-01/hero-480.webp\",\"mime_type\":\"image/webp\",\"width\":480,\"height\":360},{\"variant_key\":\"card-800-webp\",\"url\":\"https://cdn.example.invalid/site-01/hero-800.webp\",\"mime_type\":\"image/webp\",\"width\":800,\"height\":600},{\"variant_key\":\"card-1200-avif\",\"url\":\"https://cdn.example.invalid/site-01/hero-1200.avif\",\"mime_type\":\"image/avif\",\"width\":1200,\"height\":900}],\"credit_text\":\"Fixture artwork\"},\"author\":{\"author_id\":\"site-12-author-1\",\"display_name\":\"Editorial Desk\",\"destination\":{\"kind\":\"AUTHOR\",\"url\":\"https://rashiremedies.com/author/editorial-desk\",\"is_external\":false,\"page_id\":\"PUB-AUTHOR-01\"},\"short_bio\":\"Astrology education editor focused on clear, source-aware explanations.\"},\"categories\":[{\"kind\":\"CATEGORY\",\"name\":\"Remedy guidance\",\"destination\":{\"kind\":\"CATEGORY\",\"url\":\"https://rashiremedies.com/category/remedy-guidance\",\"is_external\":false,\"page_id\":\"PUB-CATEGORY-01\"}}],\"tags\":[{\"kind\":\"TAG\",\"name\":\"Traditional remedy\",\"destination\":{\"kind\":\"TAG\",\"url\":\"https://rashiremedies.com/tag/traditional-remedy\",\"is_external\":false,\"page_id\":\"PUB-TAG-01\"}}],\"published_at\":\"2026-09-12T06:30:00Z\",\"updated_at\":\"2026-09-12T07:00:00Z\"},\"related_content\":{\"articles\":[{\"article_id\":\"site-12-article-moon\",\"destination\":{\"kind\":\"ARTICLE\",\"url\":\"https://rashiremedies.com/article/traditional-remedy-guide\",\"is_external\":false,\"page_id\":\"PUB-ARTICLE-01\"},\"title\":\"RashiRemedies: Traditional remedy reference guide\",\"excerpt\":\"How to read Moon-sign context without turning editorial content into a calculator.\",\"author\":{\"author_id\":\"site-12-author-1\",\"display_name\":\"Editorial Desk\",\"destination\":{\"kind\":\"AUTHOR\",\"url\":\"https://rashiremedies.com/author/editorial-desk\",\"is_external\":false,\"page_id\":\"PUB-AUTHOR-01\"},\"short_bio\":\"Astrology education editor focused on clear, source-aware explanations.\"},\"published_at\":\"2026-09-11T05:00:00Z\",\"taxonomy_label\":\"Traditional remedy\"}]},\"seo\":{\"baseline_indexability\":\"INDEX-ELIGIBLE\",\"title\":\"RashiRemedies: Understanding your Remedy step by step\",\"meta_description\":\"A practical introduction to Remedy concepts, written for clear editorial reading.\",\"canonical_url\":\"https://rashiremedies.com/article/shared-slug\",\"open_graph\":{\"title\":\"RashiRemedies: Understanding your Remedy step by step\",\"description\":\"A practical introduction to Remedy concepts, written for clear editorial reading.\",\"url\":\"https://rashiremedies.com/article/shared-slug\",\"type\":\"ARTICLE\",\"image\":{\"media_id\":\"site-12-media-hero\",\"url\":\"https://cdn.example.invalid/site-01/hero-1200.webp\",\"mime_type\":\"image/webp\",\"width\":1200,\"height\":900,\"alt_text\":\"RashiRemedies editorial Traditional remedy editorial illustration\",\"variants\":[{\"variant_key\":\"card-480-webp\",\"url\":\"https://cdn.example.invalid/site-01/hero-480.webp\",\"mime_type\":\"image/webp\",\"width\":480,\"height\":360},{\"variant_key\":\"card-800-webp\",\"url\":\"https://cdn.example.invalid/site-01/hero-800.webp\",\"mime_type\":\"image/webp\",\"width\":800,\"height\":600},{\"variant_key\":\"card-1200-avif\",\"url\":\"https://cdn.example.invalid/site-01/hero-1200.avif\",\"mime_type\":\"image/avif\",\"width\":1200,\"height\":900}],\"credit_text\":\"Fixture artwork\"}},\"robots\":{\"index\":true,\"follow\":true},\"structured_data\":[{\"@context\":\"https://schema.org\",\"@type\":\"Article\",\"headline\":\"RashiRemedies: Understanding your Remedy step by step\",\"mainEntityOfPage\":\"https://rashiremedies.com/article/shared-slug\"}]}},\"/category/remedy-guidance\":{\"context\":{\"page_id\":\"PUB-CATEGORY-01\",\"page_kind\":\"CONTENT\",\"render_mode\":\"PUBLIC\",\"locale_code\":\"en-IN\"},\"site\":{\"site_key\":\"SITE-12\",\"display_name\":\"RashiRemedies\",\"canonical_domain\":\"RashiRemedies.com\",\"home_destination\":{\"kind\":\"HOME\",\"url\":\"https://rashiremedies.com/\",\"is_external\":false,\"page_id\":\"PUB-HOME-01\"},\"default_language\":\"en\",\"locale_code\":\"en-IN\",\"timezone_id\":\"Asia/Kolkata\"},\"settings\":{\"copyright_text\":\"2026 RashiRemedies. Editorial information only.\",\"social_profiles\":[]},\"navigation\":{\"header\":{\"menu_key\":\"HEADER\",\"items\":[{\"label\":\"Home\",\"destination\":{\"kind\":\"HOME\",\"url\":\"https://rashiremedies.com/\",\"is_external\":false,\"page_id\":\"PUB-HOME-01\"},\"children\":[]},{\"label\":\"Remedy guidance\",\"destination\":{\"kind\":\"CATEGORY\",\"url\":\"https://rashiremedies.com/category/remedy-guidance\",\"is_external\":false,\"page_id\":\"PUB-CATEGORY-01\"},\"children\":[]},{\"label\":\"Traditional remedy\",\"destination\":{\"kind\":\"TAG\",\"url\":\"https://rashiremedies.com/tag/traditional-remedy\",\"is_external\":false,\"page_id\":\"PUB-TAG-01\"},\"children\":[]},{\"label\":\"About\",\"destination\":{\"kind\":\"STATIC\",\"url\":\"https://rashiremedies.com/about\",\"is_external\":false,\"page_id\":\"PUB-STATIC-ABOUT-01\"},\"children\":[]},{\"label\":\"Search\",\"destination\":{\"kind\":\"SEARCH\",\"url\":\"https://RashiRemedies.com/search\",\"is_external\":false,\"page_id\":\"PUB-SEARCH-01\"},\"children\":[]}]},\"footer\":{\"menu_key\":\"FOOTER\",\"items\":[{\"label\":\"About\",\"destination\":{\"kind\":\"STATIC\",\"url\":\"https://rashiremedies.com/about\",\"is_external\":false,\"page_id\":\"PUB-STATIC-ABOUT-01\"},\"children\":[]},{\"label\":\"Contact\",\"destination\":{\"kind\":\"STATIC\",\"url\":\"https://rashiremedies.com/contact\",\"is_external\":false,\"page_id\":\"PUB-STATIC-CONTACT-01\"},\"children\":[]},{\"label\":\"Privacy Policy\",\"destination\":{\"kind\":\"STATIC\",\"url\":\"https://rashiremedies.com/privacy-policy\",\"is_external\":false,\"page_id\":\"PUB-STATIC-PRIVACY-01\"},\"children\":[]},{\"label\":\"Terms of Use\",\"destination\":{\"kind\":\"STATIC\",\"url\":\"https://rashiremedies.com/terms-of-use\",\"is_external\":false,\"page_id\":\"PUB-STATIC-TERMS-01\"},\"children\":[]},{\"label\":\"Disclaimer\",\"destination\":{\"kind\":\"STATIC\",\"url\":\"https://rashiremedies.com/disclaimer\",\"is_external\":false,\"page_id\":\"PUB-STATIC-DISCLAIMER-01\"},\"children\":[]}]}},\"breadcrumbs\":{\"items\":[{\"label\":\"Home\",\"destination\":{\"kind\":\"HOME\",\"url\":\"https://rashiremedies.com/\",\"is_external\":false,\"page_id\":\"PUB-HOME-01\"},\"is_current\":false},{\"label\":\"Remedy guidance\",\"is_current\":true}]},\"category\":{\"category_id\":\"site-12-cat-1\",\"name\":\"Remedy guidance\",\"description\":\"Foundational Remedy articles for this site.\",\"destination\":{\"kind\":\"CATEGORY\",\"url\":\"https://rashiremedies.com/category/remedy-guidance\",\"is_external\":false,\"page_id\":\"PUB-CATEGORY-01\"}},\"articles\":[{\"article_id\":\"site-12-article-shared\",\"destination\":{\"kind\":\"ARTICLE\",\"url\":\"https://rashiremedies.com/article/shared-slug\",\"is_external\":false,\"page_id\":\"PUB-ARTICLE-01\"},\"title\":\"RashiRemedies: Understanding your Remedy step by step\",\"excerpt\":\"A practical introduction to Remedy concepts, written for clear editorial reading.\",\"featured_media\":{\"media_id\":\"site-12-media-hero\",\"url\":\"https://cdn.example.invalid/site-01/hero-1200.webp\",\"mime_type\":\"image/webp\",\"width\":1200,\"height\":900,\"alt_text\":\"RashiRemedies editorial Traditional remedy editorial illustration\",\"variants\":[{\"variant_key\":\"card-480-webp\",\"url\":\"https://cdn.example.invalid/site-01/hero-480.webp\",\"mime_type\":\"image/webp\",\"width\":480,\"height\":360},{\"variant_key\":\"card-800-webp\",\"url\":\"https://cdn.example.invalid/site-01/hero-800.webp\",\"mime_type\":\"image/webp\",\"width\":800,\"height\":600},{\"variant_key\":\"card-1200-avif\",\"url\":\"https://cdn.example.invalid/site-01/hero-1200.avif\",\"mime_type\":\"image/avif\",\"width\":1200,\"height\":900}],\"credit_text\":\"Fixture artwork\"},\"author\":{\"author_id\":\"site-12-author-1\",\"display_name\":\"Editorial Desk\",\"destination\":{\"kind\":\"AUTHOR\",\"url\":\"https://rashiremedies.com/author/editorial-desk\",\"is_external\":false,\"page_id\":\"PUB-AUTHOR-01\"},\"short_bio\":\"Astrology education editor focused on clear, source-aware explanations.\"},\"published_at\":\"2026-09-12T06:30:00Z\",\"taxonomy_label\":\"Remedy guidance\"},{\"article_id\":\"site-12-article-moon\",\"destination\":{\"kind\":\"ARTICLE\",\"url\":\"https://rashiremedies.com/article/traditional-remedy-guide\",\"is_external\":false,\"page_id\":\"PUB-ARTICLE-01\"},\"title\":\"RashiRemedies: Traditional remedy reference guide\",\"excerpt\":\"How to read Moon-sign context without turning editorial content into a calculator.\",\"author\":{\"author_id\":\"site-12-author-1\",\"display_name\":\"Editorial Desk\",\"destination\":{\"kind\":\"AUTHOR\",\"url\":\"https://rashiremedies.com/author/editorial-desk\",\"is_external\":false,\"page_id\":\"PUB-AUTHOR-01\"},\"short_bio\":\"Astrology education editor focused on clear, source-aware explanations.\"},\"published_at\":\"2026-09-11T05:00:00Z\",\"taxonomy_label\":\"Traditional remedy\"}],\"pagination\":{\"current_page\":1,\"links\":[{\"page_number\":1,\"destination\":{\"kind\":\"CATEGORY\",\"url\":\"https://rashiremedies.com/category/remedy-guidance\",\"is_external\":false,\"page_id\":\"PUB-CATEGORY-01\"},\"is_current\":true},{\"page_number\":2,\"destination\":{\"kind\":\"CATEGORY\",\"url\":\"https://rashiremedies.com/category/remedy-guidance?page=2\",\"is_external\":false,\"page_id\":\"PUB-CATEGORY-01\"},\"is_current\":false}],\"next\":{\"kind\":\"CATEGORY\",\"url\":\"https://rashiremedies.com/category/remedy-guidance?page=2\",\"is_external\":false,\"page_id\":\"PUB-CATEGORY-01\"}},\"seo\":{\"baseline_indexability\":\"CONDITIONAL-INDEX\",\"title\":\"Remedy guidance | RashiRemedies\",\"canonical_url\":\"https://rashiremedies.com/category/remedy-guidance\",\"robots\":{\"index\":true,\"follow\":true},\"structured_data\":[]}},\"/tag/traditional-remedy\":{\"context\":{\"page_id\":\"PUB-TAG-01\",\"page_kind\":\"CONTENT\",\"render_mode\":\"PUBLIC\",\"locale_code\":\"en-IN\"},\"site\":{\"site_key\":\"SITE-12\",\"display_name\":\"RashiRemedies\",\"canonical_domain\":\"RashiRemedies.com\",\"home_destination\":{\"kind\":\"HOME\",\"url\":\"https://rashiremedies.com/\",\"is_external\":false,\"page_id\":\"PUB-HOME-01\"},\"default_language\":\"en\",\"locale_code\":\"en-IN\",\"timezone_id\":\"Asia/Kolkata\"},\"settings\":{\"copyright_text\":\"2026 RashiRemedies. Editorial information only.\",\"social_profiles\":[]},\"navigation\":{\"header\":{\"menu_key\":\"HEADER\",\"items\":[{\"label\":\"Home\",\"destination\":{\"kind\":\"HOME\",\"url\":\"https://rashiremedies.com/\",\"is_external\":false,\"page_id\":\"PUB-HOME-01\"},\"children\":[]},{\"label\":\"Remedy guidance\",\"destination\":{\"kind\":\"CATEGORY\",\"url\":\"https://rashiremedies.com/category/remedy-guidance\",\"is_external\":false,\"page_id\":\"PUB-CATEGORY-01\"},\"children\":[]},{\"label\":\"Traditional remedy\",\"destination\":{\"kind\":\"TAG\",\"url\":\"https://rashiremedies.com/tag/traditional-remedy\",\"is_external\":false,\"page_id\":\"PUB-TAG-01\"},\"children\":[]},{\"label\":\"About\",\"destination\":{\"kind\":\"STATIC\",\"url\":\"https://rashiremedies.com/about\",\"is_external\":false,\"page_id\":\"PUB-STATIC-ABOUT-01\"},\"children\":[]},{\"label\":\"Search\",\"destination\":{\"kind\":\"SEARCH\",\"url\":\"https://RashiRemedies.com/search\",\"is_external\":false,\"page_id\":\"PUB-SEARCH-01\"},\"children\":[]}]},\"footer\":{\"menu_key\":\"FOOTER\",\"items\":[{\"label\":\"About\",\"destination\":{\"kind\":\"STATIC\",\"url\":\"https://rashiremedies.com/about\",\"is_external\":false,\"page_id\":\"PUB-STATIC-ABOUT-01\"},\"children\":[]},{\"label\":\"Contact\",\"destination\":{\"kind\":\"STATIC\",\"url\":\"https://rashiremedies.com/contact\",\"is_external\":false,\"page_id\":\"PUB-STATIC-CONTACT-01\"},\"children\":[]},{\"label\":\"Privacy Policy\",\"destination\":{\"kind\":\"STATIC\",\"url\":\"https://rashiremedies.com/privacy-policy\",\"is_external\":false,\"page_id\":\"PUB-STATIC-PRIVACY-01\"},\"children\":[]},{\"label\":\"Terms of Use\",\"destination\":{\"kind\":\"STATIC\",\"url\":\"https://rashiremedies.com/terms-of-use\",\"is_external\":false,\"page_id\":\"PUB-STATIC-TERMS-01\"},\"children\":[]},{\"label\":\"Disclaimer\",\"destination\":{\"kind\":\"STATIC\",\"url\":\"https://rashiremedies.com/disclaimer\",\"is_external\":false,\"page_id\":\"PUB-STATIC-DISCLAIMER-01\"},\"children\":[]}]}},\"breadcrumbs\":{\"items\":[{\"label\":\"Home\",\"destination\":{\"kind\":\"HOME\",\"url\":\"https://rashiremedies.com/\",\"is_external\":false,\"page_id\":\"PUB-HOME-01\"},\"is_current\":false},{\"label\":\"Traditional remedy\",\"is_current\":true}]},\"tag\":{\"tag_id\":\"site-12-tag-1\",\"name\":\"Traditional remedy\",\"description\":\"Articles grouped by the supplied Moon-sign topic.\",\"destination\":{\"kind\":\"TAG\",\"url\":\"https://rashiremedies.com/tag/traditional-remedy\",\"is_external\":false,\"page_id\":\"PUB-TAG-01\"}},\"articles\":[{\"article_id\":\"site-12-article-moon\",\"destination\":{\"kind\":\"ARTICLE\",\"url\":\"https://rashiremedies.com/article/traditional-remedy-guide\",\"is_external\":false,\"page_id\":\"PUB-ARTICLE-01\"},\"title\":\"RashiRemedies: Traditional remedy reference guide\",\"excerpt\":\"How to read Moon-sign context without turning editorial content into a calculator.\",\"author\":{\"author_id\":\"site-12-author-1\",\"display_name\":\"Editorial Desk\",\"destination\":{\"kind\":\"AUTHOR\",\"url\":\"https://rashiremedies.com/author/editorial-desk\",\"is_external\":false,\"page_id\":\"PUB-AUTHOR-01\"},\"short_bio\":\"Astrology education editor focused on clear, source-aware explanations.\"},\"published_at\":\"2026-09-11T05:00:00Z\",\"taxonomy_label\":\"Traditional remedy\"}],\"seo\":{\"baseline_indexability\":\"CONDITIONAL-INDEX\",\"title\":\"Traditional remedy | RashiRemedies\",\"canonical_url\":\"https://rashiremedies.com/tag/traditional-remedy\",\"robots\":{\"index\":true,\"follow\":true},\"structured_data\":[]}},\"/author/editorial-desk\":{\"context\":{\"page_id\":\"PUB-AUTHOR-01\",\"page_kind\":\"CONTENT\",\"render_mode\":\"PUBLIC\",\"locale_code\":\"en-IN\"},\"site\":{\"site_key\":\"SITE-12\",\"display_name\":\"RashiRemedies\",\"canonical_domain\":\"RashiRemedies.com\",\"home_destination\":{\"kind\":\"HOME\",\"url\":\"https://rashiremedies.com/\",\"is_external\":false,\"page_id\":\"PUB-HOME-01\"},\"default_language\":\"en\",\"locale_code\":\"en-IN\",\"timezone_id\":\"Asia/Kolkata\"},\"settings\":{\"copyright_text\":\"2026 RashiRemedies. Editorial information only.\",\"social_profiles\":[]},\"navigation\":{\"header\":{\"menu_key\":\"HEADER\",\"items\":[{\"label\":\"Home\",\"destination\":{\"kind\":\"HOME\",\"url\":\"https://rashiremedies.com/\",\"is_external\":false,\"page_id\":\"PUB-HOME-01\"},\"children\":[]},{\"label\":\"Remedy guidance\",\"destination\":{\"kind\":\"CATEGORY\",\"url\":\"https://rashiremedies.com/category/remedy-guidance\",\"is_external\":false,\"page_id\":\"PUB-CATEGORY-01\"},\"children\":[]},{\"label\":\"Traditional remedy\",\"destination\":{\"kind\":\"TAG\",\"url\":\"https://rashiremedies.com/tag/traditional-remedy\",\"is_external\":false,\"page_id\":\"PUB-TAG-01\"},\"children\":[]},{\"label\":\"About\",\"destination\":{\"kind\":\"STATIC\",\"url\":\"https://rashiremedies.com/about\",\"is_external\":false,\"page_id\":\"PUB-STATIC-ABOUT-01\"},\"children\":[]},{\"label\":\"Search\",\"destination\":{\"kind\":\"SEARCH\",\"url\":\"https://RashiRemedies.com/search\",\"is_external\":false,\"page_id\":\"PUB-SEARCH-01\"},\"children\":[]}]},\"footer\":{\"menu_key\":\"FOOTER\",\"items\":[{\"label\":\"About\",\"destination\":{\"kind\":\"STATIC\",\"url\":\"https://rashiremedies.com/about\",\"is_external\":false,\"page_id\":\"PUB-STATIC-ABOUT-01\"},\"children\":[]},{\"label\":\"Contact\",\"destination\":{\"kind\":\"STATIC\",\"url\":\"https://rashiremedies.com/contact\",\"is_external\":false,\"page_id\":\"PUB-STATIC-CONTACT-01\"},\"children\":[]},{\"label\":\"Privacy Policy\",\"destination\":{\"kind\":\"STATIC\",\"url\":\"https://rashiremedies.com/privacy-policy\",\"is_external\":false,\"page_id\":\"PUB-STATIC-PRIVACY-01\"},\"children\":[]},{\"label\":\"Terms of Use\",\"destination\":{\"kind\":\"STATIC\",\"url\":\"https://rashiremedies.com/terms-of-use\",\"is_external\":false,\"page_id\":\"PUB-STATIC-TERMS-01\"},\"children\":[]},{\"label\":\"Disclaimer\",\"destination\":{\"kind\":\"STATIC\",\"url\":\"https://rashiremedies.com/disclaimer\",\"is_external\":false,\"page_id\":\"PUB-STATIC-DISCLAIMER-01\"},\"children\":[]}]}},\"breadcrumbs\":{\"items\":[{\"label\":\"Home\",\"destination\":{\"kind\":\"HOME\",\"url\":\"https://rashiremedies.com/\",\"is_external\":false,\"page_id\":\"PUB-HOME-01\"},\"is_current\":false},{\"label\":\"Editorial Desk\",\"is_current\":true}]},\"author\":{\"author_id\":\"site-12-author-1\",\"display_name\":\"Editorial Desk\",\"destination\":{\"kind\":\"AUTHOR\",\"url\":\"https://rashiremedies.com/author/editorial-desk\",\"is_external\":false,\"page_id\":\"PUB-AUTHOR-01\"},\"bio\":\"Editorial profile fixture for same-site attribution.\",\"designation\":\"Editorial Team\",\"expertise\":[\"Remedy education\",\"Astrology explainers\"],\"social_profiles\":[]},\"articles\":[{\"article_id\":\"site-12-article-shared\",\"destination\":{\"kind\":\"ARTICLE\",\"url\":\"https://rashiremedies.com/article/shared-slug\",\"is_external\":false,\"page_id\":\"PUB-ARTICLE-01\"},\"title\":\"RashiRemedies: Understanding your Remedy step by step\",\"excerpt\":\"A practical introduction to Remedy concepts, written for clear editorial reading.\",\"featured_media\":{\"media_id\":\"site-12-media-hero\",\"url\":\"https://cdn.example.invalid/site-01/hero-1200.webp\",\"mime_type\":\"image/webp\",\"width\":1200,\"height\":900,\"alt_text\":\"RashiRemedies editorial Traditional remedy editorial illustration\",\"variants\":[{\"variant_key\":\"card-480-webp\",\"url\":\"https://cdn.example.invalid/site-01/hero-480.webp\",\"mime_type\":\"image/webp\",\"width\":480,\"height\":360},{\"variant_key\":\"card-800-webp\",\"url\":\"https://cdn.example.invalid/site-01/hero-800.webp\",\"mime_type\":\"image/webp\",\"width\":800,\"height\":600},{\"variant_key\":\"card-1200-avif\",\"url\":\"https://cdn.example.invalid/site-01/hero-1200.avif\",\"mime_type\":\"image/avif\",\"width\":1200,\"height\":900}],\"credit_text\":\"Fixture artwork\"},\"author\":{\"author_id\":\"site-12-author-1\",\"display_name\":\"Editorial Desk\",\"destination\":{\"kind\":\"AUTHOR\",\"url\":\"https://rashiremedies.com/author/editorial-desk\",\"is_external\":false,\"page_id\":\"PUB-AUTHOR-01\"},\"short_bio\":\"Astrology education editor focused on clear, source-aware explanations.\"},\"published_at\":\"2026-09-12T06:30:00Z\",\"taxonomy_label\":\"Remedy guidance\"},{\"article_id\":\"site-12-article-moon\",\"destination\":{\"kind\":\"ARTICLE\",\"url\":\"https://rashiremedies.com/article/traditional-remedy-guide\",\"is_external\":false,\"page_id\":\"PUB-ARTICLE-01\"},\"title\":\"RashiRemedies: Traditional remedy reference guide\",\"excerpt\":\"How to read Moon-sign context without turning editorial content into a calculator.\",\"author\":{\"author_id\":\"site-12-author-1\",\"display_name\":\"Editorial Desk\",\"destination\":{\"kind\":\"AUTHOR\",\"url\":\"https://rashiremedies.com/author/editorial-desk\",\"is_external\":false,\"page_id\":\"PUB-AUTHOR-01\"},\"short_bio\":\"Astrology education editor focused on clear, source-aware explanations.\"},\"published_at\":\"2026-09-11T05:00:00Z\",\"taxonomy_label\":\"Traditional remedy\"}],\"seo\":{\"baseline_indexability\":\"CONDITIONAL-INDEX\",\"title\":\"Editorial Desk | RashiRemedies\",\"canonical_url\":\"https://rashiremedies.com/author/editorial-desk\",\"robots\":{\"index\":true,\"follow\":true},\"structured_data\":[]}},\"/search\":{\"context\":{\"page_id\":\"PUB-SEARCH-01\",\"page_kind\":\"CONTENT\",\"render_mode\":\"PUBLIC\",\"locale_code\":\"en-IN\"},\"site\":{\"site_key\":\"SITE-12\",\"display_name\":\"RashiRemedies\",\"canonical_domain\":\"RashiRemedies.com\",\"home_destination\":{\"kind\":\"HOME\",\"url\":\"https://rashiremedies.com/\",\"is_external\":false,\"page_id\":\"PUB-HOME-01\"},\"default_language\":\"en\",\"locale_code\":\"en-IN\",\"timezone_id\":\"Asia/Kolkata\"},\"settings\":{\"copyright_text\":\"2026 RashiRemedies. Editorial information only.\",\"social_profiles\":[]},\"navigation\":{\"header\":{\"menu_key\":\"HEADER\",\"items\":[{\"label\":\"Home\",\"destination\":{\"kind\":\"HOME\",\"url\":\"https://rashiremedies.com/\",\"is_external\":false,\"page_id\":\"PUB-HOME-01\"},\"children\":[]},{\"label\":\"Remedy guidance\",\"destination\":{\"kind\":\"CATEGORY\",\"url\":\"https://rashiremedies.com/category/remedy-guidance\",\"is_external\":false,\"page_id\":\"PUB-CATEGORY-01\"},\"children\":[]},{\"label\":\"Traditional remedy\",\"destination\":{\"kind\":\"TAG\",\"url\":\"https://rashiremedies.com/tag/traditional-remedy\",\"is_external\":false,\"page_id\":\"PUB-TAG-01\"},\"children\":[]},{\"label\":\"About\",\"destination\":{\"kind\":\"STATIC\",\"url\":\"https://rashiremedies.com/about\",\"is_external\":false,\"page_id\":\"PUB-STATIC-ABOUT-01\"},\"children\":[]},{\"label\":\"Search\",\"destination\":{\"kind\":\"SEARCH\",\"url\":\"https://RashiRemedies.com/search\",\"is_external\":false,\"page_id\":\"PUB-SEARCH-01\"},\"children\":[]}]},\"footer\":{\"menu_key\":\"FOOTER\",\"items\":[{\"label\":\"About\",\"destination\":{\"kind\":\"STATIC\",\"url\":\"https://rashiremedies.com/about\",\"is_external\":false,\"page_id\":\"PUB-STATIC-ABOUT-01\"},\"children\":[]},{\"label\":\"Contact\",\"destination\":{\"kind\":\"STATIC\",\"url\":\"https://rashiremedies.com/contact\",\"is_external\":false,\"page_id\":\"PUB-STATIC-CONTACT-01\"},\"children\":[]},{\"label\":\"Privacy Policy\",\"destination\":{\"kind\":\"STATIC\",\"url\":\"https://rashiremedies.com/privacy-policy\",\"is_external\":false,\"page_id\":\"PUB-STATIC-PRIVACY-01\"},\"children\":[]},{\"label\":\"Terms of Use\",\"destination\":{\"kind\":\"STATIC\",\"url\":\"https://rashiremedies.com/terms-of-use\",\"is_external\":false,\"page_id\":\"PUB-STATIC-TERMS-01\"},\"children\":[]},{\"label\":\"Disclaimer\",\"destination\":{\"kind\":\"STATIC\",\"url\":\"https://rashiremedies.com/disclaimer\",\"is_external\":false,\"page_id\":\"PUB-STATIC-DISCLAIMER-01\"},\"children\":[]}]}},\"intro\":{\"h1\":\"Search this site\",\"intro_text\":\"Results stay inside the trusted current-site context.\"},\"query\":\"rashi\",\"search_state\":\"RESULTS\",\"articles\":[{\"article_id\":\"site-12-article-shared\",\"destination\":{\"kind\":\"ARTICLE\",\"url\":\"https://rashiremedies.com/article/shared-slug\",\"is_external\":false,\"page_id\":\"PUB-ARTICLE-01\"},\"title\":\"RashiRemedies: Understanding your Remedy step by step\",\"excerpt\":\"A practical introduction to Remedy concepts, written for clear editorial reading.\",\"featured_media\":{\"media_id\":\"site-12-media-hero\",\"url\":\"https://cdn.example.invalid/site-01/hero-1200.webp\",\"mime_type\":\"image/webp\",\"width\":1200,\"height\":900,\"alt_text\":\"RashiRemedies editorial Traditional remedy editorial illustration\",\"variants\":[{\"variant_key\":\"card-480-webp\",\"url\":\"https://cdn.example.invalid/site-01/hero-480.webp\",\"mime_type\":\"image/webp\",\"width\":480,\"height\":360},{\"variant_key\":\"card-800-webp\",\"url\":\"https://cdn.example.invalid/site-01/hero-800.webp\",\"mime_type\":\"image/webp\",\"width\":800,\"height\":600},{\"variant_key\":\"card-1200-avif\",\"url\":\"https://cdn.example.invalid/site-01/hero-1200.avif\",\"mime_type\":\"image/avif\",\"width\":1200,\"height\":900}],\"credit_text\":\"Fixture artwork\"},\"author\":{\"author_id\":\"site-12-author-1\",\"display_name\":\"Editorial Desk\",\"destination\":{\"kind\":\"AUTHOR\",\"url\":\"https://rashiremedies.com/author/editorial-desk\",\"is_external\":false,\"page_id\":\"PUB-AUTHOR-01\"},\"short_bio\":\"Astrology education editor focused on clear, source-aware explanations.\"},\"published_at\":\"2026-09-12T06:30:00Z\",\"taxonomy_label\":\"Remedy guidance\"},{\"article_id\":\"site-12-article-moon\",\"destination\":{\"kind\":\"ARTICLE\",\"url\":\"https://rashiremedies.com/article/traditional-remedy-guide\",\"is_external\":false,\"page_id\":\"PUB-ARTICLE-01\"},\"title\":\"RashiRemedies: Traditional remedy reference guide\",\"excerpt\":\"How to read Moon-sign context without turning editorial content into a calculator.\",\"author\":{\"author_id\":\"site-12-author-1\",\"display_name\":\"Editorial Desk\",\"destination\":{\"kind\":\"AUTHOR\",\"url\":\"https://rashiremedies.com/author/editorial-desk\",\"is_external\":false,\"page_id\":\"PUB-AUTHOR-01\"},\"short_bio\":\"Astrology education editor focused on clear, source-aware explanations.\"},\"published_at\":\"2026-09-11T05:00:00Z\",\"taxonomy_label\":\"Traditional remedy\"}],\"result_summary\":\"2 results for rashi\",\"seo\":{\"baseline_indexability\":\"NOINDEX\",\"title\":\"Search | RashiRemedies\",\"canonical_url\":\"https://rashiremedies.com/search\",\"robots\":{\"index\":false,\"follow\":true},\"structured_data\":[]}},\"/about\":{\"context\":{\"page_id\":\"PUB-STATIC-ABOUT-01\",\"page_kind\":\"STATIC\",\"render_mode\":\"PUBLIC\",\"locale_code\":\"en-IN\"},\"site\":{\"site_key\":\"SITE-12\",\"display_name\":\"RashiRemedies\",\"canonical_domain\":\"RashiRemedies.com\",\"home_destination\":{\"kind\":\"HOME\",\"url\":\"https://rashiremedies.com/\",\"is_external\":false,\"page_id\":\"PUB-HOME-01\"},\"default_language\":\"en\",\"locale_code\":\"en-IN\",\"timezone_id\":\"Asia/Kolkata\"},\"settings\":{\"copyright_text\":\"2026 RashiRemedies. Editorial information only.\",\"social_profiles\":[]},\"navigation\":{\"header\":{\"menu_key\":\"HEADER\",\"items\":[{\"label\":\"Home\",\"destination\":{\"kind\":\"HOME\",\"url\":\"https://rashiremedies.com/\",\"is_external\":false,\"page_id\":\"PUB-HOME-01\"},\"children\":[]},{\"label\":\"Remedy guidance\",\"destination\":{\"kind\":\"CATEGORY\",\"url\":\"https://rashiremedies.com/category/remedy-guidance\",\"is_external\":false,\"page_id\":\"PUB-CATEGORY-01\"},\"children\":[]},{\"label\":\"Traditional remedy\",\"destination\":{\"kind\":\"TAG\",\"url\":\"https://rashiremedies.com/tag/traditional-remedy\",\"is_external\":false,\"page_id\":\"PUB-TAG-01\"},\"children\":[]},{\"label\":\"About\",\"destination\":{\"kind\":\"STATIC\",\"url\":\"https://rashiremedies.com/about\",\"is_external\":false,\"page_id\":\"PUB-STATIC-ABOUT-01\"},\"children\":[]},{\"label\":\"Search\",\"destination\":{\"kind\":\"SEARCH\",\"url\":\"https://RashiRemedies.com/search\",\"is_external\":false,\"page_id\":\"PUB-SEARCH-01\"},\"children\":[]}]},\"footer\":{\"menu_key\":\"FOOTER\",\"items\":[{\"label\":\"About\",\"destination\":{\"kind\":\"STATIC\",\"url\":\"https://rashiremedies.com/about\",\"is_external\":false,\"page_id\":\"PUB-STATIC-ABOUT-01\"},\"children\":[]},{\"label\":\"Contact\",\"destination\":{\"kind\":\"STATIC\",\"url\":\"https://rashiremedies.com/contact\",\"is_external\":false,\"page_id\":\"PUB-STATIC-CONTACT-01\"},\"children\":[]},{\"label\":\"Privacy Policy\",\"destination\":{\"kind\":\"STATIC\",\"url\":\"https://rashiremedies.com/privacy-policy\",\"is_external\":false,\"page_id\":\"PUB-STATIC-PRIVACY-01\"},\"children\":[]},{\"label\":\"Terms of Use\",\"destination\":{\"kind\":\"STATIC\",\"url\":\"https://rashiremedies.com/terms-of-use\",\"is_external\":false,\"page_id\":\"PUB-STATIC-TERMS-01\"},\"children\":[]},{\"label\":\"Disclaimer\",\"destination\":{\"kind\":\"STATIC\",\"url\":\"https://rashiremedies.com/disclaimer\",\"is_external\":false,\"page_id\":\"PUB-STATIC-DISCLAIMER-01\"},\"children\":[]}]}},\"breadcrumbs\":{\"items\":[{\"label\":\"Home\",\"destination\":{\"kind\":\"HOME\",\"url\":\"https://rashiremedies.com/\",\"is_external\":false,\"page_id\":\"PUB-HOME-01\"},\"is_current\":false},{\"label\":\"About\",\"is_current\":true}]},\"content\":{\"static_key\":\"ABOUT\",\"title\":\"About\",\"intro_text\":\"Approved read-only about information for RashiRemedies.\",\"sections\":[{\"heading\":\"Information\",\"paragraphs\":[{\"runs\":[{\"text\":\"This fixture represents approved about content for responsive UI verification.\",\"marks\":[]}]}],\"list_items\":[]}]},\"seo\":{\"baseline_indexability\":\"INDEX-ELIGIBLE\",\"title\":\"About | RashiRemedies\",\"canonical_url\":\"https://rashiremedies.com/about\",\"robots\":{\"index\":true,\"follow\":true},\"structured_data\":[]}},\"/contact\":{\"context\":{\"page_id\":\"PUB-STATIC-CONTACT-01\",\"page_kind\":\"STATIC\",\"render_mode\":\"PUBLIC\",\"locale_code\":\"en-IN\"},\"site\":{\"site_key\":\"SITE-12\",\"display_name\":\"RashiRemedies\",\"canonical_domain\":\"RashiRemedies.com\",\"home_destination\":{\"kind\":\"HOME\",\"url\":\"https://rashiremedies.com/\",\"is_external\":false,\"page_id\":\"PUB-HOME-01\"},\"default_language\":\"en\",\"locale_code\":\"en-IN\",\"timezone_id\":\"Asia/Kolkata\"},\"settings\":{\"copyright_text\":\"2026 RashiRemedies. Editorial information only.\",\"social_profiles\":[]},\"navigation\":{\"header\":{\"menu_key\":\"HEADER\",\"items\":[{\"label\":\"Home\",\"destination\":{\"kind\":\"HOME\",\"url\":\"https://rashiremedies.com/\",\"is_external\":false,\"page_id\":\"PUB-HOME-01\"},\"children\":[]},{\"label\":\"Remedy guidance\",\"destination\":{\"kind\":\"CATEGORY\",\"url\":\"https://rashiremedies.com/category/remedy-guidance\",\"is_external\":false,\"page_id\":\"PUB-CATEGORY-01\"},\"children\":[]},{\"label\":\"Traditional remedy\",\"destination\":{\"kind\":\"TAG\",\"url\":\"https://rashiremedies.com/tag/traditional-remedy\",\"is_external\":false,\"page_id\":\"PUB-TAG-01\"},\"children\":[]},{\"label\":\"About\",\"destination\":{\"kind\":\"STATIC\",\"url\":\"https://rashiremedies.com/about\",\"is_external\":false,\"page_id\":\"PUB-STATIC-ABOUT-01\"},\"children\":[]},{\"label\":\"Search\",\"destination\":{\"kind\":\"SEARCH\",\"url\":\"https://RashiRemedies.com/search\",\"is_external\":false,\"page_id\":\"PUB-SEARCH-01\"},\"children\":[]}]},\"footer\":{\"menu_key\":\"FOOTER\",\"items\":[{\"label\":\"About\",\"destination\":{\"kind\":\"STATIC\",\"url\":\"https://rashiremedies.com/about\",\"is_external\":false,\"page_id\":\"PUB-STATIC-ABOUT-01\"},\"children\":[]},{\"label\":\"Contact\",\"destination\":{\"kind\":\"STATIC\",\"url\":\"https://rashiremedies.com/contact\",\"is_external\":false,\"page_id\":\"PUB-STATIC-CONTACT-01\"},\"children\":[]},{\"label\":\"Privacy Policy\",\"destination\":{\"kind\":\"STATIC\",\"url\":\"https://rashiremedies.com/privacy-policy\",\"is_external\":false,\"page_id\":\"PUB-STATIC-PRIVACY-01\"},\"children\":[]},{\"label\":\"Terms of Use\",\"destination\":{\"kind\":\"STATIC\",\"url\":\"https://rashiremedies.com/terms-of-use\",\"is_external\":false,\"page_id\":\"PUB-STATIC-TERMS-01\"},\"children\":[]},{\"label\":\"Disclaimer\",\"destination\":{\"kind\":\"STATIC\",\"url\":\"https://rashiremedies.com/disclaimer\",\"is_external\":false,\"page_id\":\"PUB-STATIC-DISCLAIMER-01\"},\"children\":[]}]}},\"breadcrumbs\":{\"items\":[{\"label\":\"Home\",\"destination\":{\"kind\":\"HOME\",\"url\":\"https://rashiremedies.com/\",\"is_external\":false,\"page_id\":\"PUB-HOME-01\"},\"is_current\":false},{\"label\":\"Contact\",\"is_current\":true}]},\"content\":{\"static_key\":\"CONTACT\",\"title\":\"Contact\",\"intro_text\":\"Approved read-only contact information for RashiRemedies.\",\"sections\":[{\"heading\":\"Information\",\"paragraphs\":[{\"runs\":[{\"text\":\"This fixture represents approved contact content for responsive UI verification.\",\"marks\":[]}]}],\"list_items\":[]}]},\"seo\":{\"baseline_indexability\":\"INDEX-ELIGIBLE\",\"title\":\"Contact | RashiRemedies\",\"canonical_url\":\"https://rashiremedies.com/contact\",\"robots\":{\"index\":true,\"follow\":true},\"structured_data\":[]},\"contact_info\":{\"items\":[{\"kind\":\"EMAIL\",\"label\":\"Editorial email\",\"display_value\":\"editorial@example.invalid\",\"destination\":{\"kind\":\"MAILTO\",\"url\":\"mailto:editorial@example.invalid\",\"is_external\":false}},{\"kind\":\"HOURS\",\"label\":\"Editorial hours\",\"display_value\":\"Monday-Friday, 10:00-18:00 IST\"}]}},\"/privacy-policy\":{\"context\":{\"page_id\":\"PUB-STATIC-PRIVACY-01\",\"page_kind\":\"STATIC\",\"render_mode\":\"PUBLIC\",\"locale_code\":\"en-IN\"},\"site\":{\"site_key\":\"SITE-12\",\"display_name\":\"RashiRemedies\",\"canonical_domain\":\"RashiRemedies.com\",\"home_destination\":{\"kind\":\"HOME\",\"url\":\"https://rashiremedies.com/\",\"is_external\":false,\"page_id\":\"PUB-HOME-01\"},\"default_language\":\"en\",\"locale_code\":\"en-IN\",\"timezone_id\":\"Asia/Kolkata\"},\"settings\":{\"copyright_text\":\"2026 RashiRemedies. Editorial information only.\",\"social_profiles\":[]},\"navigation\":{\"header\":{\"menu_key\":\"HEADER\",\"items\":[{\"label\":\"Home\",\"destination\":{\"kind\":\"HOME\",\"url\":\"https://rashiremedies.com/\",\"is_external\":false,\"page_id\":\"PUB-HOME-01\"},\"children\":[]},{\"label\":\"Remedy guidance\",\"destination\":{\"kind\":\"CATEGORY\",\"url\":\"https://rashiremedies.com/category/remedy-guidance\",\"is_external\":false,\"page_id\":\"PUB-CATEGORY-01\"},\"children\":[]},{\"label\":\"Traditional remedy\",\"destination\":{\"kind\":\"TAG\",\"url\":\"https://rashiremedies.com/tag/traditional-remedy\",\"is_external\":false,\"page_id\":\"PUB-TAG-01\"},\"children\":[]},{\"label\":\"About\",\"destination\":{\"kind\":\"STATIC\",\"url\":\"https://rashiremedies.com/about\",\"is_external\":false,\"page_id\":\"PUB-STATIC-ABOUT-01\"},\"children\":[]},{\"label\":\"Search\",\"destination\":{\"kind\":\"SEARCH\",\"url\":\"https://RashiRemedies.com/search\",\"is_external\":false,\"page_id\":\"PUB-SEARCH-01\"},\"children\":[]}]},\"footer\":{\"menu_key\":\"FOOTER\",\"items\":[{\"label\":\"About\",\"destination\":{\"kind\":\"STATIC\",\"url\":\"https://rashiremedies.com/about\",\"is_external\":false,\"page_id\":\"PUB-STATIC-ABOUT-01\"},\"children\":[]},{\"label\":\"Contact\",\"destination\":{\"kind\":\"STATIC\",\"url\":\"https://rashiremedies.com/contact\",\"is_external\":false,\"page_id\":\"PUB-STATIC-CONTACT-01\"},\"children\":[]},{\"label\":\"Privacy Policy\",\"destination\":{\"kind\":\"STATIC\",\"url\":\"https://rashiremedies.com/privacy-policy\",\"is_external\":false,\"page_id\":\"PUB-STATIC-PRIVACY-01\"},\"children\":[]},{\"label\":\"Terms of Use\",\"destination\":{\"kind\":\"STATIC\",\"url\":\"https://rashiremedies.com/terms-of-use\",\"is_external\":false,\"page_id\":\"PUB-STATIC-TERMS-01\"},\"children\":[]},{\"label\":\"Disclaimer\",\"destination\":{\"kind\":\"STATIC\",\"url\":\"https://rashiremedies.com/disclaimer\",\"is_external\":false,\"page_id\":\"PUB-STATIC-DISCLAIMER-01\"},\"children\":[]}]}},\"breadcrumbs\":{\"items\":[{\"label\":\"Home\",\"destination\":{\"kind\":\"HOME\",\"url\":\"https://rashiremedies.com/\",\"is_external\":false,\"page_id\":\"PUB-HOME-01\"},\"is_current\":false},{\"label\":\"Privacy Policy\",\"is_current\":true}]},\"content\":{\"static_key\":\"PRIVACY\",\"title\":\"Privacy Policy\",\"intro_text\":\"Approved read-only privacy policy information for RashiRemedies.\",\"sections\":[{\"heading\":\"Information\",\"paragraphs\":[{\"runs\":[{\"text\":\"This fixture represents approved privacy policy content for responsive UI verification.\",\"marks\":[]}]}],\"list_items\":[]}]},\"seo\":{\"baseline_indexability\":\"INDEX-ELIGIBLE\",\"title\":\"Privacy Policy | RashiRemedies\",\"canonical_url\":\"https://rashiremedies.com/privacy-policy\",\"robots\":{\"index\":true,\"follow\":true},\"structured_data\":[]}},\"/terms-of-use\":{\"context\":{\"page_id\":\"PUB-STATIC-TERMS-01\",\"page_kind\":\"STATIC\",\"render_mode\":\"PUBLIC\",\"locale_code\":\"en-IN\"},\"site\":{\"site_key\":\"SITE-12\",\"display_name\":\"RashiRemedies\",\"canonical_domain\":\"RashiRemedies.com\",\"home_destination\":{\"kind\":\"HOME\",\"url\":\"https://rashiremedies.com/\",\"is_external\":false,\"page_id\":\"PUB-HOME-01\"},\"default_language\":\"en\",\"locale_code\":\"en-IN\",\"timezone_id\":\"Asia/Kolkata\"},\"settings\":{\"copyright_text\":\"2026 RashiRemedies. Editorial information only.\",\"social_profiles\":[]},\"navigation\":{\"header\":{\"menu_key\":\"HEADER\",\"items\":[{\"label\":\"Home\",\"destination\":{\"kind\":\"HOME\",\"url\":\"https://rashiremedies.com/\",\"is_external\":false,\"page_id\":\"PUB-HOME-01\"},\"children\":[]},{\"label\":\"Remedy guidance\",\"destination\":{\"kind\":\"CATEGORY\",\"url\":\"https://rashiremedies.com/category/remedy-guidance\",\"is_external\":false,\"page_id\":\"PUB-CATEGORY-01\"},\"children\":[]},{\"label\":\"Traditional remedy\",\"destination\":{\"kind\":\"TAG\",\"url\":\"https://rashiremedies.com/tag/traditional-remedy\",\"is_external\":false,\"page_id\":\"PUB-TAG-01\"},\"children\":[]},{\"label\":\"About\",\"destination\":{\"kind\":\"STATIC\",\"url\":\"https://rashiremedies.com/about\",\"is_external\":false,\"page_id\":\"PUB-STATIC-ABOUT-01\"},\"children\":[]},{\"label\":\"Search\",\"destination\":{\"kind\":\"SEARCH\",\"url\":\"https://RashiRemedies.com/search\",\"is_external\":false,\"page_id\":\"PUB-SEARCH-01\"},\"children\":[]}]},\"footer\":{\"menu_key\":\"FOOTER\",\"items\":[{\"label\":\"About\",\"destination\":{\"kind\":\"STATIC\",\"url\":\"https://rashiremedies.com/about\",\"is_external\":false,\"page_id\":\"PUB-STATIC-ABOUT-01\"},\"children\":[]},{\"label\":\"Contact\",\"destination\":{\"kind\":\"STATIC\",\"url\":\"https://rashiremedies.com/contact\",\"is_external\":false,\"page_id\":\"PUB-STATIC-CONTACT-01\"},\"children\":[]},{\"label\":\"Privacy Policy\",\"destination\":{\"kind\":\"STATIC\",\"url\":\"https://rashiremedies.com/privacy-policy\",\"is_external\":false,\"page_id\":\"PUB-STATIC-PRIVACY-01\"},\"children\":[]},{\"label\":\"Terms of Use\",\"destination\":{\"kind\":\"STATIC\",\"url\":\"https://rashiremedies.com/terms-of-use\",\"is_external\":false,\"page_id\":\"PUB-STATIC-TERMS-01\"},\"children\":[]},{\"label\":\"Disclaimer\",\"destination\":{\"kind\":\"STATIC\",\"url\":\"https://rashiremedies.com/disclaimer\",\"is_external\":false,\"page_id\":\"PUB-STATIC-DISCLAIMER-01\"},\"children\":[]}]}},\"breadcrumbs\":{\"items\":[{\"label\":\"Home\",\"destination\":{\"kind\":\"HOME\",\"url\":\"https://rashiremedies.com/\",\"is_external\":false,\"page_id\":\"PUB-HOME-01\"},\"is_current\":false},{\"label\":\"Terms of Use\",\"is_current\":true}]},\"content\":{\"static_key\":\"TERMS\",\"title\":\"Terms of Use\",\"intro_text\":\"Approved read-only terms of use information for RashiRemedies.\",\"sections\":[{\"heading\":\"Information\",\"paragraphs\":[{\"runs\":[{\"text\":\"This fixture represents approved terms of use content for responsive UI verification.\",\"marks\":[]}]}],\"list_items\":[]}]},\"seo\":{\"baseline_indexability\":\"INDEX-ELIGIBLE\",\"title\":\"Terms of Use | RashiRemedies\",\"canonical_url\":\"https://rashiremedies.com/terms-of-use\",\"robots\":{\"index\":true,\"follow\":true},\"structured_data\":[]}},\"/disclaimer\":{\"context\":{\"page_id\":\"PUB-STATIC-DISCLAIMER-01\",\"page_kind\":\"STATIC\",\"render_mode\":\"PUBLIC\",\"locale_code\":\"en-IN\"},\"site\":{\"site_key\":\"SITE-12\",\"display_name\":\"RashiRemedies\",\"canonical_domain\":\"RashiRemedies.com\",\"home_destination\":{\"kind\":\"HOME\",\"url\":\"https://rashiremedies.com/\",\"is_external\":false,\"page_id\":\"PUB-HOME-01\"},\"default_language\":\"en\",\"locale_code\":\"en-IN\",\"timezone_id\":\"Asia/Kolkata\"},\"settings\":{\"copyright_text\":\"2026 RashiRemedies. Editorial information only.\",\"social_profiles\":[]},\"navigation\":{\"header\":{\"menu_key\":\"HEADER\",\"items\":[{\"label\":\"Home\",\"destination\":{\"kind\":\"HOME\",\"url\":\"https://rashiremedies.com/\",\"is_external\":false,\"page_id\":\"PUB-HOME-01\"},\"children\":[]},{\"label\":\"Remedy guidance\",\"destination\":{\"kind\":\"CATEGORY\",\"url\":\"https://rashiremedies.com/category/remedy-guidance\",\"is_external\":false,\"page_id\":\"PUB-CATEGORY-01\"},\"children\":[]},{\"label\":\"Traditional remedy\",\"destination\":{\"kind\":\"TAG\",\"url\":\"https://rashiremedies.com/tag/traditional-remedy\",\"is_external\":false,\"page_id\":\"PUB-TAG-01\"},\"children\":[]},{\"label\":\"About\",\"destination\":{\"kind\":\"STATIC\",\"url\":\"https://rashiremedies.com/about\",\"is_external\":false,\"page_id\":\"PUB-STATIC-ABOUT-01\"},\"children\":[]},{\"label\":\"Search\",\"destination\":{\"kind\":\"SEARCH\",\"url\":\"https://RashiRemedies.com/search\",\"is_external\":false,\"page_id\":\"PUB-SEARCH-01\"},\"children\":[]}]},\"footer\":{\"menu_key\":\"FOOTER\",\"items\":[{\"label\":\"About\",\"destination\":{\"kind\":\"STATIC\",\"url\":\"https://rashiremedies.com/about\",\"is_external\":false,\"page_id\":\"PUB-STATIC-ABOUT-01\"},\"children\":[]},{\"label\":\"Contact\",\"destination\":{\"kind\":\"STATIC\",\"url\":\"https://rashiremedies.com/contact\",\"is_external\":false,\"page_id\":\"PUB-STATIC-CONTACT-01\"},\"children\":[]},{\"label\":\"Privacy Policy\",\"destination\":{\"kind\":\"STATIC\",\"url\":\"https://rashiremedies.com/privacy-policy\",\"is_external\":false,\"page_id\":\"PUB-STATIC-PRIVACY-01\"},\"children\":[]},{\"label\":\"Terms of Use\",\"destination\":{\"kind\":\"STATIC\",\"url\":\"https://rashiremedies.com/terms-of-use\",\"is_external\":false,\"page_id\":\"PUB-STATIC-TERMS-01\"},\"children\":[]},{\"label\":\"Disclaimer\",\"destination\":{\"kind\":\"STATIC\",\"url\":\"https://rashiremedies.com/disclaimer\",\"is_external\":false,\"page_id\":\"PUB-STATIC-DISCLAIMER-01\"},\"children\":[]}]}},\"breadcrumbs\":{\"items\":[{\"label\":\"Home\",\"destination\":{\"kind\":\"HOME\",\"url\":\"https://rashiremedies.com/\",\"is_external\":false,\"page_id\":\"PUB-HOME-01\"},\"is_current\":false},{\"label\":\"Disclaimer\",\"is_current\":true}]},\"content\":{\"static_key\":\"DISCLAIMER\",\"title\":\"Disclaimer\",\"intro_text\":\"Approved read-only disclaimer information for RashiRemedies.\",\"sections\":[{\"heading\":\"Information\",\"paragraphs\":[{\"runs\":[{\"text\":\"This fixture represents approved disclaimer content for responsive UI verification.\",\"marks\":[]}]}],\"list_items\":[]}]},\"seo\":{\"baseline_indexability\":\"INDEX-ELIGIBLE\",\"title\":\"Disclaimer | RashiRemedies\",\"canonical_url\":\"https://rashiremedies.com/disclaimer\",\"robots\":{\"index\":true,\"follow\":true},\"structured_data\":[]}}},\"preview\":{\"context\":{\"page_id\":\"PUB-SYS-PREVIEW-01\",\"page_kind\":\"PREVIEW\",\"render_mode\":\"PREVIEW\",\"locale_code\":\"en-IN\"},\"site\":{\"site_key\":\"SITE-12\",\"display_name\":\"RashiRemedies\",\"canonical_domain\":\"RashiRemedies.com\",\"home_destination\":{\"kind\":\"HOME\",\"url\":\"https://rashiremedies.com/\",\"is_external\":false,\"page_id\":\"PUB-HOME-01\"},\"default_language\":\"en\",\"locale_code\":\"en-IN\",\"timezone_id\":\"Asia/Kolkata\"},\"settings\":{\"copyright_text\":\"2026 RashiRemedies. Editorial information only.\",\"social_profiles\":[]},\"navigation\":{\"header\":{\"menu_key\":\"HEADER\",\"items\":[{\"label\":\"Home\",\"destination\":{\"kind\":\"HOME\",\"url\":\"https://rashiremedies.com/\",\"is_external\":false,\"page_id\":\"PUB-HOME-01\"},\"children\":[]},{\"label\":\"Remedy guidance\",\"destination\":{\"kind\":\"CATEGORY\",\"url\":\"https://rashiremedies.com/category/remedy-guidance\",\"is_external\":false,\"page_id\":\"PUB-CATEGORY-01\"},\"children\":[]},{\"label\":\"Traditional remedy\",\"destination\":{\"kind\":\"TAG\",\"url\":\"https://rashiremedies.com/tag/traditional-remedy\",\"is_external\":false,\"page_id\":\"PUB-TAG-01\"},\"children\":[]},{\"label\":\"About\",\"destination\":{\"kind\":\"STATIC\",\"url\":\"https://rashiremedies.com/about\",\"is_external\":false,\"page_id\":\"PUB-STATIC-ABOUT-01\"},\"children\":[]},{\"label\":\"Search\",\"destination\":{\"kind\":\"SEARCH\",\"url\":\"https://RashiRemedies.com/search\",\"is_external\":false,\"page_id\":\"PUB-SEARCH-01\"},\"children\":[]}]},\"footer\":{\"menu_key\":\"FOOTER\",\"items\":[{\"label\":\"About\",\"destination\":{\"kind\":\"STATIC\",\"url\":\"https://rashiremedies.com/about\",\"is_external\":false,\"page_id\":\"PUB-STATIC-ABOUT-01\"},\"children\":[]},{\"label\":\"Contact\",\"destination\":{\"kind\":\"STATIC\",\"url\":\"https://rashiremedies.com/contact\",\"is_external\":false,\"page_id\":\"PUB-STATIC-CONTACT-01\"},\"children\":[]},{\"label\":\"Privacy Policy\",\"destination\":{\"kind\":\"STATIC\",\"url\":\"https://rashiremedies.com/privacy-policy\",\"is_external\":false,\"page_id\":\"PUB-STATIC-PRIVACY-01\"},\"children\":[]},{\"label\":\"Terms of Use\",\"destination\":{\"kind\":\"STATIC\",\"url\":\"https://rashiremedies.com/terms-of-use\",\"is_external\":false,\"page_id\":\"PUB-STATIC-TERMS-01\"},\"children\":[]},{\"label\":\"Disclaimer\",\"destination\":{\"kind\":\"STATIC\",\"url\":\"https://rashiremedies.com/disclaimer\",\"is_external\":false,\"page_id\":\"PUB-STATIC-DISCLAIMER-01\"},\"children\":[]}]}},\"preview\":{\"lifecycle_status\":\"DRAFT\",\"source_kind\":\"WORKING_COPY\",\"notice_text\":\"Private preview - not published\",\"return_url\":\"https://admin.example.invalid/\"},\"article\":{\"article_id\":\"site-12-article-shared\",\"title\":\"Preview: RashiRemedies: Understanding your Remedy step by step\",\"excerpt\":\"A practical introduction to Remedy concepts, written for clear editorial reading.\",\"body\":{\"content_schema_version\":\"1.0\",\"blocks\":[{\"block_id\":\"b1\",\"type\":\"PARAGRAPH\",\"payload\":{\"content\":{\"runs\":[{\"text\":\"Remedy is a structured editorial topic here; this paragraph is deterministic fixture content.\",\"marks\":[]}]}}},{\"block_id\":\"b2\",\"type\":\"HEADING\",\"payload\":{\"level\":2,\"content\":{\"runs\":[{\"text\":\"A clear starting point\",\"marks\":[]}]}}},{\"block_id\":\"b3\",\"type\":\"LIST\",\"payload\":{\"style\":\"UNORDERED\",\"items\":[{\"runs\":[{\"text\":\"Read the supplied PageData in order.\",\"marks\":[]}]},{\"runs\":[{\"text\":\"Keep site context isolated.\",\"marks\":[]}]}]}},{\"block_id\":\"b4\",\"type\":\"QUOTE\",\"payload\":{\"quote\":{\"runs\":[{\"text\":\"Clarity is more useful than decorative certainty.\",\"marks\":[]}]},\"attribution\":\"Editorial Desk\",\"source\":\"Fixture note\"}},{\"block_id\":\"b5\",\"type\":\"SEPARATOR\",\"payload\":{}},{\"block_id\":\"b6\",\"type\":\"MEDIA\",\"payload\":{\"resolution_state\":\"READY\",\"media\":{\"media_id\":\"site-12-media-hero\",\"url\":\"https://cdn.example.invalid/site-01/hero-1200.webp\",\"mime_type\":\"image/webp\",\"width\":1200,\"height\":900,\"alt_text\":\"RashiRemedies editorial Traditional remedy editorial illustration\",\"variants\":[{\"variant_key\":\"card-480-webp\",\"url\":\"https://cdn.example.invalid/site-01/hero-480.webp\",\"mime_type\":\"image/webp\",\"width\":480,\"height\":360},{\"variant_key\":\"card-800-webp\",\"url\":\"https://cdn.example.invalid/site-01/hero-800.webp\",\"mime_type\":\"image/webp\",\"width\":800,\"height\":600},{\"variant_key\":\"card-1200-avif\",\"url\":\"https://cdn.example.invalid/site-01/hero-1200.avif\",\"mime_type\":\"image/avif\",\"width\":1200,\"height\":900}],\"credit_text\":\"Fixture artwork\"},\"alt_override\":\"RashiRemedies Remedy diagram\",\"caption\":\"Fixture media using public CDN-style variants.\"}},{\"block_id\":\"b7\",\"type\":\"TABLE\",\"payload\":{\"header_row\":true,\"rows\":[[{\"runs\":[{\"text\":\"Reading cue\",\"marks\":[]}]},{\"runs\":[{\"text\":\"Meaning\",\"marks\":[]}]}],[{\"runs\":[{\"text\":\"Order\",\"marks\":[]}]},{\"runs\":[{\"text\":\"Preserve server order\",\"marks\":[]}]}],[{\"runs\":[{\"text\":\"Scope\",\"marks\":[]}]},{\"runs\":[{\"text\":\"One trusted site\",\"marks\":[]}]}]]}},{\"block_id\":\"b8\",\"type\":\"EMBED\",\"payload\":{\"provider_key\":\"approved-video-provider\",\"source_url_or_id\":\"https://example.invalid/editorial-reference\",\"caption\":\"Safe textual fallback when provider playback is unavailable.\"}},{\"block_id\":\"b9\",\"type\":\"CALLOUT\",\"payload\":{\"label\":\"Remember\",\"body\":{\"runs\":[{\"text\":\"Presentation can differ by site; semantic contracts do not.\",\"marks\":[]}]}}},{\"block_id\":\"b10\",\"type\":\"CTA\",\"payload\":{\"label\":\"Browse Remedy guidance\",\"supporting_text\":\"Continue with the same-site category archive.\",\"destination\":{\"kind\":\"CATEGORY\",\"url\":\"https://rashiremedies.com/category/remedy-guidance\",\"is_external\":false,\"page_id\":\"PUB-CATEGORY-01\"}}},{\"block_id\":\"b11\",\"type\":\"DISCLAIMER\",\"payload\":{\"label\":\"Editorial disclaimer\",\"body\":{\"runs\":[{\"text\":\"This fixture demonstrates layout behavior and is not personalized astrological advice.\",\"marks\":[]}]}}},{\"block_id\":\"b12\",\"type\":\"SOURCES_REFERENCES\",\"payload\":{\"entries\":[{\"title\":\"Fixture source reference\",\"url\":\"https://example.invalid/reference\",\"publisher\":\"Documentation fixture\",\"note\":\"Used only for CHAT07 UI verification.\"}]}}]},\"author\":{\"author_id\":\"site-12-author-1\",\"display_name\":\"Editorial Desk\",\"destination\":{\"kind\":\"AUTHOR\",\"url\":\"https://rashiremedies.com/author/editorial-desk\",\"is_external\":false,\"page_id\":\"PUB-AUTHOR-01\"},\"short_bio\":\"Astrology education editor focused on clear, source-aware explanations.\"},\"categories\":[{\"kind\":\"CATEGORY\",\"name\":\"Remedy guidance\",\"destination\":{\"kind\":\"CATEGORY\",\"url\":\"https://rashiremedies.com/category/remedy-guidance\",\"is_external\":false,\"page_id\":\"PUB-CATEGORY-01\"}}],\"tags\":[{\"kind\":\"TAG\",\"name\":\"Traditional remedy\",\"destination\":{\"kind\":\"TAG\",\"url\":\"https://rashiremedies.com/tag/traditional-remedy\",\"is_external\":false,\"page_id\":\"PUB-TAG-01\"}}],\"featured_media\":{\"media_id\":\"site-12-media-hero\",\"url\":\"https://cdn.example.invalid/site-01/hero-1200.webp\",\"mime_type\":\"image/webp\",\"width\":1200,\"height\":900,\"alt_text\":\"RashiRemedies editorial Traditional remedy editorial illustration\",\"variants\":[{\"variant_key\":\"card-480-webp\",\"url\":\"https://cdn.example.invalid/site-01/hero-480.webp\",\"mime_type\":\"image/webp\",\"width\":480,\"height\":360},{\"variant_key\":\"card-800-webp\",\"url\":\"https://cdn.example.invalid/site-01/hero-800.webp\",\"mime_type\":\"image/webp\",\"width\":800,\"height\":600},{\"variant_key\":\"card-1200-avif\",\"url\":\"https://cdn.example.invalid/site-01/hero-1200.avif\",\"mime_type\":\"image/avif\",\"width\":1200,\"height\":900}],\"credit_text\":\"Fixture artwork\"},\"updated_at\":\"2026-09-12T08:00:00Z\"},\"related_content\":{\"articles\":[{\"article_id\":\"site-12-article-moon\",\"destination\":{\"kind\":\"ARTICLE\",\"url\":\"https://rashiremedies.com/article/traditional-remedy-guide\",\"is_external\":false,\"page_id\":\"PUB-ARTICLE-01\"},\"title\":\"RashiRemedies: Traditional remedy reference guide\",\"excerpt\":\"How to read Moon-sign context without turning editorial content into a calculator.\",\"author\":{\"author_id\":\"site-12-author-1\",\"display_name\":\"Editorial Desk\",\"destination\":{\"kind\":\"AUTHOR\",\"url\":\"https://rashiremedies.com/author/editorial-desk\",\"is_external\":false,\"page_id\":\"PUB-AUTHOR-01\"},\"short_bio\":\"Astrology education editor focused on clear, source-aware explanations.\"},\"published_at\":\"2026-09-11T05:00:00Z\",\"taxonomy_label\":\"Traditional remedy\"}]},\"seo\":{\"baseline_indexability\":\"NOINDEX\",\"title\":\"Private preview | RashiRemedies\",\"robots\":{\"index\":false,\"follow\":false},\"structured_data\":[]}},\"not_found\":{\"context\":{\"page_id\":\"PUB-SYS-404-01\",\"page_kind\":\"SYSTEM\",\"render_mode\":\"SYSTEM\"},\"site\":{\"site_key\":\"SITE-12\",\"display_name\":\"RashiRemedies\",\"canonical_domain\":\"RashiRemedies.com\",\"home_destination\":{\"kind\":\"HOME\",\"url\":\"https://rashiremedies.com/\",\"is_external\":false,\"page_id\":\"PUB-HOME-01\"},\"default_language\":\"en\",\"locale_code\":\"en-IN\",\"timezone_id\":\"Asia/Kolkata\"},\"settings\":{\"copyright_text\":\"2026 RashiRemedies. Editorial information only.\",\"social_profiles\":[]},\"navigation\":{\"header\":{\"menu_key\":\"HEADER\",\"items\":[{\"label\":\"Home\",\"destination\":{\"kind\":\"HOME\",\"url\":\"https://rashiremedies.com/\",\"is_external\":false,\"page_id\":\"PUB-HOME-01\"},\"children\":[]},{\"label\":\"Remedy guidance\",\"destination\":{\"kind\":\"CATEGORY\",\"url\":\"https://rashiremedies.com/category/remedy-guidance\",\"is_external\":false,\"page_id\":\"PUB-CATEGORY-01\"},\"children\":[]},{\"label\":\"Traditional remedy\",\"destination\":{\"kind\":\"TAG\",\"url\":\"https://rashiremedies.com/tag/traditional-remedy\",\"is_external\":false,\"page_id\":\"PUB-TAG-01\"},\"children\":[]},{\"label\":\"About\",\"destination\":{\"kind\":\"STATIC\",\"url\":\"https://rashiremedies.com/about\",\"is_external\":false,\"page_id\":\"PUB-STATIC-ABOUT-01\"},\"children\":[]},{\"label\":\"Search\",\"destination\":{\"kind\":\"SEARCH\",\"url\":\"https://RashiRemedies.com/search\",\"is_external\":false,\"page_id\":\"PUB-SEARCH-01\"},\"children\":[]}]},\"footer\":{\"menu_key\":\"FOOTER\",\"items\":[{\"label\":\"About\",\"destination\":{\"kind\":\"STATIC\",\"url\":\"https://rashiremedies.com/about\",\"is_external\":false,\"page_id\":\"PUB-STATIC-ABOUT-01\"},\"children\":[]},{\"label\":\"Contact\",\"destination\":{\"kind\":\"STATIC\",\"url\":\"https://rashiremedies.com/contact\",\"is_external\":false,\"page_id\":\"PUB-STATIC-CONTACT-01\"},\"children\":[]},{\"label\":\"Privacy Policy\",\"destination\":{\"kind\":\"STATIC\",\"url\":\"https://rashiremedies.com/privacy-policy\",\"is_external\":false,\"page_id\":\"PUB-STATIC-PRIVACY-01\"},\"children\":[]},{\"label\":\"Terms of Use\",\"destination\":{\"kind\":\"STATIC\",\"url\":\"https://rashiremedies.com/terms-of-use\",\"is_external\":false,\"page_id\":\"PUB-STATIC-TERMS-01\"},\"children\":[]},{\"label\":\"Disclaimer\",\"destination\":{\"kind\":\"STATIC\",\"url\":\"https://rashiremedies.com/disclaimer\",\"is_external\":false,\"page_id\":\"PUB-STATIC-DISCLAIMER-01\"},\"children\":[]}]}},\"message\":{\"code\":404,\"title\":\"Page not found\",\"body\":\"The requested page is unavailable on this site.\"},\"recovery\":{\"home\":{\"kind\":\"HOME\",\"url\":\"https://rashiremedies.com/\",\"is_external\":false,\"page_id\":\"PUB-HOME-01\"},\"search\":{\"kind\":\"SEARCH\",\"url\":\"https://rashiremedies.com/search\",\"is_external\":false,\"page_id\":\"PUB-SEARCH-01\"}},\"seo\":{\"baseline_indexability\":\"NOINDEX\",\"title\":\"Page not found | RashiRemedies\",\"robots\":{\"index\":false,\"follow\":false},\"structured_data\":[]}},\"gone\":{\"context\":{\"page_id\":\"PUB-SYS-410-01\",\"page_kind\":\"SYSTEM\",\"render_mode\":\"SYSTEM\"},\"site\":{\"site_key\":\"SITE-12\",\"display_name\":\"RashiRemedies\",\"canonical_domain\":\"RashiRemedies.com\",\"home_destination\":{\"kind\":\"HOME\",\"url\":\"https://rashiremedies.com/\",\"is_external\":false,\"page_id\":\"PUB-HOME-01\"},\"default_language\":\"en\",\"locale_code\":\"en-IN\",\"timezone_id\":\"Asia/Kolkata\"},\"settings\":{\"copyright_text\":\"2026 RashiRemedies. Editorial information only.\",\"social_profiles\":[]},\"navigation\":{\"header\":{\"menu_key\":\"HEADER\",\"items\":[{\"label\":\"Home\",\"destination\":{\"kind\":\"HOME\",\"url\":\"https://rashiremedies.com/\",\"is_external\":false,\"page_id\":\"PUB-HOME-01\"},\"children\":[]},{\"label\":\"Remedy guidance\",\"destination\":{\"kind\":\"CATEGORY\",\"url\":\"https://rashiremedies.com/category/remedy-guidance\",\"is_external\":false,\"page_id\":\"PUB-CATEGORY-01\"},\"children\":[]},{\"label\":\"Traditional remedy\",\"destination\":{\"kind\":\"TAG\",\"url\":\"https://rashiremedies.com/tag/traditional-remedy\",\"is_external\":false,\"page_id\":\"PUB-TAG-01\"},\"children\":[]},{\"label\":\"About\",\"destination\":{\"kind\":\"STATIC\",\"url\":\"https://rashiremedies.com/about\",\"is_external\":false,\"page_id\":\"PUB-STATIC-ABOUT-01\"},\"children\":[]},{\"label\":\"Search\",\"destination\":{\"kind\":\"SEARCH\",\"url\":\"https://RashiRemedies.com/search\",\"is_external\":false,\"page_id\":\"PUB-SEARCH-01\"},\"children\":[]}]},\"footer\":{\"menu_key\":\"FOOTER\",\"items\":[{\"label\":\"About\",\"destination\":{\"kind\":\"STATIC\",\"url\":\"https://rashiremedies.com/about\",\"is_external\":false,\"page_id\":\"PUB-STATIC-ABOUT-01\"},\"children\":[]},{\"label\":\"Contact\",\"destination\":{\"kind\":\"STATIC\",\"url\":\"https://rashiremedies.com/contact\",\"is_external\":false,\"page_id\":\"PUB-STATIC-CONTACT-01\"},\"children\":[]},{\"label\":\"Privacy Policy\",\"destination\":{\"kind\":\"STATIC\",\"url\":\"https://rashiremedies.com/privacy-policy\",\"is_external\":false,\"page_id\":\"PUB-STATIC-PRIVACY-01\"},\"children\":[]},{\"label\":\"Terms of Use\",\"destination\":{\"kind\":\"STATIC\",\"url\":\"https://rashiremedies.com/terms-of-use\",\"is_external\":false,\"page_id\":\"PUB-STATIC-TERMS-01\"},\"children\":[]},{\"label\":\"Disclaimer\",\"destination\":{\"kind\":\"STATIC\",\"url\":\"https://rashiremedies.com/disclaimer\",\"is_external\":false,\"page_id\":\"PUB-STATIC-DISCLAIMER-01\"},\"children\":[]}]}},\"message\":{\"code\":410,\"title\":\"This page is gone\",\"body\":\"This former public locator is no longer available.\"},\"recovery\":{\"home\":{\"kind\":\"HOME\",\"url\":\"https://rashiremedies.com/\",\"is_external\":false,\"page_id\":\"PUB-HOME-01\"},\"search\":{\"kind\":\"SEARCH\",\"url\":\"https://rashiremedies.com/search\",\"is_external\":false,\"page_id\":\"PUB-SEARCH-01\"}},\"seo\":{\"baseline_indexability\":\"NOINDEX\",\"title\":\"Page gone | RashiRemedies\",\"robots\":{\"index\":false,\"follow\":false},\"structured_data\":[]}},\"neutral_not_found\":{\"context\":{\"page_id\":\"PUB-SYS-404-01\",\"page_kind\":\"SYSTEM\",\"render_mode\":\"SYSTEM\"},\"message\":{\"code\":404,\"title\":\"Page not found\",\"body\":\"The requested page is unavailable.\"},\"seo\":{\"baseline_indexability\":\"NOINDEX\",\"title\":\"Page not found\",\"robots\":{\"index\":false,\"follow\":false},\"structured_data\":[]}},\"redirects\":{\"/old-rashi-guide\":\"https://rashiremedies.com/article/shared-slug\"}}");
}),
"[project]/packages/ts/api-client-public/src/generated.ts [ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createPublicApiClient",
    ()=>createPublicApiClient,
    "publicOperationIds",
    ()=>publicOperationIds
]);
// GENERATED FILE — DO NOT EDIT.
// Source: contracts/http/BLOG-DOC-15_openapi_v1.0-RC8.yaml
// Source SHA-256: bf577a463b4c5d8fdceddc2087f53216426ef88d67d8e1a0d22ccf819751cd00
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ts$2f$api$2d$contract$2f$src$2f$index$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/ts/api-contract/src/index.ts [ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ts$2f$api$2d$contract$2f$generated$2f$operation$2d$registry$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/ts/api-contract/generated/operation-registry.ts [ssr] (ecmascript)");
;
const publicOperationIds = [
    "API15-PUB-001",
    "API15-PUB-002"
];
function appendFormData(form, key, value) {
    if (value === undefined) return;
    if (Array.isArray(value)) {
        for (const item of value)appendFormData(form, key, item);
        return;
    }
    if (value instanceof Blob) {
        form.append(key, value);
        return;
    }
    form.append(key, String(value));
}
function createBody(contentType, body, headers) {
    if (body === undefined) return undefined;
    if (contentType === "application/json") {
        if (!headers.has("Content-Type")) headers.set("Content-Type", "application/json");
        return JSON.stringify(body);
    }
    if (contentType === "multipart/form-data") {
        const form = new FormData();
        if (body && typeof body === "object") {
            for (const [key, value] of Object.entries(body))appendFormData(form, key, value);
        }
        return form;
    }
    throw new Error(`Unsupported canonical request content type: ${contentType ?? "none"}`);
}
function createPublicApiClient(config) {
    const fetchImpl = config.fetch ?? globalThis.fetch;
    if (!fetchImpl) throw new Error("No fetch implementation is available.");
    const baseUrl = config.baseUrl.endsWith("/") ? config.baseUrl : `${config.baseUrl}/`;
    return {
        async request (operationId, input, options = {}) {
            const meta = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ts$2f$api$2d$contract$2f$generated$2f$operation$2d$registry$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["operationRegistry"][operationId];
            let route = meta.path;
            const request = input;
            for (const name of meta.pathParameters){
                const value = request.path?.[name];
                if (value === undefined) throw new Error(`Missing required path parameter ${name} for ${operationId}`);
                route = route.replace(`{${name}}`, encodeURIComponent(String(value)));
            }
            if (route.includes("{")) throw new Error(`Unresolved path parameter for ${operationId}`);
            const relativeRoute = route.startsWith("/") ? route.slice(1) : route;
            const url = new URL(relativeRoute, baseUrl);
            for (const name of meta.queryParameters){
                const value = request.query?.[name];
                if (value === undefined) continue;
                if (Array.isArray(value)) {
                    for (const item of value)url.searchParams.append(name, String(item));
                } else {
                    url.searchParams.set(name, String(value));
                }
            }
            const headers = new Headers(config.defaultInit?.headers);
            for (const name of meta.headerParameters){
                const value = request.header?.[name];
                if (value !== undefined) headers.set(name, String(value));
            }
            const body = createBody(meta.requestContentType, request.body, headers);
            const requestInit = {
                ...config.defaultInit,
                method: meta.method,
                headers,
                redirect: "manual"
            };
            if (body !== undefined) requestInit.body = body;
            if (options.signal !== undefined) requestInit.signal = options.signal;
            const response = await fetchImpl(url, requestInit);
            let data = undefined;
            if (response.status !== 204) {
                const responseContentType = response.headers.get("content-type") ?? "";
                if (responseContentType.toLowerCase().includes("application/json")) data = await response.json();
            }
            return {
                status: response.status,
                data,
                headers: response.headers
            };
        }
    };
}
}),
"[project]/packages/ts/api-client-public/src/index.ts [ssr] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ts$2f$api$2d$client$2d$public$2f$src$2f$generated$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/ts/api-client-public/src/generated.ts [ssr] (ecmascript)");
;
}),
"[project]/packages/ts/api-contract/generated/operation-registry.ts [ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// GENERATED FILE — DO NOT EDIT.
// Source: contracts/http/BLOG-DOC-15_openapi_v1.0-RC8.yaml
// Source SHA-256: bf577a463b4c5d8fdceddc2087f53216426ef88d67d8e1a0d22ccf819751cd00
__turbopack_context__.s([
    "operationRegistry",
    ()=>operationRegistry
]);
const operationRegistry = {
    "API15-AUTH-001": {
        "authContext": "NONE",
        "concurrency": "NONE",
        "headerParameters": [
            "X-Request-ID"
        ],
        "idempotency": "NO",
        "method": "POST",
        "path": "/api/v1/auth/login",
        "pathParameters": [],
        "permissions": "NONE",
        "queryParameters": [],
        "rateLimitClass": "AUTH_LOGIN",
        "requestContentType": "application/json",
        "siteContext": "AUTH",
        "successStatus": 200
    },
    "API15-AUTH-002": {
        "authContext": "ADMIN_SESSION",
        "concurrency": "NONE",
        "headerParameters": [
            "X-Request-ID"
        ],
        "idempotency": "NO",
        "method": "POST",
        "path": "/api/v1/auth/logout",
        "pathParameters": [],
        "permissions": "NONE",
        "queryParameters": [],
        "rateLimitClass": "AUTH_SESSION",
        "requestContentType": null,
        "siteContext": "AUTH",
        "successStatus": 204
    },
    "API15-AUTH-003": {
        "authContext": "INVITE_SETUP_TOKEN",
        "concurrency": "NONE",
        "headerParameters": [
            "X-Request-ID"
        ],
        "idempotency": "NO",
        "method": "POST",
        "path": "/api/v1/auth/invitations/accept",
        "pathParameters": [],
        "permissions": "NONE",
        "queryParameters": [],
        "rateLimitClass": "AUTH_TOKEN",
        "requestContentType": "application/json",
        "siteContext": "AUTH",
        "successStatus": 200
    },
    "API15-AUTH-004": {
        "authContext": "INVITE_SETUP_TOKEN_OR_ADMIN_SESSION",
        "concurrency": "NONE",
        "headerParameters": [
            "X-Request-ID"
        ],
        "idempotency": "NO",
        "method": "POST",
        "path": "/api/v1/auth/password/setup",
        "pathParameters": [],
        "permissions": "NONE",
        "queryParameters": [],
        "rateLimitClass": "AUTH_TOKEN",
        "requestContentType": "application/json",
        "siteContext": "AUTH",
        "successStatus": 200
    },
    "API15-AUTH-005": {
        "authContext": "NONE",
        "concurrency": "NONE",
        "headerParameters": [
            "X-Request-ID"
        ],
        "idempotency": "NO",
        "method": "POST",
        "path": "/api/v1/auth/password-reset/request",
        "pathParameters": [],
        "permissions": "NONE",
        "queryParameters": [],
        "rateLimitClass": "AUTH_RESET_REQUEST",
        "requestContentType": "application/json",
        "siteContext": "AUTH",
        "successStatus": 202
    },
    "API15-AUTH-006": {
        "authContext": "RESET_TOKEN",
        "concurrency": "NONE",
        "headerParameters": [
            "X-Request-ID"
        ],
        "idempotency": "NO",
        "method": "POST",
        "path": "/api/v1/auth/password-reset/complete",
        "pathParameters": [],
        "permissions": "NONE",
        "queryParameters": [],
        "rateLimitClass": "AUTH_TOKEN",
        "requestContentType": "application/json",
        "siteContext": "AUTH",
        "successStatus": 204
    },
    "API15-AUTH-007": {
        "authContext": "ADMIN_SESSION_OR_INVITE_SETUP_TOKEN",
        "concurrency": "NONE",
        "headerParameters": [
            "X-Request-ID"
        ],
        "idempotency": "NO",
        "method": "POST",
        "path": "/api/v1/auth/mfa/enrollment",
        "pathParameters": [],
        "permissions": "NONE",
        "queryParameters": [],
        "rateLimitClass": "AUTH_SESSION",
        "requestContentType": "application/json",
        "siteContext": "AUTH",
        "successStatus": 200
    },
    "API15-AUTH-008": {
        "authContext": "MFA_CHALLENGE",
        "concurrency": "NONE",
        "headerParameters": [
            "X-Request-ID"
        ],
        "idempotency": "NO",
        "method": "POST",
        "path": "/api/v1/auth/mfa/verify",
        "pathParameters": [],
        "permissions": "NONE",
        "queryParameters": [],
        "rateLimitClass": "AUTH_TOKEN",
        "requestContentType": "application/json",
        "siteContext": "AUTH",
        "successStatus": 200
    },
    "API15-AUTH-009": {
        "authContext": "MFA_CHALLENGE",
        "concurrency": "NONE",
        "headerParameters": [
            "X-Request-ID"
        ],
        "idempotency": "NO",
        "method": "POST",
        "path": "/api/v1/auth/mfa/recovery",
        "pathParameters": [],
        "permissions": "NONE",
        "queryParameters": [],
        "rateLimitClass": "AUTH_TOKEN",
        "requestContentType": "application/json",
        "siteContext": "AUTH",
        "successStatus": 200
    },
    "API15-AUTH-010": {
        "authContext": "ADMIN_SESSION",
        "concurrency": "NONE",
        "headerParameters": [
            "X-Request-ID"
        ],
        "idempotency": "NO",
        "method": "POST",
        "path": "/api/v1/auth/sessions/terminate",
        "pathParameters": [],
        "permissions": "NONE",
        "queryParameters": [],
        "rateLimitClass": "AUTH_SESSION",
        "requestContentType": "application/json",
        "siteContext": "AUTH",
        "successStatus": 204
    },
    "API15-AUTH-011": {
        "authContext": "ADMIN_SESSION",
        "concurrency": "NONE",
        "headerParameters": [
            "X-Request-ID"
        ],
        "idempotency": "NO",
        "method": "POST",
        "path": "/api/v1/auth/step-up",
        "pathParameters": [],
        "permissions": "NONE",
        "queryParameters": [],
        "rateLimitClass": "AUTH_SESSION",
        "requestContentType": "application/json",
        "siteContext": "AUTH",
        "successStatus": 200
    },
    "API15-AUTH-012": {
        "authContext": "ADMIN_SESSION",
        "concurrency": "NONE",
        "headerParameters": [
            "X-Request-ID"
        ],
        "idempotency": "NO",
        "method": "GET",
        "path": "/api/v1/auth/selectable-sites",
        "pathParameters": [],
        "permissions": "authenticated ACTIVE Admin; no additional permission; result limited to authoritative current site assignments (or ACTIVE Sites for designated Super Admin)",
        "queryParameters": [],
        "rateLimitClass": "AUTH_SESSION",
        "requestContentType": null,
        "siteContext": "AUTH",
        "successStatus": 200
    },
    "API15-G-001": {
        "authContext": "ADMIN_SESSION",
        "concurrency": "NONE",
        "headerParameters": [
            "X-Request-ID"
        ],
        "idempotency": "NO",
        "method": "GET",
        "path": "/api/v1/admin/context",
        "pathParameters": [],
        "permissions": "authenticated ACTIVE Admin with at least one explicit GLOBAL permission",
        "queryParameters": [],
        "rateLimitClass": "ADMIN_READ",
        "requestContentType": null,
        "siteContext": "GLOBAL",
        "successStatus": 200
    },
    "API15-G-002": {
        "authContext": "ADMIN_SESSION",
        "concurrency": "NONE",
        "headerParameters": [
            "X-Request-ID"
        ],
        "idempotency": "NO",
        "method": "GET",
        "path": "/api/v1/admin/network/dashboard",
        "pathParameters": [],
        "permissions": "network_dashboard.view",
        "queryParameters": [],
        "rateLimitClass": "ADMIN_READ",
        "requestContentType": null,
        "siteContext": "GLOBAL",
        "successStatus": 200
    },
    "API15-G-003": {
        "authContext": "ADMIN_SESSION",
        "concurrency": "NONE",
        "headerParameters": [
            "X-Request-ID"
        ],
        "idempotency": "NO",
        "method": "GET",
        "path": "/api/v1/admin/network/posts",
        "pathParameters": [],
        "permissions": "network_dashboard.view + per-row site assignment + posts.view",
        "queryParameters": [
            "site_key",
            "status",
            "search",
            "page",
            "page_size"
        ],
        "rateLimitClass": "ADMIN_READ",
        "requestContentType": null,
        "siteContext": "GLOBAL",
        "successStatus": 200
    },
    "API15-G-010": {
        "authContext": "ADMIN_SESSION",
        "concurrency": "NONE",
        "headerParameters": [
            "X-Request-ID"
        ],
        "idempotency": "NO",
        "method": "GET",
        "path": "/api/v1/admin/sites",
        "pathParameters": [],
        "permissions": "sites.view",
        "queryParameters": [],
        "rateLimitClass": "ADMIN_READ",
        "requestContentType": null,
        "siteContext": "GLOBAL",
        "successStatus": 200
    },
    "API15-G-011": {
        "authContext": "ADMIN_SESSION",
        "concurrency": "NONE",
        "headerParameters": [
            "X-Request-ID",
            "Idempotency-Key"
        ],
        "idempotency": "REQUIRED",
        "method": "POST",
        "path": "/api/v1/admin/sites",
        "pathParameters": [],
        "permissions": "sites.view + sites.create",
        "queryParameters": [],
        "rateLimitClass": "ADMIN_SENSITIVE",
        "requestContentType": "application/json",
        "siteContext": "GLOBAL",
        "successStatus": 201
    },
    "API15-G-012": {
        "authContext": "ADMIN_SESSION",
        "concurrency": "NONE",
        "headerParameters": [
            "X-Request-ID"
        ],
        "idempotency": "NO",
        "method": "GET",
        "path": "/api/v1/admin/sites/{site_key}",
        "pathParameters": [
            "site_key"
        ],
        "permissions": "sites.view",
        "queryParameters": [],
        "rateLimitClass": "ADMIN_READ",
        "requestContentType": null,
        "siteContext": "GLOBAL",
        "successStatus": 200
    },
    "API15-G-013": {
        "authContext": "ADMIN_SESSION",
        "concurrency": "NONE",
        "headerParameters": [
            "X-Request-ID",
            "Idempotency-Key"
        ],
        "idempotency": "REQUIRED",
        "method": "PATCH",
        "path": "/api/v1/admin/sites/{site_key}",
        "pathParameters": [
            "site_key"
        ],
        "permissions": "sites.view + sites.edit",
        "queryParameters": [],
        "rateLimitClass": "ADMIN_SENSITIVE",
        "requestContentType": "application/json",
        "siteContext": "GLOBAL",
        "successStatus": 200
    },
    "API15-G-014": {
        "authContext": "ADMIN_SESSION",
        "concurrency": "NONE",
        "headerParameters": [
            "X-Request-ID",
            "Idempotency-Key"
        ],
        "idempotency": "REQUIRED",
        "method": "POST",
        "path": "/api/v1/admin/sites/{site_key}/enable",
        "pathParameters": [
            "site_key"
        ],
        "permissions": "sites.view + sites.enable",
        "queryParameters": [],
        "rateLimitClass": "ADMIN_SENSITIVE",
        "requestContentType": "application/json",
        "siteContext": "GLOBAL",
        "successStatus": 200
    },
    "API15-G-015": {
        "authContext": "ADMIN_SESSION",
        "concurrency": "NONE",
        "headerParameters": [
            "X-Request-ID",
            "Idempotency-Key"
        ],
        "idempotency": "REQUIRED",
        "method": "POST",
        "path": "/api/v1/admin/sites/{site_key}/disable",
        "pathParameters": [
            "site_key"
        ],
        "permissions": "sites.view + sites.disable",
        "queryParameters": [],
        "rateLimitClass": "ADMIN_SENSITIVE",
        "requestContentType": "application/json",
        "siteContext": "GLOBAL",
        "successStatus": 200
    },
    "API15-G-016": {
        "authContext": "ADMIN_SESSION",
        "concurrency": "NONE",
        "headerParameters": [
            "X-Request-ID",
            "Idempotency-Key"
        ],
        "idempotency": "REQUIRED",
        "method": "POST",
        "path": "/api/v1/admin/sites/{site_key}/archive",
        "pathParameters": [
            "site_key"
        ],
        "permissions": "sites.view + sites.archive",
        "queryParameters": [],
        "rateLimitClass": "ADMIN_DESTRUCTIVE",
        "requestContentType": "application/json",
        "siteContext": "GLOBAL",
        "successStatus": 200
    },
    "API15-G-017": {
        "authContext": "ADMIN_SESSION",
        "concurrency": "NONE",
        "headerParameters": [
            "X-Request-ID",
            "Idempotency-Key"
        ],
        "idempotency": "REQUIRED",
        "method": "POST",
        "path": "/api/v1/admin/sites/{site_key}/deletion-requests",
        "pathParameters": [
            "site_key"
        ],
        "permissions": "sites.view + sites.deletion_request",
        "queryParameters": [],
        "rateLimitClass": "ADMIN_DESTRUCTIVE",
        "requestContentType": "application/json",
        "siteContext": "GLOBAL",
        "successStatus": 201
    },
    "API15-G-018": {
        "authContext": "ADMIN_SESSION",
        "concurrency": "NONE",
        "headerParameters": [
            "X-Request-ID"
        ],
        "idempotency": "NO",
        "method": "GET",
        "path": "/api/v1/admin/sites/{site_key}/domains",
        "pathParameters": [
            "site_key"
        ],
        "permissions": "sites.view + sites.manage_domains",
        "queryParameters": [],
        "rateLimitClass": "ADMIN_READ",
        "requestContentType": null,
        "siteContext": "GLOBAL",
        "successStatus": 200
    },
    "API15-G-019": {
        "authContext": "ADMIN_SESSION",
        "concurrency": "NONE",
        "headerParameters": [
            "X-Request-ID",
            "Idempotency-Key"
        ],
        "idempotency": "REQUIRED",
        "method": "POST",
        "path": "/api/v1/admin/sites/{site_key}/domains",
        "pathParameters": [
            "site_key"
        ],
        "permissions": "sites.view + sites.manage_domains",
        "queryParameters": [],
        "rateLimitClass": "ADMIN_SENSITIVE",
        "requestContentType": "application/json",
        "siteContext": "GLOBAL",
        "successStatus": 201
    },
    "API15-G-020": {
        "authContext": "ADMIN_SESSION",
        "concurrency": "NONE",
        "headerParameters": [
            "X-Request-ID",
            "Idempotency-Key"
        ],
        "idempotency": "REQUIRED",
        "method": "PATCH",
        "path": "/api/v1/admin/sites/{site_key}/domains/{domain_id}",
        "pathParameters": [
            "site_key",
            "domain_id"
        ],
        "permissions": "sites.view + sites.manage_domains",
        "queryParameters": [],
        "rateLimitClass": "ADMIN_SENSITIVE",
        "requestContentType": "application/json",
        "siteContext": "GLOBAL",
        "successStatus": 200
    },
    "API15-G-021": {
        "authContext": "ADMIN_SESSION",
        "concurrency": "NONE",
        "headerParameters": [
            "X-Request-ID",
            "Idempotency-Key"
        ],
        "idempotency": "REQUIRED",
        "method": "DELETE",
        "path": "/api/v1/admin/sites/{site_key}/domains/{domain_id}",
        "pathParameters": [
            "site_key",
            "domain_id"
        ],
        "permissions": "sites.view + sites.manage_domains",
        "queryParameters": [],
        "rateLimitClass": "ADMIN_DESTRUCTIVE",
        "requestContentType": null,
        "siteContext": "GLOBAL",
        "successStatus": 204
    },
    "API15-G-022": {
        "authContext": "ADMIN_SESSION",
        "concurrency": "NONE",
        "headerParameters": [
            "X-Request-ID",
            "Idempotency-Key"
        ],
        "idempotency": "REQUIRED",
        "method": "POST",
        "path": "/api/v1/admin/sites/{site_key}/domains/{domain_id}/make-canonical",
        "pathParameters": [
            "site_key",
            "domain_id"
        ],
        "permissions": "sites.view + sites.manage_domains",
        "queryParameters": [],
        "rateLimitClass": "ADMIN_SENSITIVE",
        "requestContentType": "application/json",
        "siteContext": "GLOBAL",
        "successStatus": 200
    },
    "API15-G-030": {
        "authContext": "ADMIN_SESSION",
        "concurrency": "NONE",
        "headerParameters": [
            "X-Request-ID"
        ],
        "idempotency": "NO",
        "method": "GET",
        "path": "/api/v1/admin/admin-users",
        "pathParameters": [],
        "permissions": "admin_users.view",
        "queryParameters": [],
        "rateLimitClass": "ADMIN_READ",
        "requestContentType": null,
        "siteContext": "GLOBAL",
        "successStatus": 200
    },
    "API15-G-031": {
        "authContext": "ADMIN_SESSION",
        "concurrency": "NONE",
        "headerParameters": [
            "X-Request-ID",
            "Idempotency-Key"
        ],
        "idempotency": "REQUIRED",
        "method": "POST",
        "path": "/api/v1/admin/admin-users/invitations",
        "pathParameters": [],
        "permissions": "admin_users.view + admin_users.invite",
        "queryParameters": [],
        "rateLimitClass": "ADMIN_SENSITIVE",
        "requestContentType": "application/json",
        "siteContext": "GLOBAL",
        "successStatus": 201
    },
    "API15-G-032": {
        "authContext": "ADMIN_SESSION",
        "concurrency": "NONE",
        "headerParameters": [
            "X-Request-ID"
        ],
        "idempotency": "NO",
        "method": "GET",
        "path": "/api/v1/admin/admin-users/{admin_user_id}",
        "pathParameters": [
            "admin_user_id"
        ],
        "permissions": "admin_users.view",
        "queryParameters": [],
        "rateLimitClass": "ADMIN_READ",
        "requestContentType": null,
        "siteContext": "GLOBAL",
        "successStatus": 200
    },
    "API15-G-033": {
        "authContext": "ADMIN_SESSION",
        "concurrency": "NONE",
        "headerParameters": [
            "X-Request-ID",
            "Idempotency-Key"
        ],
        "idempotency": "REQUIRED",
        "method": "PATCH",
        "path": "/api/v1/admin/admin-users/{admin_user_id}",
        "pathParameters": [
            "admin_user_id"
        ],
        "permissions": "admin_users.view + admin_users.edit",
        "queryParameters": [],
        "rateLimitClass": "ADMIN_SENSITIVE",
        "requestContentType": "application/json",
        "siteContext": "GLOBAL",
        "successStatus": 200
    },
    "API15-G-034": {
        "authContext": "ADMIN_SESSION",
        "concurrency": "NONE",
        "headerParameters": [
            "X-Request-ID",
            "Idempotency-Key"
        ],
        "idempotency": "REQUIRED",
        "method": "POST",
        "path": "/api/v1/admin/admin-users/{admin_user_id}/enable",
        "pathParameters": [
            "admin_user_id"
        ],
        "permissions": "admin_users.view + admin_users.enable",
        "queryParameters": [],
        "rateLimitClass": "ADMIN_SENSITIVE",
        "requestContentType": "application/json",
        "siteContext": "GLOBAL",
        "successStatus": 200
    },
    "API15-G-035": {
        "authContext": "ADMIN_SESSION",
        "concurrency": "NONE",
        "headerParameters": [
            "X-Request-ID",
            "Idempotency-Key"
        ],
        "idempotency": "REQUIRED",
        "method": "POST",
        "path": "/api/v1/admin/admin-users/{admin_user_id}/disable",
        "pathParameters": [
            "admin_user_id"
        ],
        "permissions": "admin_users.view + admin_users.disable",
        "queryParameters": [],
        "rateLimitClass": "ADMIN_DESTRUCTIVE",
        "requestContentType": "application/json",
        "siteContext": "GLOBAL",
        "successStatus": 200
    },
    "API15-G-036": {
        "authContext": "ADMIN_SESSION",
        "concurrency": "NONE",
        "headerParameters": [
            "X-Request-ID",
            "Idempotency-Key"
        ],
        "idempotency": "REQUIRED",
        "method": "PUT",
        "path": "/api/v1/admin/admin-users/{admin_user_id}/site-assignments",
        "pathParameters": [
            "admin_user_id"
        ],
        "permissions": "admin_users.view + admin_users.manage_site_assignments",
        "queryParameters": [],
        "rateLimitClass": "ADMIN_SENSITIVE",
        "requestContentType": "application/json",
        "siteContext": "GLOBAL",
        "successStatus": 200
    },
    "API15-G-037": {
        "authContext": "ADMIN_SESSION",
        "concurrency": "NONE",
        "headerParameters": [
            "X-Request-ID",
            "Idempotency-Key"
        ],
        "idempotency": "REQUIRED",
        "method": "PUT",
        "path": "/api/v1/admin/admin-users/{admin_user_id}/role-assignments",
        "pathParameters": [
            "admin_user_id"
        ],
        "permissions": "admin_users.view + roles.view + roles.assign",
        "queryParameters": [],
        "rateLimitClass": "ADMIN_SENSITIVE",
        "requestContentType": "application/json",
        "siteContext": "GLOBAL",
        "successStatus": 200
    },
    "API15-G-040": {
        "authContext": "ADMIN_SESSION",
        "concurrency": "NONE",
        "headerParameters": [
            "X-Request-ID"
        ],
        "idempotency": "NO",
        "method": "GET",
        "path": "/api/v1/admin/roles",
        "pathParameters": [],
        "permissions": "roles.view",
        "queryParameters": [],
        "rateLimitClass": "ADMIN_READ",
        "requestContentType": null,
        "siteContext": "GLOBAL",
        "successStatus": 200
    },
    "API15-G-041": {
        "authContext": "ADMIN_SESSION",
        "concurrency": "NONE",
        "headerParameters": [
            "X-Request-ID",
            "Idempotency-Key"
        ],
        "idempotency": "REQUIRED",
        "method": "POST",
        "path": "/api/v1/admin/roles",
        "pathParameters": [],
        "permissions": "roles.view + roles.create",
        "queryParameters": [],
        "rateLimitClass": "ADMIN_SENSITIVE",
        "requestContentType": "application/json",
        "siteContext": "GLOBAL",
        "successStatus": 201
    },
    "API15-G-042": {
        "authContext": "ADMIN_SESSION",
        "concurrency": "NONE",
        "headerParameters": [
            "X-Request-ID"
        ],
        "idempotency": "NO",
        "method": "GET",
        "path": "/api/v1/admin/roles/{role_id}",
        "pathParameters": [
            "role_id"
        ],
        "permissions": "roles.view",
        "queryParameters": [],
        "rateLimitClass": "ADMIN_READ",
        "requestContentType": null,
        "siteContext": "GLOBAL",
        "successStatus": 200
    },
    "API15-G-043": {
        "authContext": "ADMIN_SESSION",
        "concurrency": "NONE",
        "headerParameters": [
            "X-Request-ID",
            "Idempotency-Key"
        ],
        "idempotency": "REQUIRED",
        "method": "PATCH",
        "path": "/api/v1/admin/roles/{role_id}",
        "pathParameters": [
            "role_id"
        ],
        "permissions": "roles.view + roles.edit",
        "queryParameters": [],
        "rateLimitClass": "ADMIN_SENSITIVE",
        "requestContentType": "application/json",
        "siteContext": "GLOBAL",
        "successStatus": 200
    },
    "API15-G-044": {
        "authContext": "ADMIN_SESSION",
        "concurrency": "NONE",
        "headerParameters": [
            "X-Request-ID",
            "Idempotency-Key"
        ],
        "idempotency": "REQUIRED",
        "method": "POST",
        "path": "/api/v1/admin/roles/{role_id}/retire",
        "pathParameters": [
            "role_id"
        ],
        "permissions": "roles.view + roles.retire",
        "queryParameters": [],
        "rateLimitClass": "ADMIN_DESTRUCTIVE",
        "requestContentType": "application/json",
        "siteContext": "GLOBAL",
        "successStatus": 200
    },
    "API15-G-045": {
        "authContext": "ADMIN_SESSION",
        "concurrency": "NONE",
        "headerParameters": [
            "X-Request-ID",
            "Idempotency-Key"
        ],
        "idempotency": "REQUIRED",
        "method": "POST",
        "path": "/api/v1/admin/roles/{role_id}/duplicate",
        "pathParameters": [
            "role_id"
        ],
        "permissions": "roles.view + roles.create",
        "queryParameters": [],
        "rateLimitClass": "ADMIN_SENSITIVE",
        "requestContentType": "application/json",
        "siteContext": "GLOBAL",
        "successStatus": 201
    },
    "API15-G-046": {
        "authContext": "ADMIN_SESSION",
        "concurrency": "NONE",
        "headerParameters": [
            "X-Request-ID"
        ],
        "idempotency": "NO",
        "method": "GET",
        "path": "/api/v1/admin/permissions",
        "pathParameters": [],
        "permissions": "permissions.view",
        "queryParameters": [],
        "rateLimitClass": "ADMIN_READ",
        "requestContentType": null,
        "siteContext": "GLOBAL",
        "successStatus": 200
    },
    "API15-G-050": {
        "authContext": "ADMIN_SESSION",
        "concurrency": "NONE",
        "headerParameters": [
            "X-Request-ID"
        ],
        "idempotency": "NO",
        "method": "GET",
        "path": "/api/v1/admin/audit",
        "pathParameters": [],
        "permissions": "audit.view",
        "queryParameters": [
            "actor_id",
            "site_key",
            "event_type",
            "from",
            "to",
            "page",
            "page_size"
        ],
        "rateLimitClass": "ADMIN_READ",
        "requestContentType": null,
        "siteContext": "GLOBAL",
        "successStatus": 200
    },
    "API15-G-051": {
        "authContext": "ADMIN_SESSION",
        "concurrency": "NONE",
        "headerParameters": [
            "X-Request-ID"
        ],
        "idempotency": "NO",
        "method": "GET",
        "path": "/api/v1/admin/audit/{audit_id}",
        "pathParameters": [
            "audit_id"
        ],
        "permissions": "audit.view",
        "queryParameters": [],
        "rateLimitClass": "ADMIN_READ",
        "requestContentType": null,
        "siteContext": "GLOBAL",
        "successStatus": 200
    },
    "API15-G-052": {
        "authContext": "ADMIN_SESSION",
        "concurrency": "NONE",
        "headerParameters": [
            "X-Request-ID",
            "Idempotency-Key"
        ],
        "idempotency": "REQUIRED",
        "method": "POST",
        "path": "/api/v1/admin/audit/export",
        "pathParameters": [],
        "permissions": "audit.view + audit.export",
        "queryParameters": [],
        "rateLimitClass": "AUDIT_EXPORT",
        "requestContentType": "application/json",
        "siteContext": "GLOBAL",
        "successStatus": 202
    },
    "API15-G-060": {
        "authContext": "ADMIN_SESSION",
        "concurrency": "NONE",
        "headerParameters": [
            "X-Request-ID"
        ],
        "idempotency": "NO",
        "method": "GET",
        "path": "/api/v1/admin/platform-settings",
        "pathParameters": [],
        "permissions": "platform_settings.view",
        "queryParameters": [],
        "rateLimitClass": "ADMIN_READ",
        "requestContentType": null,
        "siteContext": "GLOBAL",
        "successStatus": 200
    },
    "API15-G-061": {
        "authContext": "ADMIN_SESSION",
        "concurrency": "NONE",
        "headerParameters": [
            "X-Request-ID",
            "Idempotency-Key"
        ],
        "idempotency": "REQUIRED",
        "method": "PATCH",
        "path": "/api/v1/admin/platform-settings",
        "pathParameters": [],
        "permissions": "platform_settings.view + platform_settings.edit",
        "queryParameters": [],
        "rateLimitClass": "ADMIN_SENSITIVE",
        "requestContentType": "application/json",
        "siteContext": "GLOBAL",
        "successStatus": 200
    },
    "API15-PUB-001": {
        "authContext": "NONE",
        "concurrency": "NONE",
        "headerParameters": [
            "X-Request-ID"
        ],
        "idempotency": "NO",
        "method": "GET",
        "path": "/api/v1/public/page",
        "pathParameters": [],
        "permissions": "NONE",
        "queryParameters": [
            "path",
            "q",
            "page",
            "page_size"
        ],
        "rateLimitClass": "PUBLIC_READ",
        "requestContentType": null,
        "siteContext": "PUBLIC",
        "successStatus": 200
    },
    "API15-PUB-002": {
        "authContext": "PREVIEW_AUTHORITY",
        "concurrency": "NONE",
        "headerParameters": [
            "X-Request-ID"
        ],
        "idempotency": "NO",
        "method": "GET",
        "path": "/api/v1/public/preview/posts/{post_id}",
        "pathParameters": [
            "post_id"
        ],
        "permissions": "PREVIEW_AUTHORITY",
        "queryParameters": [],
        "rateLimitClass": "PREVIEW_READ",
        "requestContentType": null,
        "siteContext": "PREVIEW",
        "successStatus": 200
    },
    "API15-S-001": {
        "authContext": "ADMIN_SESSION",
        "concurrency": "NONE",
        "headerParameters": [
            "X-Request-ID"
        ],
        "idempotency": "NO",
        "method": "GET",
        "path": "/api/v1/admin/sites/{site_key}/context",
        "pathParameters": [
            "site_key"
        ],
        "permissions": "authenticated + active assignment",
        "queryParameters": [],
        "rateLimitClass": "ADMIN_READ",
        "requestContentType": null,
        "siteContext": "SITE",
        "successStatus": 200
    },
    "API15-S-002": {
        "authContext": "ADMIN_SESSION",
        "concurrency": "NONE",
        "headerParameters": [
            "X-Request-ID"
        ],
        "idempotency": "NO",
        "method": "GET",
        "path": "/api/v1/admin/sites/{site_key}/dashboard",
        "pathParameters": [
            "site_key"
        ],
        "permissions": "dashboard.view",
        "queryParameters": [],
        "rateLimitClass": "ADMIN_READ",
        "requestContentType": null,
        "siteContext": "SITE",
        "successStatus": 200
    },
    "API15-S-010": {
        "authContext": "ADMIN_SESSION",
        "concurrency": "NONE",
        "headerParameters": [
            "X-Request-ID"
        ],
        "idempotency": "NO",
        "method": "GET",
        "path": "/api/v1/admin/sites/{site_key}/posts",
        "pathParameters": [
            "site_key"
        ],
        "permissions": "posts.view",
        "queryParameters": [
            "status",
            "search",
            "author_id",
            "category_id",
            "tag_id",
            "page",
            "page_size",
            "sort"
        ],
        "rateLimitClass": "ADMIN_READ",
        "requestContentType": null,
        "siteContext": "SITE",
        "successStatus": 200
    },
    "API15-S-011": {
        "authContext": "ADMIN_SESSION",
        "concurrency": "NONE",
        "headerParameters": [
            "X-Request-ID",
            "Idempotency-Key"
        ],
        "idempotency": "REQUIRED",
        "method": "POST",
        "path": "/api/v1/admin/sites/{site_key}/posts",
        "pathParameters": [
            "site_key"
        ],
        "permissions": "posts.view + posts.create",
        "queryParameters": [],
        "rateLimitClass": "ADMIN_WRITE",
        "requestContentType": "application/json",
        "siteContext": "SITE",
        "successStatus": 201
    },
    "API15-S-012": {
        "authContext": "ADMIN_SESSION",
        "concurrency": "NONE",
        "headerParameters": [
            "X-Request-ID"
        ],
        "idempotency": "NO",
        "method": "GET",
        "path": "/api/v1/admin/sites/{site_key}/posts/{post_id}",
        "pathParameters": [
            "site_key",
            "post_id"
        ],
        "permissions": "posts.view",
        "queryParameters": [],
        "rateLimitClass": "ADMIN_READ",
        "requestContentType": null,
        "siteContext": "SITE",
        "successStatus": 200
    },
    "API15-S-013": {
        "authContext": "ADMIN_SESSION",
        "concurrency": "expected_version",
        "headerParameters": [
            "X-Request-ID",
            "Idempotency-Key"
        ],
        "idempotency": "REQUIRED",
        "method": "PATCH",
        "path": "/api/v1/admin/sites/{site_key}/posts/{post_id}",
        "pathParameters": [
            "site_key",
            "post_id"
        ],
        "permissions": "posts.view + posts.edit",
        "queryParameters": [],
        "rateLimitClass": "ADMIN_WRITE",
        "requestContentType": "application/json",
        "siteContext": "SITE",
        "successStatus": 200
    },
    "API15-S-014": {
        "authContext": "ADMIN_SESSION",
        "concurrency": "base_version",
        "headerParameters": [
            "X-Request-ID",
            "Idempotency-Key"
        ],
        "idempotency": "REQUIRED",
        "method": "POST",
        "path": "/api/v1/admin/sites/{site_key}/posts/{post_id}/autosaves",
        "pathParameters": [
            "site_key",
            "post_id"
        ],
        "permissions": "posts.view + posts.edit",
        "queryParameters": [],
        "rateLimitClass": "ADMIN_WRITE",
        "requestContentType": "application/json",
        "siteContext": "SITE",
        "successStatus": 201
    },
    "API15-S-015": {
        "authContext": "ADMIN_SESSION",
        "concurrency": "NONE",
        "headerParameters": [
            "X-Request-ID"
        ],
        "idempotency": "NO",
        "method": "GET",
        "path": "/api/v1/admin/sites/{site_key}/posts/{post_id}/autosaves/latest",
        "pathParameters": [
            "site_key",
            "post_id"
        ],
        "permissions": "posts.view + posts.edit",
        "queryParameters": [
            "editor_instance_id"
        ],
        "rateLimitClass": "ADMIN_READ",
        "requestContentType": null,
        "siteContext": "SITE",
        "successStatus": 200
    },
    "API15-S-016": {
        "authContext": "ADMIN_SESSION",
        "concurrency": "base_version",
        "headerParameters": [
            "X-Request-ID",
            "Idempotency-Key"
        ],
        "idempotency": "REQUIRED",
        "method": "POST",
        "path": "/api/v1/admin/sites/{site_key}/posts/{post_id}/preview-handoff",
        "pathParameters": [
            "site_key",
            "post_id"
        ],
        "permissions": "posts.view + posts.preview",
        "queryParameters": [],
        "rateLimitClass": "ADMIN_SENSITIVE",
        "requestContentType": "application/json",
        "siteContext": "SITE",
        "successStatus": 201
    },
    "API15-S-017": {
        "authContext": "ADMIN_SESSION",
        "concurrency": "expected_version",
        "headerParameters": [
            "X-Request-ID",
            "Idempotency-Key"
        ],
        "idempotency": "REQUIRED",
        "method": "POST",
        "path": "/api/v1/admin/sites/{site_key}/posts/{post_id}/schedule",
        "pathParameters": [
            "site_key",
            "post_id"
        ],
        "permissions": "posts.view + posts.edit + posts.schedule",
        "queryParameters": [],
        "rateLimitClass": "ADMIN_SENSITIVE",
        "requestContentType": "application/json",
        "siteContext": "SITE",
        "successStatus": 200
    },
    "API15-S-018": {
        "authContext": "ADMIN_SESSION",
        "concurrency": "expected_version",
        "headerParameters": [
            "X-Request-ID",
            "Idempotency-Key"
        ],
        "idempotency": "REQUIRED",
        "method": "POST",
        "path": "/api/v1/admin/sites/{site_key}/posts/{post_id}/unschedule",
        "pathParameters": [
            "site_key",
            "post_id"
        ],
        "permissions": "posts.view + posts.edit + posts.schedule",
        "queryParameters": [],
        "rateLimitClass": "ADMIN_SENSITIVE",
        "requestContentType": "application/json",
        "siteContext": "SITE",
        "successStatus": 200
    },
    "API15-S-019": {
        "authContext": "ADMIN_SESSION",
        "concurrency": "expected_version",
        "headerParameters": [
            "X-Request-ID",
            "Idempotency-Key"
        ],
        "idempotency": "REQUIRED",
        "method": "POST",
        "path": "/api/v1/admin/sites/{site_key}/posts/{post_id}/publish",
        "pathParameters": [
            "site_key",
            "post_id"
        ],
        "permissions": "posts.view + posts.edit + posts.publish",
        "queryParameters": [],
        "rateLimitClass": "ADMIN_SENSITIVE",
        "requestContentType": "application/json",
        "siteContext": "SITE",
        "successStatus": 200
    },
    "API15-S-020": {
        "authContext": "ADMIN_SESSION",
        "concurrency": "expected_version",
        "headerParameters": [
            "X-Request-ID",
            "Idempotency-Key"
        ],
        "idempotency": "REQUIRED",
        "method": "POST",
        "path": "/api/v1/admin/sites/{site_key}/posts/{post_id}/archive",
        "pathParameters": [
            "site_key",
            "post_id"
        ],
        "permissions": "posts.view + posts.archive",
        "queryParameters": [],
        "rateLimitClass": "ADMIN_SENSITIVE",
        "requestContentType": "application/json",
        "siteContext": "SITE",
        "successStatus": 200
    },
    "API15-S-021": {
        "authContext": "ADMIN_SESSION",
        "concurrency": "expected_version",
        "headerParameters": [
            "X-Request-ID",
            "Idempotency-Key"
        ],
        "idempotency": "REQUIRED",
        "method": "POST",
        "path": "/api/v1/admin/sites/{site_key}/posts/{post_id}/trash",
        "pathParameters": [
            "site_key",
            "post_id"
        ],
        "permissions": "posts.view + posts.trash",
        "queryParameters": [],
        "rateLimitClass": "ADMIN_DESTRUCTIVE",
        "requestContentType": "application/json",
        "siteContext": "SITE",
        "successStatus": 200
    },
    "API15-S-022": {
        "authContext": "ADMIN_SESSION",
        "concurrency": "expected_version",
        "headerParameters": [
            "X-Request-ID",
            "Idempotency-Key"
        ],
        "idempotency": "REQUIRED",
        "method": "POST",
        "path": "/api/v1/admin/sites/{site_key}/posts/{post_id}/restore",
        "pathParameters": [
            "site_key",
            "post_id"
        ],
        "permissions": "posts.view + posts.restore",
        "queryParameters": [],
        "rateLimitClass": "ADMIN_SENSITIVE",
        "requestContentType": "application/json",
        "siteContext": "SITE",
        "successStatus": 200
    },
    "API15-S-023": {
        "authContext": "ADMIN_SESSION",
        "concurrency": "expected_version",
        "headerParameters": [
            "X-Request-ID",
            "Idempotency-Key"
        ],
        "idempotency": "REQUIRED",
        "method": "POST",
        "path": "/api/v1/admin/sites/{site_key}/posts/{post_id}/permanent-delete",
        "pathParameters": [
            "site_key",
            "post_id"
        ],
        "permissions": "posts.view + posts.delete",
        "queryParameters": [],
        "rateLimitClass": "ADMIN_DESTRUCTIVE",
        "requestContentType": "application/json",
        "siteContext": "SITE",
        "successStatus": 204
    },
    "API15-S-024": {
        "authContext": "ADMIN_SESSION",
        "concurrency": "NONE",
        "headerParameters": [
            "X-Request-ID",
            "Idempotency-Key"
        ],
        "idempotency": "REQUIRED",
        "method": "POST",
        "path": "/api/v1/admin/sites/{site_key}/posts/{post_id}/duplicate",
        "pathParameters": [
            "site_key",
            "post_id"
        ],
        "permissions": "posts.view + posts.duplicate",
        "queryParameters": [],
        "rateLimitClass": "ADMIN_WRITE",
        "requestContentType": "application/json",
        "siteContext": "SITE",
        "successStatus": 201
    },
    "API15-S-025": {
        "authContext": "ADMIN_SESSION",
        "concurrency": "per-target expected_version where applicable",
        "headerParameters": [
            "X-Request-ID",
            "Idempotency-Key"
        ],
        "idempotency": "REQUIRED",
        "method": "POST",
        "path": "/api/v1/admin/sites/{site_key}/posts/bulk",
        "pathParameters": [
            "site_key"
        ],
        "permissions": "action-specific Post permission; security prevalidation for all targets",
        "queryParameters": [],
        "rateLimitClass": "ADMIN_SENSITIVE",
        "requestContentType": "application/json",
        "siteContext": "SITE",
        "successStatus": 200
    },
    "API15-S-026": {
        "authContext": "ADMIN_SESSION",
        "concurrency": "NONE",
        "headerParameters": [
            "X-Request-ID"
        ],
        "idempotency": "NO",
        "method": "GET",
        "path": "/api/v1/admin/sites/{site_key}/posts/{post_id}/revisions",
        "pathParameters": [
            "site_key",
            "post_id"
        ],
        "permissions": "posts.view + posts.revisions.view",
        "queryParameters": [
            "page",
            "page_size"
        ],
        "rateLimitClass": "ADMIN_READ",
        "requestContentType": null,
        "siteContext": "SITE",
        "successStatus": 200
    },
    "API15-S-027": {
        "authContext": "ADMIN_SESSION",
        "concurrency": "expected_version",
        "headerParameters": [
            "X-Request-ID",
            "Idempotency-Key"
        ],
        "idempotency": "REQUIRED",
        "method": "POST",
        "path": "/api/v1/admin/sites/{site_key}/posts/{post_id}/revisions/{revision_id}/restore",
        "pathParameters": [
            "site_key",
            "post_id",
            "revision_id"
        ],
        "permissions": "posts.view + posts.edit + posts.revisions.view + posts.revisions.restore",
        "queryParameters": [],
        "rateLimitClass": "ADMIN_SENSITIVE",
        "requestContentType": "application/json",
        "siteContext": "SITE",
        "successStatus": 200
    },
    "API15-S-028": {
        "authContext": "ADMIN_SESSION",
        "concurrency": "NONE",
        "headerParameters": [
            "X-Request-ID"
        ],
        "idempotency": "NO",
        "method": "GET",
        "path": "/api/v1/admin/sites/{site_key}/posts/{post_id}/url-history",
        "pathParameters": [
            "site_key",
            "post_id"
        ],
        "permissions": "posts.view",
        "queryParameters": [],
        "rateLimitClass": "ADMIN_READ",
        "requestContentType": null,
        "siteContext": "SITE",
        "successStatus": 200
    },
    "API15-S-030": {
        "authContext": "ADMIN_SESSION",
        "concurrency": "NONE",
        "headerParameters": [
            "X-Request-ID"
        ],
        "idempotency": "NO",
        "method": "GET",
        "path": "/api/v1/admin/sites/{site_key}/categories",
        "pathParameters": [
            "site_key"
        ],
        "permissions": "categories.view",
        "queryParameters": [],
        "rateLimitClass": "ADMIN_READ",
        "requestContentType": null,
        "siteContext": "SITE",
        "successStatus": 200
    },
    "API15-S-031": {
        "authContext": "ADMIN_SESSION",
        "concurrency": "NONE",
        "headerParameters": [
            "X-Request-ID",
            "Idempotency-Key"
        ],
        "idempotency": "REQUIRED",
        "method": "POST",
        "path": "/api/v1/admin/sites/{site_key}/categories",
        "pathParameters": [
            "site_key"
        ],
        "permissions": "categories.view + categories.create",
        "queryParameters": [],
        "rateLimitClass": "ADMIN_WRITE",
        "requestContentType": "application/json",
        "siteContext": "SITE",
        "successStatus": 201
    },
    "API15-S-032": {
        "authContext": "ADMIN_SESSION",
        "concurrency": "NONE",
        "headerParameters": [
            "X-Request-ID"
        ],
        "idempotency": "NO",
        "method": "GET",
        "path": "/api/v1/admin/sites/{site_key}/categories/{category_id}",
        "pathParameters": [
            "site_key",
            "category_id"
        ],
        "permissions": "categories.view",
        "queryParameters": [],
        "rateLimitClass": "ADMIN_READ",
        "requestContentType": null,
        "siteContext": "SITE",
        "successStatus": 200
    },
    "API15-S-033": {
        "authContext": "ADMIN_SESSION",
        "concurrency": "NONE",
        "headerParameters": [
            "X-Request-ID",
            "Idempotency-Key"
        ],
        "idempotency": "REQUIRED",
        "method": "PATCH",
        "path": "/api/v1/admin/sites/{site_key}/categories/{category_id}",
        "pathParameters": [
            "site_key",
            "category_id"
        ],
        "permissions": "categories.view + categories.edit",
        "queryParameters": [],
        "rateLimitClass": "ADMIN_WRITE",
        "requestContentType": "application/json",
        "siteContext": "SITE",
        "successStatus": 200
    },
    "API15-S-034": {
        "authContext": "ADMIN_SESSION",
        "concurrency": "NONE",
        "headerParameters": [
            "X-Request-ID",
            "Idempotency-Key"
        ],
        "idempotency": "REQUIRED",
        "method": "DELETE",
        "path": "/api/v1/admin/sites/{site_key}/categories/{category_id}",
        "pathParameters": [
            "site_key",
            "category_id"
        ],
        "permissions": "categories.view + categories.delete",
        "queryParameters": [],
        "rateLimitClass": "ADMIN_DESTRUCTIVE",
        "requestContentType": null,
        "siteContext": "SITE",
        "successStatus": 204
    },
    "API15-S-040": {
        "authContext": "ADMIN_SESSION",
        "concurrency": "NONE",
        "headerParameters": [
            "X-Request-ID"
        ],
        "idempotency": "NO",
        "method": "GET",
        "path": "/api/v1/admin/sites/{site_key}/tags",
        "pathParameters": [
            "site_key"
        ],
        "permissions": "tags.view",
        "queryParameters": [],
        "rateLimitClass": "ADMIN_READ",
        "requestContentType": null,
        "siteContext": "SITE",
        "successStatus": 200
    },
    "API15-S-041": {
        "authContext": "ADMIN_SESSION",
        "concurrency": "NONE",
        "headerParameters": [
            "X-Request-ID",
            "Idempotency-Key"
        ],
        "idempotency": "REQUIRED",
        "method": "POST",
        "path": "/api/v1/admin/sites/{site_key}/tags",
        "pathParameters": [
            "site_key"
        ],
        "permissions": "tags.view + tags.create",
        "queryParameters": [],
        "rateLimitClass": "ADMIN_WRITE",
        "requestContentType": "application/json",
        "siteContext": "SITE",
        "successStatus": 201
    },
    "API15-S-042": {
        "authContext": "ADMIN_SESSION",
        "concurrency": "NONE",
        "headerParameters": [
            "X-Request-ID"
        ],
        "idempotency": "NO",
        "method": "GET",
        "path": "/api/v1/admin/sites/{site_key}/tags/{tag_id}",
        "pathParameters": [
            "site_key",
            "tag_id"
        ],
        "permissions": "tags.view",
        "queryParameters": [],
        "rateLimitClass": "ADMIN_READ",
        "requestContentType": null,
        "siteContext": "SITE",
        "successStatus": 200
    },
    "API15-S-043": {
        "authContext": "ADMIN_SESSION",
        "concurrency": "NONE",
        "headerParameters": [
            "X-Request-ID",
            "Idempotency-Key"
        ],
        "idempotency": "REQUIRED",
        "method": "PATCH",
        "path": "/api/v1/admin/sites/{site_key}/tags/{tag_id}",
        "pathParameters": [
            "site_key",
            "tag_id"
        ],
        "permissions": "tags.view + tags.edit",
        "queryParameters": [],
        "rateLimitClass": "ADMIN_WRITE",
        "requestContentType": "application/json",
        "siteContext": "SITE",
        "successStatus": 200
    },
    "API15-S-044": {
        "authContext": "ADMIN_SESSION",
        "concurrency": "NONE",
        "headerParameters": [
            "X-Request-ID",
            "Idempotency-Key"
        ],
        "idempotency": "REQUIRED",
        "method": "DELETE",
        "path": "/api/v1/admin/sites/{site_key}/tags/{tag_id}",
        "pathParameters": [
            "site_key",
            "tag_id"
        ],
        "permissions": "tags.view + tags.delete",
        "queryParameters": [],
        "rateLimitClass": "ADMIN_DESTRUCTIVE",
        "requestContentType": null,
        "siteContext": "SITE",
        "successStatus": 204
    },
    "API15-S-045": {
        "authContext": "ADMIN_SESSION",
        "concurrency": "NONE",
        "headerParameters": [
            "X-Request-ID",
            "Idempotency-Key"
        ],
        "idempotency": "REQUIRED",
        "method": "POST",
        "path": "/api/v1/admin/sites/{site_key}/tags/{tag_id}/merge",
        "pathParameters": [
            "site_key",
            "tag_id"
        ],
        "permissions": "tags.view + tags.edit + tags.delete",
        "queryParameters": [],
        "rateLimitClass": "ADMIN_DESTRUCTIVE",
        "requestContentType": "application/json",
        "siteContext": "SITE",
        "successStatus": 200
    },
    "API15-S-050": {
        "authContext": "ADMIN_SESSION",
        "concurrency": "NONE",
        "headerParameters": [
            "X-Request-ID"
        ],
        "idempotency": "NO",
        "method": "GET",
        "path": "/api/v1/admin/sites/{site_key}/authors",
        "pathParameters": [
            "site_key"
        ],
        "permissions": "authors.view",
        "queryParameters": [],
        "rateLimitClass": "ADMIN_READ",
        "requestContentType": null,
        "siteContext": "SITE",
        "successStatus": 200
    },
    "API15-S-051": {
        "authContext": "ADMIN_SESSION",
        "concurrency": "NONE",
        "headerParameters": [
            "X-Request-ID",
            "Idempotency-Key"
        ],
        "idempotency": "REQUIRED",
        "method": "POST",
        "path": "/api/v1/admin/sites/{site_key}/authors",
        "pathParameters": [
            "site_key"
        ],
        "permissions": "authors.view + authors.create",
        "queryParameters": [],
        "rateLimitClass": "ADMIN_WRITE",
        "requestContentType": "application/json",
        "siteContext": "SITE",
        "successStatus": 201
    },
    "API15-S-052": {
        "authContext": "ADMIN_SESSION",
        "concurrency": "NONE",
        "headerParameters": [
            "X-Request-ID"
        ],
        "idempotency": "NO",
        "method": "GET",
        "path": "/api/v1/admin/sites/{site_key}/authors/{author_id}",
        "pathParameters": [
            "site_key",
            "author_id"
        ],
        "permissions": "authors.view",
        "queryParameters": [],
        "rateLimitClass": "ADMIN_READ",
        "requestContentType": null,
        "siteContext": "SITE",
        "successStatus": 200
    },
    "API15-S-053": {
        "authContext": "ADMIN_SESSION",
        "concurrency": "NONE",
        "headerParameters": [
            "X-Request-ID",
            "Idempotency-Key"
        ],
        "idempotency": "REQUIRED",
        "method": "PATCH",
        "path": "/api/v1/admin/sites/{site_key}/authors/{author_id}",
        "pathParameters": [
            "site_key",
            "author_id"
        ],
        "permissions": "authors.view + authors.edit",
        "queryParameters": [],
        "rateLimitClass": "ADMIN_WRITE",
        "requestContentType": "application/json",
        "siteContext": "SITE",
        "successStatus": 200
    },
    "API15-S-054": {
        "authContext": "ADMIN_SESSION",
        "concurrency": "NONE",
        "headerParameters": [
            "X-Request-ID",
            "Idempotency-Key"
        ],
        "idempotency": "REQUIRED",
        "method": "POST",
        "path": "/api/v1/admin/sites/{site_key}/authors/{author_id}/retire",
        "pathParameters": [
            "site_key",
            "author_id"
        ],
        "permissions": "authors.view + authors.retire",
        "queryParameters": [],
        "rateLimitClass": "ADMIN_SENSITIVE",
        "requestContentType": "application/json",
        "siteContext": "SITE",
        "successStatus": 200
    },
    "API15-S-060": {
        "authContext": "ADMIN_SESSION",
        "concurrency": "NONE",
        "headerParameters": [
            "X-Request-ID"
        ],
        "idempotency": "NO",
        "method": "GET",
        "path": "/api/v1/admin/sites/{site_key}/media",
        "pathParameters": [
            "site_key"
        ],
        "permissions": "media.view",
        "queryParameters": [
            "search",
            "mime_type",
            "usage",
            "page",
            "page_size",
            "sort"
        ],
        "rateLimitClass": "ADMIN_READ",
        "requestContentType": null,
        "siteContext": "SITE",
        "successStatus": 200
    },
    "API15-S-061": {
        "authContext": "ADMIN_SESSION",
        "concurrency": "NONE",
        "headerParameters": [
            "X-Request-ID",
            "Idempotency-Key"
        ],
        "idempotency": "REQUIRED",
        "method": "POST",
        "path": "/api/v1/admin/sites/{site_key}/media",
        "pathParameters": [
            "site_key"
        ],
        "permissions": "media.view + media.upload",
        "queryParameters": [],
        "rateLimitClass": "MEDIA_UPLOAD",
        "requestContentType": "multipart/form-data",
        "siteContext": "SITE",
        "successStatus": 201
    },
    "API15-S-062": {
        "authContext": "ADMIN_SESSION",
        "concurrency": "NONE",
        "headerParameters": [
            "X-Request-ID"
        ],
        "idempotency": "NO",
        "method": "GET",
        "path": "/api/v1/admin/sites/{site_key}/media/{media_id}",
        "pathParameters": [
            "site_key",
            "media_id"
        ],
        "permissions": "media.view",
        "queryParameters": [],
        "rateLimitClass": "ADMIN_READ",
        "requestContentType": null,
        "siteContext": "SITE",
        "successStatus": 200
    },
    "API15-S-063": {
        "authContext": "ADMIN_SESSION",
        "concurrency": "NONE",
        "headerParameters": [
            "X-Request-ID",
            "Idempotency-Key"
        ],
        "idempotency": "REQUIRED",
        "method": "PATCH",
        "path": "/api/v1/admin/sites/{site_key}/media/{media_id}",
        "pathParameters": [
            "site_key",
            "media_id"
        ],
        "permissions": "media.view + media.edit",
        "queryParameters": [],
        "rateLimitClass": "ADMIN_WRITE",
        "requestContentType": "application/json",
        "siteContext": "SITE",
        "successStatus": 200
    },
    "API15-S-064": {
        "authContext": "ADMIN_SESSION",
        "concurrency": "NONE",
        "headerParameters": [
            "X-Request-ID",
            "Idempotency-Key"
        ],
        "idempotency": "REQUIRED",
        "method": "POST",
        "path": "/api/v1/admin/sites/{site_key}/media/{media_id}/replace",
        "pathParameters": [
            "site_key",
            "media_id"
        ],
        "permissions": "media.view + media.replace",
        "queryParameters": [],
        "rateLimitClass": "MEDIA_UPLOAD",
        "requestContentType": "multipart/form-data",
        "siteContext": "SITE",
        "successStatus": 200
    },
    "API15-S-065": {
        "authContext": "ADMIN_SESSION",
        "concurrency": "NONE",
        "headerParameters": [
            "X-Request-ID",
            "Idempotency-Key"
        ],
        "idempotency": "REQUIRED",
        "method": "DELETE",
        "path": "/api/v1/admin/sites/{site_key}/media/{media_id}",
        "pathParameters": [
            "site_key",
            "media_id"
        ],
        "permissions": "media.view + media.delete",
        "queryParameters": [],
        "rateLimitClass": "ADMIN_DESTRUCTIVE",
        "requestContentType": null,
        "siteContext": "SITE",
        "successStatus": 204
    },
    "API15-S-066": {
        "authContext": "ADMIN_SESSION",
        "concurrency": "NONE",
        "headerParameters": [
            "X-Request-ID"
        ],
        "idempotency": "NO",
        "method": "GET",
        "path": "/api/v1/admin/sites/{site_key}/media/{media_id}/usage",
        "pathParameters": [
            "site_key",
            "media_id"
        ],
        "permissions": "media.view",
        "queryParameters": [],
        "rateLimitClass": "ADMIN_READ",
        "requestContentType": null,
        "siteContext": "SITE",
        "successStatus": 200
    },
    "API15-S-070": {
        "authContext": "ADMIN_SESSION",
        "concurrency": "NONE",
        "headerParameters": [
            "X-Request-ID"
        ],
        "idempotency": "NO",
        "method": "GET",
        "path": "/api/v1/admin/sites/{site_key}/navigation/menus",
        "pathParameters": [
            "site_key"
        ],
        "permissions": "navigation.view",
        "queryParameters": [],
        "rateLimitClass": "ADMIN_READ",
        "requestContentType": null,
        "siteContext": "SITE",
        "successStatus": 200
    },
    "API15-S-071": {
        "authContext": "ADMIN_SESSION",
        "concurrency": "NONE",
        "headerParameters": [
            "X-Request-ID",
            "Idempotency-Key"
        ],
        "idempotency": "REQUIRED",
        "method": "PUT",
        "path": "/api/v1/admin/sites/{site_key}/navigation/menus/{menu_key}",
        "pathParameters": [
            "site_key",
            "menu_key"
        ],
        "permissions": "navigation.view + navigation.manage",
        "queryParameters": [],
        "rateLimitClass": "ADMIN_WRITE",
        "requestContentType": "application/json",
        "siteContext": "SITE",
        "successStatus": 200
    },
    "API15-S-072": {
        "authContext": "ADMIN_SESSION",
        "concurrency": "NONE",
        "headerParameters": [
            "X-Request-ID"
        ],
        "idempotency": "NO",
        "method": "GET",
        "path": "/api/v1/admin/sites/{site_key}/homepage",
        "pathParameters": [
            "site_key"
        ],
        "permissions": "navigation.view",
        "queryParameters": [],
        "rateLimitClass": "ADMIN_READ",
        "requestContentType": null,
        "siteContext": "SITE",
        "successStatus": 200
    },
    "API15-S-073": {
        "authContext": "ADMIN_SESSION",
        "concurrency": "NONE",
        "headerParameters": [
            "X-Request-ID",
            "Idempotency-Key"
        ],
        "idempotency": "REQUIRED",
        "method": "PUT",
        "path": "/api/v1/admin/sites/{site_key}/homepage",
        "pathParameters": [
            "site_key"
        ],
        "permissions": "navigation.view + navigation.manage",
        "queryParameters": [],
        "rateLimitClass": "ADMIN_WRITE",
        "requestContentType": "application/json",
        "siteContext": "SITE",
        "successStatus": 200
    },
    "API15-S-080": {
        "authContext": "ADMIN_SESSION",
        "concurrency": "NONE",
        "headerParameters": [
            "X-Request-ID"
        ],
        "idempotency": "NO",
        "method": "GET",
        "path": "/api/v1/admin/sites/{site_key}/seo",
        "pathParameters": [
            "site_key"
        ],
        "permissions": "seo.view",
        "queryParameters": [],
        "rateLimitClass": "ADMIN_READ",
        "requestContentType": null,
        "siteContext": "SITE",
        "successStatus": 200
    },
    "API15-S-081": {
        "authContext": "ADMIN_SESSION",
        "concurrency": "NONE",
        "headerParameters": [
            "X-Request-ID",
            "Idempotency-Key"
        ],
        "idempotency": "REQUIRED",
        "method": "PATCH",
        "path": "/api/v1/admin/sites/{site_key}/seo",
        "pathParameters": [
            "site_key"
        ],
        "permissions": "seo.view + seo.edit",
        "queryParameters": [],
        "rateLimitClass": "ADMIN_WRITE",
        "requestContentType": "application/json",
        "siteContext": "SITE",
        "successStatus": 200
    },
    "API15-S-082": {
        "authContext": "ADMIN_SESSION",
        "concurrency": "NONE",
        "headerParameters": [
            "X-Request-ID"
        ],
        "idempotency": "NO",
        "method": "GET",
        "path": "/api/v1/admin/sites/{site_key}/redirects",
        "pathParameters": [
            "site_key"
        ],
        "permissions": "redirects.view",
        "queryParameters": [],
        "rateLimitClass": "ADMIN_READ",
        "requestContentType": null,
        "siteContext": "SITE",
        "successStatus": 200
    },
    "API15-S-083": {
        "authContext": "ADMIN_SESSION",
        "concurrency": "NONE",
        "headerParameters": [
            "X-Request-ID",
            "Idempotency-Key"
        ],
        "idempotency": "REQUIRED",
        "method": "POST",
        "path": "/api/v1/admin/sites/{site_key}/redirects",
        "pathParameters": [
            "site_key"
        ],
        "permissions": "redirects.view + redirects.create",
        "queryParameters": [],
        "rateLimitClass": "ADMIN_WRITE",
        "requestContentType": "application/json",
        "siteContext": "SITE",
        "successStatus": 201
    },
    "API15-S-084": {
        "authContext": "ADMIN_SESSION",
        "concurrency": "NONE",
        "headerParameters": [
            "X-Request-ID"
        ],
        "idempotency": "NO",
        "method": "GET",
        "path": "/api/v1/admin/sites/{site_key}/redirects/{redirect_id}",
        "pathParameters": [
            "site_key",
            "redirect_id"
        ],
        "permissions": "redirects.view",
        "queryParameters": [],
        "rateLimitClass": "ADMIN_READ",
        "requestContentType": null,
        "siteContext": "SITE",
        "successStatus": 200
    },
    "API15-S-085": {
        "authContext": "ADMIN_SESSION",
        "concurrency": "NONE",
        "headerParameters": [
            "X-Request-ID",
            "Idempotency-Key"
        ],
        "idempotency": "REQUIRED",
        "method": "PATCH",
        "path": "/api/v1/admin/sites/{site_key}/redirects/{redirect_id}",
        "pathParameters": [
            "site_key",
            "redirect_id"
        ],
        "permissions": "redirects.view + redirects.edit",
        "queryParameters": [],
        "rateLimitClass": "ADMIN_WRITE",
        "requestContentType": "application/json",
        "siteContext": "SITE",
        "successStatus": 200
    },
    "API15-S-086": {
        "authContext": "ADMIN_SESSION",
        "concurrency": "NONE",
        "headerParameters": [
            "X-Request-ID",
            "Idempotency-Key"
        ],
        "idempotency": "REQUIRED",
        "method": "DELETE",
        "path": "/api/v1/admin/sites/{site_key}/redirects/{redirect_id}",
        "pathParameters": [
            "site_key",
            "redirect_id"
        ],
        "permissions": "redirects.view + redirects.delete",
        "queryParameters": [],
        "rateLimitClass": "ADMIN_DESTRUCTIVE",
        "requestContentType": null,
        "siteContext": "SITE",
        "successStatus": 204
    },
    "API15-S-090": {
        "authContext": "ADMIN_SESSION",
        "concurrency": "NONE",
        "headerParameters": [
            "X-Request-ID"
        ],
        "idempotency": "NO",
        "method": "GET",
        "path": "/api/v1/admin/sites/{site_key}/search/posts",
        "pathParameters": [
            "site_key"
        ],
        "permissions": "search.view",
        "queryParameters": [
            "q",
            "status",
            "page",
            "page_size"
        ],
        "rateLimitClass": "ADMIN_READ",
        "requestContentType": null,
        "siteContext": "SITE",
        "successStatus": 200
    },
    "API15-S-091": {
        "authContext": "ADMIN_SESSION",
        "concurrency": "NONE",
        "headerParameters": [
            "X-Request-ID"
        ],
        "idempotency": "NO",
        "method": "GET",
        "path": "/api/v1/admin/sites/{site_key}/search/internal-links",
        "pathParameters": [
            "site_key"
        ],
        "permissions": "search.view",
        "queryParameters": [
            "q",
            "page",
            "page_size"
        ],
        "rateLimitClass": "ADMIN_READ",
        "requestContentType": null,
        "siteContext": "SITE",
        "successStatus": 200
    },
    "API15-S-092": {
        "authContext": "ADMIN_SESSION",
        "concurrency": "NONE",
        "headerParameters": [
            "X-Request-ID"
        ],
        "idempotency": "NO",
        "method": "GET",
        "path": "/api/v1/admin/sites/{site_key}/search/related-posts",
        "pathParameters": [
            "site_key"
        ],
        "permissions": "search.view",
        "queryParameters": [
            "post_id",
            "q",
            "page",
            "page_size"
        ],
        "rateLimitClass": "ADMIN_READ",
        "requestContentType": null,
        "siteContext": "SITE",
        "successStatus": 200
    },
    "API15-S-093": {
        "authContext": "ADMIN_SESSION",
        "concurrency": "NONE",
        "headerParameters": [
            "X-Request-ID"
        ],
        "idempotency": "NO",
        "method": "GET",
        "path": "/api/v1/admin/sites/{site_key}/search/status",
        "pathParameters": [
            "site_key"
        ],
        "permissions": "search.view",
        "queryParameters": [],
        "rateLimitClass": "ADMIN_READ",
        "requestContentType": null,
        "siteContext": "SITE",
        "successStatus": 200
    },
    "API15-S-094": {
        "authContext": "ADMIN_SESSION",
        "concurrency": "NONE",
        "headerParameters": [
            "X-Request-ID",
            "Idempotency-Key"
        ],
        "idempotency": "REQUIRED",
        "method": "POST",
        "path": "/api/v1/admin/sites/{site_key}/search/reindex",
        "pathParameters": [
            "site_key"
        ],
        "permissions": "search.view + search.reindex",
        "queryParameters": [],
        "rateLimitClass": "REINDEX",
        "requestContentType": "application/json",
        "siteContext": "SITE",
        "successStatus": 202
    },
    "API15-S-095": {
        "authContext": "ADMIN_SESSION",
        "concurrency": "NONE",
        "headerParameters": [
            "X-Request-ID"
        ],
        "idempotency": "NO",
        "method": "GET",
        "path": "/api/v1/admin/sites/{site_key}/calendar",
        "pathParameters": [
            "site_key"
        ],
        "permissions": "calendar.view",
        "queryParameters": [
            "from",
            "to",
            "status"
        ],
        "rateLimitClass": "ADMIN_READ",
        "requestContentType": null,
        "siteContext": "SITE",
        "successStatus": 200
    },
    "API15-S-096": {
        "authContext": "ADMIN_SESSION",
        "concurrency": "NONE",
        "headerParameters": [
            "X-Request-ID"
        ],
        "idempotency": "NO",
        "method": "GET",
        "path": "/api/v1/admin/sites/{site_key}/settings",
        "pathParameters": [
            "site_key"
        ],
        "permissions": "site_settings.view",
        "queryParameters": [],
        "rateLimitClass": "ADMIN_READ",
        "requestContentType": null,
        "siteContext": "SITE",
        "successStatus": 200
    },
    "API15-S-097": {
        "authContext": "ADMIN_SESSION",
        "concurrency": "NONE",
        "headerParameters": [
            "X-Request-ID",
            "Idempotency-Key"
        ],
        "idempotency": "REQUIRED",
        "method": "PATCH",
        "path": "/api/v1/admin/sites/{site_key}/settings",
        "pathParameters": [
            "site_key"
        ],
        "permissions": "site_settings.view + site_settings.edit",
        "queryParameters": [],
        "rateLimitClass": "ADMIN_WRITE",
        "requestContentType": "application/json",
        "siteContext": "SITE",
        "successStatus": 200
    }
};
}),
"[project]/packages/ts/api-contract/src/index.ts [ssr] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
;
;
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__0g7h0ge._.js.map