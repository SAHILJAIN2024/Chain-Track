import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import FormData from "form-data";
import fetch from "node-fetch";
import mime from "mime";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "../.env") });

if (!process.env.PINATA_JWT) {
  throw new Error("❌ Missing PINATA_JWT in .env");
}

const PINATA_API = "https://api.pinata.cloud/pinning";


export async function uploadFileToIPFS(filePath) {
  try {
    const fileName = path.basename(filePath);
    const fileType = mime.getType(filePath) || "application/octet-stream";

    const form = new FormData();

    form.append("file", fs.createReadStream(filePath), {
      filename: fileName,
      contentType: fileType,
    });

    form.append("pinataMetadata", JSON.stringify({ name: fileName }));

    form.append("pinataOptions", JSON.stringify({ cidVersion: 1 }));

    const res = await fetch(`${PINATA_API}/pinFileToIPFS`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PINATA_JWT}`,
        ...form.getHeaders(), 
      },
      body: form,
    });

    if (!res.ok) {
      throw new Error(await res.text());
    }

    const data = await res.json();
    console.log("✅ File uploaded:", `ipfs://${data.IpfsHash}`);
    return `ipfs://${data.IpfsHash}`;
  } catch (err) {
    console.error("❌ File upload failed:", err.message);
    throw err;
  }
}


export async function uploadMetadataToIPFS(metadata) {
  try {
    const res = await fetch(`${PINATA_API}/pinJSONToIPFS`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.PINATA_JWT}`,
      },
      body: JSON.stringify(metadata),
    });

    if (!res.ok) {
      throw new Error(await res.text());
    }

    const data = await res.json();
    console.log("✅ Metadata uploaded:", `ipfs://${data.IpfsHash}`);
    return `ipfs://${data.IpfsHash}`;
  } catch (err) {
    console.error("❌ Metadata upload failed:", err.message);
    throw err;
  }
}


export const gatewayUrl = (cidOrUri) =>
  `https://gateway.pinata.cloud/ipfs/${String(cidOrUri).replace(/^ipfs:\/\//, "")}`;



export async function ipfsToHttp(ipfsUri) {
  if (!ipfsUri) return "";
  return ipfsUri.replace("ipfs://", "https://ipfs.io/ipfs/");
}

export async function fetchIPFS(ipfsUri) {
  try {
    const url = ipfsToHttp(ipfsUri);
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch IPFS content");
    return await response.json();
  } catch (err) {
    console.error("❌ IPFS Fetch Error:", err);
    throw err;
  }
}