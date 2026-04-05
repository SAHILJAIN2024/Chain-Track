import express from "express";
import { uploadMetadataToIPFS } from "../utils/ipfs.js";

const router = express.Router();

/* ---------------- IoT BATCH ROUTE ---------------- */
router.post("/iot-batch", async (req, res) => {
  try {
    const iotDataArray = req.body;

    /* ❌ VALIDATION */
    if (!Array.isArray(iotDataArray) || iotDataArray.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Invalid or empty IoT data",
      });
    }

    console.log(`📡 Processing ${iotDataArray.length} IoT records`);

    const uris = [];

    /* ---------------- PROCESS EACH ITEM ---------------- */
    for (const item of iotDataArray) {
      const {
        deviceId,
        type,
        location,
        timestamp,
        data,
      } = item;

      /* 🔥 SAFE FALLBACKS */
      const safeDevice = deviceId || "Unknown Device";
      const safeType = type || "Sensor";
      const safeLocation = location || "0,0";
      const safeData = data || "No Data";

      /* ---------------- METADATA ---------------- */
      const metadata = {
        title: safeType,
        description: safeData,
        attributes: [
          {
            trait_type: "Created By",
            value: safeDevice,
          },
          {
            trait_type: "Contributor",
            value: safeDevice, // 🔥 authority = device
          },
          {
            trait_type: "Location",
            value: safeLocation,
          },
          {
            trait_type: "Timestamp",
            value: timestamp || Date.now(),
          },
          {
            trait_type: "Data",
            value: safeData,
          },
        ],
      };

      /* ---------------- UPLOAD ---------------- */
      const metadataUri = await uploadMetadataToIPFS(metadata);

      uris.push(metadataUri);
    }

    console.log("✅ Batch uploaded:", uris.length);

    /* ---------------- RESPONSE ---------------- */
    res.json({
      success: true,
      count: uris.length,
      uris,
    });

  } catch (err) {
    console.error("❌ IoT Batch Error:", err);

    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

export default router;