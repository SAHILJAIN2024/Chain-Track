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

/* ---------------- Request Upload Endpoint ---------------- */
router.post("/request", upload.single("file"), async (req, res) => {
  const { ownerAddress, title, Authority, location } = req.body;


  const file = req.file;

  try {
    let fileIpfsUri = "";
    let fileHttpUri = "";


    /* ---------------- FILE UPLOAD ---------------- */
    if (file) {
      fileIpfsUri = await uploadFileToIPFS(file.path);
      await fs.unlink(file.path);

      fileHttpUri = fileIpfsUri.replace(
        "ipfs://",
        "https://ipfs.io/ipfs/"
      );
    }

    /* ---------------- METADATA ---------------- */
    const metadata = {
      title,
      image: fileHttpUri,
      attributes: [
        { trait_type: "Created By", value: ownerAddress },
        { trait_type: "Location", value: location },
        { trait_type: "Contributor", value: Authority },
        { trait_type: "Created At", value: new Date().toISOString() },
      ],
    };

    /* ---------------- UPLOAD METADATA ---------------- */
    const metadataUri = await uploadMetadataToIPFS(metadata);

    res.json({
      success: true,
      metadataUri: metadataUri,
    });

  } catch (error) {
    console.error("❌ Upload failed:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});
export default router;
