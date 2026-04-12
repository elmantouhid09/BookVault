import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import cors from "cors";
import { parseStringPromise } from "xml2js";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // API Proxy Routes
  
  // Open Library
  app.get("/api/openlibrary", async (req, res) => {
    try {
      const { q } = req.query;
      const response = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(q)}&limit=10`);
      if (!response.ok) throw new Error("OpenLibrary fetch failed");
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("OpenLibrary Error:", error);
      res.status(500).json({ error: "Failed to fetch from Open Library" });
    }
  });

  // Project Gutenberg
  app.get("/api/gutenberg", async (req, res) => {
    try {
      const { q } = req.query;
      const response = await fetch(`https://gutendex.com/books/?search=${encodeURIComponent(q)}`);
      if (!response.ok) throw new Error("Gutenberg fetch failed");
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Gutenberg Error:", error);
      res.status(500).json({ error: "Failed to fetch from Gutenberg" });
    }
  });

  // arXiv
  app.get("/api/arxiv", async (req, res) => {
    try {
      const { q } = req.query;
      const response = await fetch(`https://export.arxiv.org/api/query?search_query=all:${encodeURIComponent(q)}&max_results=10`);
      if (!response.ok) throw new Error("arXiv fetch failed");
      const xmlData = await response.text();
      const result = await parseStringPromise(xmlData);
      res.json(result);
    } catch (error) {
      console.error("arXiv Error:", error);
      res.status(500).json({ error: "Failed to fetch from arXiv" });
    }
  });

  // Standard Ebooks
  app.get("/api/standardebooks", async (req, res) => {
    try {
      // Standard Ebooks OPDS feed doesn't have a direct search query parameter in the same way,
      // but we can fetch the recent or a specific feed and filter, or just use their search endpoint if available.
      // The prompt says: https://standardebooks.org/feeds/opds
      // We will fetch it and parse XML.
      const { q } = req.query;
      const response = await fetch(`https://standardebooks.org/opds/all?query=${encodeURIComponent(q)}`);
      if (!response.ok) throw new Error("Standard Ebooks fetch failed");
      const xmlData = await response.text();
      const result = await parseStringPromise(xmlData);
      res.json(result);
    } catch (error) {
      console.error("Standard Ebooks Error:", error);
      res.status(500).json({ error: "Failed to fetch from Standard Ebooks" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
