import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, collection, query, where, getDocs, writeBatch, doc, increment, Timestamp } from "firebase/firestore";
import firebaseConfig from "./firebase-applet-config.json" with { type: "json" };

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Firebase for the server worker
const firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(firebaseApp);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Background Worker: Maturation Logic
  // This runs every 60 seconds to credit profits even if users are offline
  setInterval(async () => {
    try {
      const now = Timestamp.now();
      const q = query(
        collection(db, "investments"),
        where("status", "==", "running"),
        where("endsAt", "<=", now)
      );

      const snapshot = await getDocs(q);
      if (snapshot.empty) return;

      console.log(`[Worker] Found ${snapshot.size} matured investments. Processing...`);

      const batch = writeBatch(db);
      
      for (const investmentDoc of snapshot.docs) {
        const inv = investmentDoc.data();
        const invId = investmentDoc.id;

        // 1. Mark as completed
        batch.update(doc(db, "investments", invId), {
          status: "completed",
          processedAt: now
        });

        // 2. Credit User
        batch.update(doc(db, "users", inv.userId), {
          balance: increment(inv.totalReturn || 0),
          totalEarnings: increment(inv.profit || 0)
        });
      }

      await batch.commit();
      console.log(`[Worker] Successfully credited ${snapshot.size} payouts.`);
    } catch (error) {
      console.error("[Worker] Error in maturation loop:", error);
    }
  }, 60000); // 1 minute interval

  app.use(express.json());

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", worker: "active" });
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
