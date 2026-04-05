import express from "express";
import { processInvoiceFromUrl } from "../services/ocrService.js";

const router = express.Router();

router.post("/process-token", async (req, res) => {
  try {
    const { tokenId, imageUrl } = req.body;

    const result = await processInvoiceFromUrl(imageUrl);

    res.json({
      tokenId,
      invoice: result,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Processing failed" });
  }
});

export default router;