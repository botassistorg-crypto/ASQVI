import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import axios from "axios";
import dotenv from "dotenv";
import { doc, getDoc } from "firebase/firestore";
import { db } from "./src/lib/firebase";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

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
