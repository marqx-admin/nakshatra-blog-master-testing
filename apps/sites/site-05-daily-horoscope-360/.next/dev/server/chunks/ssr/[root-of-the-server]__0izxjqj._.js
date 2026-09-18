module.exports = [
"[externals]/fs [external] (fs, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("fs", () => require("fs"));

module.exports = mod;
}),
"[externals]/react-dom [external] (react-dom, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("react-dom", () => require("react-dom"));

module.exports = mod;
}),
"[externals]/stream [external] (stream, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("stream", () => require("stream"));

module.exports = mod;
}),
"[externals]/zlib [external] (zlib, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("zlib", () => require("zlib"));

module.exports = mod;
}),
"[project]/apps/sites/site-05-daily-horoscope-360/src/pages/_app.tsx [ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>PublicSiteApp
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react/jsx-dev-runtime [external] (react/jsx-dev-runtime, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$sites$2f$site$2d$05$2d$daily$2d$horoscope$2d$360$2f$src$2f$site$2f$components$2f$runtime$2d$states$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/sites/site-05-daily-horoscope-360/src/site/components/runtime-states.tsx [ssr] (ecmascript)");
;
;
;
function PublicSiteApp({ Component, pageProps }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$sites$2f$site$2d$05$2d$daily$2d$horoscope$2d$360$2f$src$2f$site$2f$components$2f$runtime$2d$states$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["RouteLoadingIndicator"], {}, void 0, false, {
                fileName: "[project]/apps/sites/site-05-daily-horoscope-360/src/pages/_app.tsx",
                lineNumber: 6,
                columnNumber: 12
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(Component, {
                ...pageProps
            }, void 0, false, {
                fileName: "[project]/apps/sites/site-05-daily-horoscope-360/src/pages/_app.tsx",
                lineNumber: 6,
                columnNumber: 37
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/sites/site-05-daily-horoscope-360/src/pages/_app.tsx",
        lineNumber: 6,
        columnNumber: 10
    }, this);
}
}),
"[project]/apps/sites/site-05-daily-horoscope-360/src/site/components/runtime-states.tsx [ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "LoadingState",
    ()=>LoadingState,
    "RouteLoadingIndicator",
    ()=>RouteLoadingIndicator
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react/jsx-dev-runtime [external] (react/jsx-dev-runtime, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react [external] (react, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$3$2e$5_$40$types$2b$node$40$24$2e$13$2e$4_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$router$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.3.5_@types+node@24.13.4_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/router.js [ssr] (ecmascript)");
"use client";
;
;
;
function LoadingState({ label = "Loading page" }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
        className: "runtime-loading",
        role: "status",
        "aria-live": "polite",
        "aria-busy": "true",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                className: "loading-indicator",
                "aria-hidden": "true"
            }, void 0, false, {
                fileName: "[project]/apps/sites/site-05-daily-horoscope-360/src/site/components/runtime-states.tsx",
                lineNumber: 7,
                columnNumber: 93
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                children: label
            }, void 0, false, {
                fileName: "[project]/apps/sites/site-05-daily-horoscope-360/src/site/components/runtime-states.tsx",
                lineNumber: 7,
                columnNumber: 150
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/sites/site-05-daily-horoscope-360/src/site/components/runtime-states.tsx",
        lineNumber: 7,
        columnNumber: 10
    }, this);
}
function RouteLoadingIndicator() {
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$3$2e$5_$40$types$2b$node$40$24$2e$13$2e$4_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$router$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["useRouter"])();
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(false);
    (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useEffect"])(()=>{
        const start = ()=>setLoading(true);
        const done = ()=>setLoading(false);
        router.events.on("routeChangeStart", start);
        router.events.on("routeChangeComplete", done);
        router.events.on("routeChangeError", done);
        return ()=>{
            router.events.off("routeChangeStart", start);
            router.events.off("routeChangeComplete", done);
            router.events.off("routeChangeError", done);
        };
    }, [
        router
    ]);
    return loading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
        className: "route-loading-layer",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(LoadingState, {
            label: "Loading the next page"
        }, void 0, false, {
            fileName: "[project]/apps/sites/site-05-daily-horoscope-360/src/site/components/runtime-states.tsx",
            lineNumber: 25,
            columnNumber: 57
        }, this)
    }, void 0, false, {
        fileName: "[project]/apps/sites/site-05-daily-horoscope-360/src/site/components/runtime-states.tsx",
        lineNumber: 25,
        columnNumber: 20
    }, this) : null;
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__0izxjqj._.js.map