import { uploadFileToIPFS, uploadMetadataToIPFS } from "../utils/ipfs.js";
import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs/promises";

const router = express.Router();

/* ---------------- Multer Storage ---------------- */
const storage = multer.diskStorage({
  destination: "./uploads",
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    const allowed = [".png", ".jpg", ".jpeg", ".svg", ".zip", ".gif"];
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, allowed.includes(ext));
  },
});

/* ---------------- Commit Upload Endpoint ---------------- */
router.post("/commit", upload.single("file"), async (req, res) => {
  const { ownerAddress, contributor, message } = req.body;
  const file = req.file;

  try {
    let fileIpfsUri = "";

    // ✅ Step 1: Upload file to IPFS
    if (file) {
      fileIpfsUri = await uploadFileToIPFS(file.path); // returns ipfs://CID
      await fs.unlink(file.path); // delete temp file
      console.log(`🧹 Temp file deleted: ${file.path}`);
    }

    // ✅ Step 2: Prepare commit metadata
    const metadata = {
      message,
      // Reference the file as ipfs:// for canonical usage
      image: fileIpfsUri || "",
      attributes: [
        { trait_type: "Created By", value: ownerAddress },
        { trait_type: "Contributor", value: contributor },
        { trait_type: "Created At", value: new Date().toISOString() },
      ],
    };

    // ✅ Step 3: Upload metadata to IPFS
    const metadataUri = await uploadMetadataToIPFS(metadata); // returns ipfs://CID
    const metadataHttpUri = metadataUri.replace(
      "ipfs://",
      "https://ipfs.io/ipfs/"
    );

    // ✅ Step 4: Return both canonical and HTTP URIs
    res.json({
      success: true,
      fileIpfsUri,       // canonical file URI
      metadataUri,       // canonical metadata URI (use this for blockchain)
      metadataHttpUri,   // HTTP preview for frontend
    });
  } catch (error) {
    console.error("❌ Upload failed:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
