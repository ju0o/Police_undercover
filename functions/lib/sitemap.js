"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sitemap = void 0;
/**
 * Dynamic sitemap function scaffold.
 * Enable via FEATURES.sitemapDynamic on the client.
 */
const https_1 = require("firebase-functions/v2/https");
exports.sitemap = (0, https_1.onRequest)(async (req, res) => {
    res.set('Content-Type', 'application/xml');
    res.status(200).send(`<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url><loc>https://your-domain.example/</loc></url>
  </urlset>`);
});
