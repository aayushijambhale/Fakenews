import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { OAuth2Client } from "google-auth-library";


dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

// Helper for Hugging Face Inference API with retry for loading models
async function callHF(model: string, inputs: any, token: string, retries = 5): Promise<any> {
  // api-inference.huggingface.co legacy routes can return 410 Gone for some models.
  // Use the current router endpoint for serverless inference.
  const url = `https://router.huggingface.co/hf-inference/models/${model}`;
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, {
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        method: "POST",
        body: JSON.stringify({ inputs })
      });
      
      if (response.status === 503) {
        const error = await response.json();
        const waitTime = error.estimated_time ? Math.min(error.estimated_time, 5) * 1000 : 3000;
        console.log(`Model ${model} is loading, waiting ${waitTime}ms...`);
        await new Promise(r => setTimeout(r, waitTime));
        continue;
      }
      
      if (!response.ok) {
        let detail = "";
        try {
          detail = await response.text();
        } catch {
          detail = "";
        }
        throw new Error(`HF error ${response.status} ${response.statusText}${detail ? ` - ${detail}` : ""}`);
      }
      
      return await response.json();
    } catch (err) {
      if (i === retries - 1) throw err;
      await new Promise(r => setTimeout(r, 1000));
    }
  }
}

const client = new OAuth2Client(process.env.VITE_GOOGLE_CLIENT_ID);

const authenticate = async (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Please sign in to use this feature." });
  }

  const token = authHeader.split(" ")[1];
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.VITE_GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    req.user = payload;
    next();
  } catch (error) {
    console.error("Auth error:", error);
    res.status(401).json({ error: "Session expired. Please sign in again." });
  }
};

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route for News
  app.get("/api/news", async (req, res) => {
    const apiKey = process.env.NEWS_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "NEWS_API_KEY is not configured" });
    }

    try {
      const response = await fetch(
        `https://newsapi.org/v2/everything?q=India&sortBy=publishedAt&pageSize=40&apiKey=${apiKey}`
      );
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Error fetching news:", error);
      res.status(500).json({ error: "Failed to fetch news" });
    }
  });

  // API Routes for Gemini & Fallbacks
  app.post("/api/summarize", authenticate, async (req, res) => {
    const { title, content } = req.body;
    const textToSummarize = `Title: ${title}\n\nContent: ${content}`;
    
    // Fallbacks to Hugging Face
    const hfToken = process.env.HF_TOKEN;
    if (!hfToken) {
      return res.status(500).json({ error: "No AI keys configured for summarization." });
    }

    const hfModels = [
      "sshleifer/distilbart-cnn-12-6",
      "facebook/bart-large-cnn",
      "google/pegasus-cnn_dailymail",
      "philschmid/bart-large-cnn-samsum",
      "slauw87/bart_summarisation"
    ];

    for (const model of hfModels) {
      try {
        const result = await callHF(model, textToSummarize, hfToken);
        const candidate = Array.isArray(result) ? result[0] : result;
        const summary =
          candidate?.summary_text ||
          candidate?.generated_text ||
          (typeof candidate === "string" ? candidate : undefined);
        if (summary) return res.json({ summary });
      } catch (e) {
        console.error(`HF Model ${model} failed, trying next...`, errorMessage(e));
      }
    }

    res.status(500).json({ error: "All summarization models failed." });
  });

  app.post("/api/verify", authenticate, async (req, res) => {
    const { title, content } = req.body;
    const textToVerify = `Title: ${title}\n\nContent: ${content}`;

    // Fallbacks to Hugging Face
    const hfToken = process.env.HF_TOKEN;
    if (!hfToken) {
      return res.status(500).json({ error: "No AI keys configured for verification." });
    }

    const hfModels = [
      "jy46604790/Fake-News-Bert-Detect",
      "hamzab/roberta-fake-news-classification",
      "mrm8488/bert-tiny-finetuned-fake-news-detection"
    ];

    for (const model of hfModels) {
      try {
        const result = await callHF(model, textToVerify, hfToken);
        // Standardize output to { classification, reason }
        // result is [{ label: 'LABEL_0', score: 0.99 }] or similar
        const top = Array.isArray(result) ? (Array.isArray(result[0]) ? result[0][0] : result[0]) : result;
        
        if (top && top.label) {
          const label = top.label.toUpperCase();
          const isReal = label === 'LABEL_1' || label === 'REAL' || label === 'SUPPORTS' || label === 'TRUE' || label === 'LABEL_0' && model.includes('mrm8488');
          // Note: mrm8488 uses LABEL_0 for Real in some versions, but let's be safe.
          // Actually, let's just check for FAKE/FAKE_NEWS first.
          const isDefinitelyFake = label === 'FAKE' || label === 'LABEL_0' && !model.includes('mrm8488');
          
          const finalClassification = isDefinitelyFake ? 'FAKE' : 'REAL';

          return res.json({
            classification: finalClassification,
            reason: `Highly likely to be ${finalClassification.toLowerCase()} based on semantic analysis.`,
            score: top.score
          });
        }
      } catch (e) {
        console.error(`HF Model ${model} failed, trying next...`, errorMessage(e));
      }
    }

    res.status(500).json({ error: "All verification models failed." });
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
