import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: null, // we register manually with iframe/preview guards
      devOptions: {
        enabled: false,
      },
      includeAssets: ["hymns-icon-192.png", "hymns-icon-512.png"],
      manifest: {
        name: "UCOCSA Hymns",
        short_name: "Hymns",
        description: "UCOCSA Hymnal — sing, search and read hymns offline.",
        start_url: "/hymns",
        scope: "/hymns",
        display: "standalone",
        background_color: "#FFF8E7",
        theme_color: "#1F3A2E",
        orientation: "portrait",
        icons: [
          {
            src: "/hymns-icon-192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any maskable",
          },
          {
            src: "/hymns-icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },
      workbox: {
        // Never cache OAuth or admin/api edge calls
        navigateFallback: "/hymns",
        navigateFallbackDenylist: [
          /^\/~oauth/,
          /^\/admin/,
          /^\/auth/,
          /^\/api/,
        ],
        runtimeCaching: [
          {
            // Hymn data from Supabase: network-first, fall back to cache offline
            urlPattern: ({ url }) =>
              url.hostname.endsWith("supabase.co") &&
              url.pathname.includes("/rest/v1/hymns"),
            handler: "NetworkFirst",
            options: {
              cacheName: "hymns-data",
              networkTimeoutSeconds: 4,
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: ({ request }) => request.destination === "image",
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "hymn-images",
              expiration: { maxEntries: 60, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime", "@tanstack/react-query", "@tanstack/query-core"],
  },
}));
