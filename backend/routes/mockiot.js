import express from "express";

const router = express.Router();

router.get("/mock-iot", (req, res) => {
  const random = () => Math.floor(Math.random() * 100);

  const devices = ["truck-1", "truck-2", "warehouse-1"];

  const data = devices.map((device) => ({
    deviceId: device,
    type: ["Temperature", "Humidity", "Pressure"][
      Math.floor(Math.random() * 3)
    ],
    location: `${(19 + Math.random()).toFixed(6)}, ${(72 + Math.random()).toFixed(6)}`,
    timestamp: Date.now(),
    data: `${random()} units`,
  }));

  res.json(data);
});

export default router;