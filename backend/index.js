import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import {ethers} from "ethers";
import repo from "./routes/repo.route.js";
import commitRoutes from "./routes/commit.route.js";
// ✅ Environment Variables

const app = express();
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));
app.use(express.json());


app.use("/api",repo);
app.use("/api", commitRoutes);

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`✅ Metadata uploader running at http://localhost:${port}`);
});



