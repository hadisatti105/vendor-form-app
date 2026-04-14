const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

const PORT = 3000;

// 🔐 Use env variable in production
const VENDOR_KEY = "950ec292-636d-4e9a-bf54-543d642206c1";

const API_URL =
  "https://ydceruncqdpznxvqzlxb.supabase.co/functions/v1/vendors-ping";

// API Route
app.post("/api/check-availability", async (req, res) => {
  try {
    const { phoneNumber, stateCode } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        error: "phoneNumber is required"
      });
    }

    const response = await axios.post(API_URL, {
      vendorKey: VENDOR_KEY,
      phoneNumber,
      stateCode
    });

    // ✅ Return FULL RAW API response
    return res.json({
      success: true,
      raw: response.data
    });

  } catch (error) {
    console.error("API ERROR:", error.response?.data || error.message);

    return res.status(500).json({
      success: false,
      error: error.response?.data || error.message
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running → http://localhost:${PORT}`);
});