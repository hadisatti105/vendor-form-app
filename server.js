require("dotenv").config();

const express = require("express");
const axios = require("axios");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

const PORT = process.env.PORT || 3000;
const VENDOR_KEY = process.env.VENDOR_KEY;

const API_URL =
  "https://ydceruncqdpznxvqzlxb.supabase.co/functions/v1/vendors-ping";

// ✅ DB Setup
const db = new sqlite3.Database("./leads.db", (err) => {
  if (err) console.error(err.message);
  else console.log("SQLite connected");
});

db.run(`
  CREATE TABLE IF NOT EXISTS leads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    phoneNumber TEXT,
    stateCode TEXT,
    agentAvailable INTEGER,
    transferTarget TEXT,
    agentCount INTEGER,
    timestamp TEXT,
    requestId TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// ✅ API Route
app.post("/api/check-availability", async (req, res) => {
  try {
    const { phoneNumber, stateCode } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({ error: "phoneNumber required" });
    }

    const response = await axios.post(API_URL, {
      vendorKey: VENDOR_KEY,
      phoneNumber,
      stateCode
    });

    const apiData = response.data.data;

    // ✅ Save lead
    db.run(
      `INSERT INTO leads 
      (phoneNumber, stateCode, agentAvailable, transferTarget, agentCount, timestamp, requestId)
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        phoneNumber,
        stateCode,
        apiData?.agentAvailable ? 1 : 0,
        apiData?.transferTarget || null,
        apiData?.agentCount || 0,
        apiData?.timestamp || null,
        apiData?.requestId || null
      ]
    );

    // ✅ Send cleaned response (NO TTL)
    res.json({
      success: true,
      data: {
        agentAvailable: apiData?.agentAvailable,
        transferTarget: apiData?.transferTarget,
        agentCount: apiData?.agentCount,
        timestamp: apiData?.timestamp
      }
    });

  } catch (error) {
    console.error(error.response?.data || error.message);

    res.status(500).json({
      success: false,
      error: error.response?.data || error.message
    });
  }
});

// ✅ CRM endpoint
app.get("/api/leads", (req, res) => {
  db.all("SELECT * FROM leads ORDER BY createdAt DESC", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.listen(PORT, () => {
  console.log(`Server running → http://localhost:${PORT}`);
});