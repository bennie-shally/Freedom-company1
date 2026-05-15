import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, collection, query, where, getDocs, writeBatch, doc, increment, Timestamp } from "firebase/firestore";
import firebaseConfig from "./firebase-applet-config.json" with { type: "json" };

import admin from "firebase-admin";
import { getFirestore as getAdminFirestore } from "firebase-admin/firestore";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Firebase Client for Vite middleware tracking (if needed) or just use Admin for everything server-side
const firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firebase Admin
if (admin.apps.length === 0) {
  admin.initializeApp({
    projectId: firebaseConfig.projectId,
  });
}

const adminDb = admin.firestore();
// If you use a non-default database, you'd use admin.firestore(databaseId)

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Background Worker: Maturation Logic
  // Using Admin SDK to bypass security rules
  setInterval(async () => {
    try {
      const now = admin.firestore.Timestamp.now();
      const snapshot = await adminDb.collection("investments")
        .where("status", "==", "running")
        .where("endsAt", "<=", now)
        .get();

      if (snapshot.empty) return;

      console.log(`[Worker] Found ${snapshot.size} matured investments. Processing...`);

      const batch = adminDb.batch();
      let count = 0;
      
      for (const investmentDoc of snapshot.docs) {
        const inv = investmentDoc.data();
        const invId = investmentDoc.id;

        // 1. Mark as completed
        batch.update(adminDb.collection("investments").doc(invId), {
          status: "completed",
          processedAt: now
        });

        // 2. Credit User
        batch.update(adminDb.collection("users").doc(inv.userId), {
          balance: admin.firestore.FieldValue.increment(inv.totalReturn || 0),
          totalEarnings: admin.firestore.FieldValue.increment(inv.profit || 0)
        });
        count++;
      }

      if (count > 0) {
        await batch.commit();
        console.log(`[Worker] Successfully credited ${count} payouts.`);
      }
    } catch (error: any) {
      // Log more detail if it's a permission error
      console.error("[Worker] Error in maturation loop:", error.message || error);
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
