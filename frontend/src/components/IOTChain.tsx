"use client";

import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import Navbar from "../components/navbar";
import { useWallet } from "../components/WalletContext";
import FACTORY_ABI from "../contractABI/contractABI.json";
import CHAIN_ABI from "../contractABI/ABI.json";

/* ---------------- TYPES ---------------- */

interface IoTData {
  deviceId: string;
  type: string;
  location: string;
  timestamp: number;
  data: string;
}

export default function CreateIOTSupplyChain() {
  const { address } = useWallet();

  const [factory, setFactory] = useState<any>(null);
  const [chainContract, setChainContract] = useState<any>(null);

  const [name, setName] = useState("");
  const [iotApi, setIotApi] = useState("");

  /* 🔥 STREAM BUFFER */
  const [iotBuffer, setIotBuffer] = useState<IoTData[]>([]);

  const [intervalId, setIntervalId] = useState<any>(null);

  const [uris, setUris] = useState<string[]>([]);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const FACTORY_ADDRESS = "0xf2F76eFB368c56817ED0bdeEFC7689DC859Eb467";

  /* ---------------- INIT ---------------- */

  useEffect(() => {
    if (!address) return;

    const init = async () => {
      const provider = new ethers.BrowserProvider(
        (window as any).ethereum
      );
      const signer = await provider.getSigner();

      const factoryInstance = new ethers.Contract(
        FACTORY_ADDRESS,
        FACTORY_ABI.abi,
        signer
      );

      setFactory(factoryInstance);
    };

    init();
  }, [address]);

  /* ---------------- START STREAM ---------------- */

  const startStream = () => {
    if (!iotApi) return;

    setStatus("📡 Starting IoT stream...");

    const id = setInterval(async () => {
      try {
        const res = await fetch(iotApi);
        const data = await res.json();

        setIotBuffer((prev) => [...prev, ...data]);

        setStatus(`📥 Received ${data.length} new records`);
      } catch {
        setStatus("❌ Stream error");
      }
    }, 3000); // every 3 sec

    setIntervalId(id);
  };

  /* ---------------- STOP STREAM ---------------- */

  const stopStream = () => {
    clearInterval(intervalId);
    setStatus("⏹️ Stream stopped");
  };

  /* ---------------- DEPLOY CHAIN ---------------- */

  const deployChain = async () => {
    try {
      setLoading(true);
      setStatus("Deploying chain...");

      const tx = await factory.createSupplyChain(
        name,
        address,
        [address],
        [address]
      );

      const receipt = await tx.wait();

      let deployed = "";

      for (const log of receipt.logs) {
        try {
          const parsed = factory.interface.parseLog(log);
          if (parsed.name === "SupplyChainCreated") {
            deployed = parsed.args.contractAddress;
          }
        } catch {}
      }

      const provider = new ethers.BrowserProvider(
        (window as any).ethereum
      );
      const signer = await provider.getSigner();

      const chain = new ethers.Contract(
        deployed,
        CHAIN_ABI.abi,
        signer
      );

      setChainContract(chain);

      setStatus(`✅ Chain deployed: ${deployed}`);
    } catch (err: any) {
      setStatus("❌ Deploy failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- PROCESS IoT → IPFS ---------------- */

  const processBatch = async () => {
    try {
      if (!iotBuffer.length) {
        setStatus("❌ No IoT data");
        return;
      }

      setStatus("⚙️ Processing IoT batch...");

      const res = await fetch("https://chain-track.onrender.com/api/iot-batch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(iotBuffer),
      });

      const data = await res.json();

      setUris(data.uris);

      setStatus(`✅ ${data.uris.length} metadata created`);
    } catch {
      setStatus("❌ Processing failed");
    }
  };

  /* ---------------- BATCH MINT ---------------- */

  const mintBatch = async () => {
    try {
      if (!chainContract || !uris.length) {
        setStatus("❌ Missing contract or URIs");
        return;
      }

      setLoading(true);
      setStatus("⛓️ Minting on-chain...");

      const tx = await chainContract.batchMintRequest(
        address,
        uris,
        { gasLimit: 5000000 }
      );

      await tx.wait();

      setStatus("🚀 IoT Batch Minted Successfully");
    } catch (err: any) {
      setStatus("❌ Mint failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- UI ---------------- */

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <Navbar />

      <div className="max-w-4xl mx-auto pt-32 space-y-6">

        <h1 className="text-5xl font-bold">
          IOT <span className="text-emerald-500">PIPELINE</span>
        </h1>

        <input
          placeholder="Chain Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-3 bg-black rounded"
        />

        <input
          placeholder="IoT API URL"
          value={iotApi}
          onChange={(e) => setIotApi(e.target.value)}
          className="w-full p-3 bg-black rounded"
        />

        <div className="flex gap-4">
          <button onClick={startStream} className="bg-emerald-500 px-4 py-2">
            Start Stream
          </button>

          <button onClick={stopStream} className="bg-red-500 px-4 py-2">
            Stop Stream
          </button>
        </div>

        <div className="text-xs bg-black p-4 max-h-40 overflow-y-auto">
          Buffer Size: {iotBuffer.length}
        </div>

        <button onClick={deployChain} className="bg-emerald-500 px-4 py-2">
          Deploy Chain
        </button>

        <button onClick={processBatch} className="bg-black px-4 py-2">
          Process Batch → IPFS
        </button>

        <button onClick={mintBatch} className="bg-emerald-500 px-4 py-2">
          Mint Batch
        </button>

        <div className="text-center text-sm mt-4">{status}</div>
      </div>
    </div>
  );
}