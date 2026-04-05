import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import {ethers} from "ethers";
import repo from "./routes/repo.route.js";
import commitRoutes from "./routes/commit.route.js";
import requestRoutes from "./routes/request.route.js";
import invoice from "./routes/invoice.js";
import iot from "./routes/iot.js"
import mock from "./routes/mockiot.js"
// ✅ Environment Variables

const app = express();
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));
app.use(express.json());


app.use("/api",repo);
app.use("/api", commitRoutes);
app.use("/api", requestRoutes);
app.use("/api", invoice);
app.use("/api", iot);
app.use("/api", mock);

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`✅ Metadata uploader running at http://localhost:${port}`);
});



