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

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: firebaseConfig.projectId
  });
}

async function startServer() {
  const app = express();
  const PORT = 3000;
  
  // Initialize adminDb inside startServer to ensure initialization
  const adminDb = admin.firestore();

  app.use(express.json());
  
  // Debug middleware to log all API requests
  app.use("/api", (req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
  });

  // Helper to get Apps Script URL from Firestore
  async function getAppsScriptUrl() {
    try {
      const settingsDoc = await getDoc(doc(db, "settings", "general"));
      return settingsDoc.data()?.appsScriptUrl;
    } catch (error) {
      console.error("Error fetching Apps Script URL:", error);
      return null;
    }
  }

  // Helper to verify passcode against Apps Script
  async function verifyWithAppsScript(passcode: string) {
    const appsScriptUrl = await getAppsScriptUrl();
    if (!appsScriptUrl) {
      console.error("Apps Script URL not configured.");
      return { success: false, error: "Apps Script URL not configured in settings." };
    }

    try {
      const response = await axios.post(appsScriptUrl, { 
        action: "verify", 
        passcode: passcode 
      });
      // GAS returns JSON in the response.data
      return response.data;
    } catch (error) {
      console.error("Apps Script Verification failed:", error);
      return { success: false, error: "Connection to Apps Script failed." };
    }
  }

  // API Route: Admin Password Verification
  app.post("/api/admin/login", async (req, res) => {
    const { passcode } = req.body;
    
    console.log("Login attempt received via Apps Script proxy");
    
    if (!passcode) {
      return res.status(400).json({ error: "Passcode is required." });
    }

    const verification = await verifyWithAppsScript(passcode);
    
    if (verification.success) {
      console.log("Login successful for admin via Apps Script");
      res.json({ success: true, email: "botassist.org@gmail.com" });
    } else {
      console.log("Login failed: Invalid passcode via Apps Script", verification.error);
      res.status(401).json({ success: false, error: verification.error || "Invalid passcode" });
    }
  });

  // API Route: Secure Admin Write Proxy
  app.post("/api/admin/proxy-write", async (req, res) => {
    const { passcode, collection, docId, data } = req.body;

    const verification = await verifyWithAppsScript(passcode);
    if (!verification.success) {
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

    const verification = await verifyWithAppsScript(passcode);
    if (!verification.success) {
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
      const appsScriptUrl = await getAppsScriptUrl();

      if (!appsScriptUrl) {
        console.warn("Apps Script URL not configured in Site Engine settings. Skipping notification.");
        return res.json({ 
          success: true, 
          message: "Order logged. Apps Script notification skipped (URL missing in Admin Panel)." 
        });
      }

      // 2. Send POST request to Google Apps Script
      await axios.post(appsScriptUrl, orderDetails);
      
      console.log("Notification sent to Apps Script successfully.");
      res.json({ success: true, message: "Notification dispatched to Apps Script" });
    } catch (error) {
      console.error("Apps Script Notification Error:", error);
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
