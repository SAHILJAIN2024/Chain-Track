import { uploadMetadataToIPFS, uploadFileToIPFS } from "../utils/ipfs.js";
import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs/promises";

const router = express.Router();

/* ---------------- MULTER CONFIG ---------------- */

const storage = multer.diskStorage({
  destination: "./uploads",
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // increased for images
  fileFilter: (req, file, cb) => {
    const allowed = [".png", ".jpg", ".jpeg", ".gif", ".pdf"];
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, allowed.includes(ext));
  },
});

/* ---------------- COMPLAINT ROUTE ---------------- */

router.post("/supply-chains", upload.single("file"), async (req, res) => {
  const {
    ownerAddress,
    name,
    location,
    processSteps
  } = req.body;

  const file = req.file;

  try {
    let fileIpfsUri = "";
    let fileHttpUri = "";
    

    /* -------- Upload File to IPFS -------- */

    if (file) {
      fileIpfsUri = await uploadFileToIPFS(file.path);
      await fs.unlink(file.path);
      console.log(`🧹 Temp file deleted: ${file.path}`);

      fileHttpUri = fileIpfsUri.replace("ipfs://", "https://ipfs.io/ipfs/");
    }

    /* -------- METADATA STRUCTURE -------- */

    const metadata = {
      name: name,
      image: fileHttpUri,

      attributes: [
        { trait_type: "Citizen", value: ownerAddress },
        { trait_type: "Location", value: location },
        { trait_type: "Process Steps", value: processSteps },
        {
          trait_type: "Created At",
          value: new Date().toISOString(),
        },
      ],
    };

    /* -------- Upload Metadata -------- */

    const metadataUri = await uploadMetadataToIPFS(metadata);

    const metadataHttpUri = metadataUri.replace(
      "ipfs://",
      "https://ipfs.io/ipfs/"
    );

    /* -------- RESPONSE -------- */

    res.json({
      success: true,
      metadataUri: metadataUri,
    });

  } catch (error) {
    console.error("❌ Complaint Upload Failed:", error);

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;