"use client";

import React, { useState, useEffect, FormEvent } from "react";
import { useParams } from "next/navigation";
import { ethers } from "ethers";
import Navbar from "../../../../components/navbar";
import { useWallet } from "../../../../components/WalletContext";
import ABI from "../../../../contractABI/supplyChainABI.json";
import { motion } from "framer-motion";

/* ---------------- TYPES ---------------- */
type BatchItem = {
  title: string;
  authority: string;
  location: string;
  file: File | null;
};

export default function BatchRequest() {
  const { address } = useWallet();
  const params = useParams();
  const contractAddress = params.address as string;

  const [contract, setContract] = useState<any>(null);

  const [items, setItems] = useState<BatchItem[]>([
    { title: "", authority: "", location: "", file: null },
  ]);

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  const [ipfsUris, setIpfsUris] = useState<string[]>([]);
  const [txHash, setTxHash] = useState("");

  /* ---------------- INIT ---------------- */
  useEffect(() => {
    if (!address) return;

    const init = async () => {
      const provider = new ethers.BrowserProvider(
        (window as any).ethereum
      );
      const signer = await provider.getSigner();

      const instance = new ethers.Contract(
        contractAddress,
        ABI.abi,
        signer
      );

      setContract(instance);
    };

    init();
  }, [address]);

  /* ---------------- AUTO GPS ---------------- */
  useEffect(() => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition((pos) => {
      const loc = `${pos.coords.latitude}, ${pos.coords.longitude}`;

      setItems((prev) =>
        prev.map((item) => ({ ...item, location: loc }))
      );
    });
  }, []);



  /* ---------------- ADD ITEM ---------------- */
  const addItem = () => {
    setItems([...items, { title: "", authority: "", location: "", file: null }]);
  };

  /* ---------------- UPDATE ITEM ---------------- */
  const updateItem = (index: number, field: string, value: any) => {
    const updated = [...items];
    (updated[index] as any)[field] = value;
    setItems(updated);
  };

  /* ---------------- UPLOAD ALL ---------------- */
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      setStep(2);
      setStatus("Uploading batch metadata to IPFS...");

      const uploadedUris: string[] = [];

      for (const item of items) {
  const formData = new FormData();
  formData.append("ownerAddress", contractAddress);
  formData.append("title", item.title);
  formData.append("Authority", item.authority);
  formData.append("location", item.location);
  formData.append("file", item.file!);


  const res = await fetch("http://localhost:5000/api/request", {
    method: "POST",
    body: formData,
  });

  const data = await res.json();
  uploadedUris.push(data.metadataUri);
}

      setIpfsUris(uploadedUris);
      setStep(3);
      setStatus("✅ All metadata uploaded");
    } catch {
      setStatus("❌ Batch upload failed");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- BATCH MINT ---------------- */
  const confirmBatchMint = async () => {
  try {
    if (!ipfsUris.length) {
      setStatus("❌ No metadata uploaded");
      return;
    }

    setLoading(true);
    setStatus("Minting Batch Requests On-Chain...");

    console.log("Sending:", {
      address,
      ipfsUris,
    });

    const tx = await contract.batchMintRequest(address, ipfsUris, {
      gasLimit: 3000000,
    });

    console.log("TX:", tx);

    await tx.wait();

    setTxHash(tx.hash);
    setStatus("🚀 Batch Requests Minted Successfully");
  } catch (err: any) {
    console.error("❌ FULL ERROR:", err);

    if (err?.reason) {
      setStatus("❌ " + err.reason);
    } else if (err?.message) {
      setStatus("❌ " + err.message);
    } else {
      setStatus("❌ Batch mint failed");
    }
  } finally {
    setLoading(false);
  }
};
  /* ---------------- UI ---------------- */
  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <Navbar />

      {/* Background Glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-cyan-500/10 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-4xl mx-auto px-6 pt-32 pb-20 relative z-10">

        {/* HEADER */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h1 className="text-6xl font-black">
            BATCH <span className="text-emerald-500">REQUESTS</span>
          </h1>
          <p className="text-zinc-500 text-xs font-mono mt-2 uppercase">
            Upload multiple waste proofs → Mint in one transaction
          </p>
        </motion.div>

        {/* STEP BAR */}
        <div className="mt-6 h-1 bg-white/10 rounded">
          <motion.div
            animate={{ width: `${(step / 3) * 100}%` }}
            className="h-full bg-emerald-500"
          />
        </div>

        {/* FORM */}
        {step === 1 && (
          <form onSubmit={handleSubmit} className="space-y-6 mt-8">

            {items.map((item, i) => (
              <div
                key={i}
                className="p-6 bg-zinc-900/40 border border-white/10 rounded-2xl"
              >
                <h2 className="text-sm text-zinc-400 mb-4">
                  Request #{i + 1}
                </h2>

                <input
                  placeholder="Title"
                  value={item.title}
                  onChange={(e) => updateItem(i, "title", e.target.value)}
                  className="w-full mb-3 p-3 bg-black/40 border rounded"
                />

                <input
                  placeholder="Authority"
                  value={item.authority}
                  onChange={(e) => updateItem(i, "authority", e.target.value)}
                  className="w-full mb-3 p-3 bg-black/40 border rounded"
                />

                <input
                  placeholder="Location"
                  value={item.location}
                  onChange={(e) => updateItem(i, "location", e.target.value)}
                  className="w-full mb-3 p-3 bg-black/40 border rounded"
                />

                <input
                  type="file"
                  onChange={(e) =>
                    updateItem(i, "file", e.target.files?.[0] || null)
                  }
                />
              </div>
            ))}

            <button
              type="button"
              onClick={addItem}
              className="px-6 py-2 bg-white/10 rounded"
            >
              + Add More
            </button>

            <button className="w-full py-4 bg-emerald-500 text-black rounded-xl">
              {loading ? "Uploading..." : "Upload Batch"}
            </button>
          </form>
        )}

        {/* STATUS */}
        {step >= 2 && (
          <div className="mt-6 text-center text-sm font-mono">
            {status}
          </div>
        )}

        {/* MINT */}
        {step === 3 && (
          <button
            onClick={confirmBatchMint}
            className="mt-6 w-full py-4 bg-cyan-500 text-black rounded-xl"
          >
            {loading ? "Minting..." : "Confirm Batch Mint"}
          </button>
        )}

        {/* TX */}
        {txHash && (
          <a
            href={`https://sepolia.etherscan.io/tx/${txHash}`}
            target="_blank"
            className="block mt-4 text-center text-emerald-400"
          >
            View Transaction →
          </a>
        )}
      </div>
    </div>
  );
}