"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { ethers } from "ethers";
import Navbar from "../../../../components/navbar";
import { useWallet } from "../../../../components/WalletContext";
import ABI from "../../../../contractABI/supplyChainABI.json";
import { motion } from "framer-motion";

export default function AddCommit() {
  const { address } = useWallet();
  const params = useParams();
  const contractAddress = params.address as string;

  const [title, setTitle] = useState("");
  const [authority, setAuthority] = useState("");
  const [requestId, setRequestId] = useState("");
  const [location, setLocation] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const [contract, setContract] = useState<any>(null);
  const [ipfsUri, setIpfsUri] = useState("");
  const [status, setStatus] = useState("");
  const [txHash, setTxHash] = useState("");

  /* ---------------- INIT CONTRACT ---------------- */
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

  /* ---------------- AUTO GPS (IoT READY) ---------------- */
  useEffect(() => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition((pos) => {
      setLocation(`${pos.coords.latitude}, ${pos.coords.longitude}`);
    });
  }, []);

  /* ---------------- UPLOAD ---------------- */
  const handleUpload = async () => {
    try {
      setStatus("Uploading to IPFS...");

      const formData = new FormData();
      formData.append("ownerAddress", contractAddress);
      formData.append("title", title);
      formData.append("authority", authority);
      formData.append("location", location);
      formData.append("file", file!);

      const res = await fetch("http://localhost:5000/api/commit", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      setIpfsUri(data.metadataUri);

      setStatus("✅ Metadata Uploaded");
    } catch {
      setStatus("❌ Upload Failed");
    }
  };

  /* ---------------- MINT ---------------- */
  const mintCommit = async () => {
    try {
      setStatus("Minting On-Chain...");

      const tx = await contract.mintCommit(
        address,
        Number(requestId),
        ipfsUri
      );

      await tx.wait();
      setTxHash(tx.hash);

      setStatus("🚀 Commit Successfully Minted");
    } catch {
      setStatus("❌ Mint Failed");
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

      <div className="max-w-3xl mx-auto px-6 pt-32 pb-20 relative z-10">

        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-5xl md:text-6xl font-black tracking-tighter">
            ADD <span className="text-emerald-500">COMMIT</span>
          </h1>
          <p className="text-zinc-500 font-mono text-xs tracking-widest uppercase mt-2">
            Upload proof + mint on-chain
          </p>
        </motion.div>

        {/* FORM CARD */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-zinc-900/40 backdrop-blur-2xl border border-white/5 p-8 rounded-[2rem] space-y-6 shadow-2xl"
        >

          {/* REQUEST ID */}
          <input
            placeholder="Request ID"
            value={requestId}
            onChange={(e) => setRequestId(e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-4 focus:border-emerald-500 outline-none"
          />

          {/* TITLE */}
          <input
            placeholder="Commit Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-4 focus:border-emerald-500 outline-none"
          />

          {/* AUTHORITY */}
          <input
            placeholder="Authority / Verifier"
            value={authority}
            onChange={(e) => setAuthority(e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-4 focus:border-emerald-500 outline-none"
          />

          {/* LOCATION */}
          <input
            placeholder="GPS Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-4 focus:border-cyan-500 outline-none"
          />

          {/* FILE */}
          <div className="border border-dashed border-white/10 rounded-xl p-6 text-center hover:border-emerald-500 transition">
            <input
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="text-sm text-zinc-400"
            />
            <p className="text-xs text-zinc-600 mt-2">
              Upload proof (image / invoice / IoT snapshot)
            </p>
          </div>

          {/* BUTTONS */}
          <div className="flex gap-4">
            <button
              onClick={handleUpload}
              className="flex-1 py-4 rounded-xl bg-blue-500/20 border border-blue-500/50 hover:bg-blue-500 hover:text-black transition-all font-bold"
            >
              Upload Metadata
            </button>

            {ipfsUri && (
              <button
                onClick={mintCommit}
                className="flex-1 py-4 rounded-xl bg-emerald-500/20 border border-emerald-500/50 hover:bg-emerald-500 hover:text-black transition-all font-bold"
              >
                Mint Commit
              </button>
            )}
          </div>
        </motion.div>

        {/* STATUS PANEL */}
        {status && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-6 p-4 rounded-xl bg-black/40 border border-white/10 text-center font-mono text-sm"
          >
            {status}
          </motion.div>
        )}

        {/* TX HASH */}
        {txHash && (
          <motion.a
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            href={`https://sepolia.etherscan.io/tx/${txHash}`}
            target="_blank"
            className="block mt-4 text-center text-emerald-400 font-mono text-xs hover:underline"
          >
            View Transaction →
          </motion.a>
        )}
      </div>
    </div>
  );
}