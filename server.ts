import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import axios from "axios";
import dotenv from "dotenv";
import * as admin from "firebase-admin";
import { doc, getDoc } from "firebase/firestore";
import { db } from "./src/lib/firebase";
// @ts-ignore
import firebaseConfig from "./firebase-applet-config.json";

dotenv.config();

// Initialize Firebase Admin for server-side trusted operations
// This uses Application Default Credentials in Cloud Run
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: firebaseConfig.projectId
  });
}

const adminDb = admin.firestore();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route: Admin Password Verification
  app.post("/api/admin/login", (req, res) => {
    const { passcode } = req.body;
    const secret = process.env.VITE_ADMIN_PASSCODE;
    
    if (!secret) {
      return res.status(500).json({ error: "ADMIN_PASSCODE not set on server." });
    }
    
    if (passcode === secret) {
      res.json({ success: true, email: "botassist.org@gmail.com" });
    } else {
      res.status(401).json({ success: false, error: "Invalid passcode" });
    }
  });

  // API Route: Secure Admin Write Proxy
  // Bypasses browser-side Firebase Auth domain issues
  app.post("/api/admin/proxy-write", async (req, res) => {
    const { passcode, collection, docId, data } = req.body;
    const secret = process.env.VITE_ADMIN_PASSCODE;

    if (!secret || passcode !== secret) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      if (docId) {
        await adminDb.collection(collection).doc(docId).set(data, { merge: true });
      } else {
        await adminDb.collection(collection).add(data);
      }
      res.json({ success: true });
    } catch (error: any) {
      console.error("Proxy Write Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // API Route: Secure Admin Delete Proxy
  app.post("/api/admin/proxy-delete", async (req, res) => {
    const { passcode, collection, docId } = req.body;
    const secret = process.env.VITE_ADMIN_PASSCODE;

    if (!secret || passcode !== secret) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      await adminDb.collection(collection).doc(docId).delete();
      res.json({ success: true });
    } catch (error: any) {
      console.error("Proxy Delete Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // API Route: Send Order Notification via Google Apps Script
  app.post("/api/notify-order", async (req, res) => {
    const { orderDetails } = req.body;

    if (!orderDetails) {
      return res.status(400).json({ error: "Order details are missing" });
    }

    try {
      // 1. Fetch Apps Script URL from Firestore
      const settingsDoc = await getDoc(doc(db, "settings", "general"));
      const settings = settingsDoc.data();
      const appsScriptUrl = settings?.appsScriptUrl;

      if (!appsScriptUrl) {
        console.warn("Apps Script URL not configured in Site Engine settings. Skipping notification.");
        return res.json({ 
          success: true, 
          message: "Order logged. Apps Script notification skipped (URL missing in Admin Panel)." 
        });
      }

      // 2. Send POST request to Google Apps Script
      // AXIOS is used because it handles redirects (GAS uses 302/307 redirects)
      await axios.post(appsScriptUrl, orderDetails);
      
      console.log("Notification sent to Apps Script successfully.");
      res.json({ success: true, message: "Notification dispatched to Apps Script" });
    } catch (error) {
      console.error("Apps Script Notification Error:", error);
      // We return success true anyway because the order IS created in Firestore
      res.json({ 
        success: true, 
        message: "Order logged but Apps Script notification failed." 
      });
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
