import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),

    VitePWA({
      registerType: "autoUpdate",

      injectRegister: "auto",

      devOptions: {
        enabled: true,
      },

      includeAssets: [
        "favicon.svg",
        "pwa-192.png",
        "pwa-512.png",
        "maskable-icon-512.png",
      ],

      manifest: {
        id: "/",
        name: "LOVEIN POS",
        short_name: "LOVEIN",

        description: "LOVEIN POS Billing and Inventory Management System",

        theme_color: "#5B3DF5",
background_color: "#FFFFFF",

        display: "standalone",

        orientation: "landscape",

        start_url: "/",

        scope: "/",

        icons: [
          {
            src: "pwa-192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any"
          },
          {
            src: "pwa-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any"
          },
          {
            src: "maskable-icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },

      workbox: {
        cleanupOutdatedCaches: true,

        clientsClaim: true,

        skipWaiting: true,

        navigateFallback: "/index.html",

        runtimeCaching: [
          {
            urlPattern: ({ url }) =>
              url.origin === "http://localhost:5000",

            handler: "NetworkFirst",

            options: {
              cacheName: "lovein-api",

              networkTimeoutSeconds: 5,

              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24,
              },

              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },

          {
            urlPattern: ({ request }) =>
              request.destination === "image",

            handler: "CacheFirst",

            options: {
              cacheName: "images",

              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30,
              },
            },
          },

          {
            urlPattern: ({ request }) =>
              request.destination === "script" ||
              request.destination === "style",

            handler: "StaleWhileRevalidate",

            options: {
              cacheName: "assets",
            },
          },
        ],
      },
    }),
  ],
});