"use client";

import React, { useState, useEffect, FormEvent } from "react";
import { useParams } from "next/navigation";
import { ethers } from "ethers";
import Navbar from "../../../../components/navbar";
import { useWallet } from "../../../../components/WalletContext";
import ABI from "../../../../contractABI/supplyChainABI.json";
import { motion } from "framer-motion";

export default function CreateRequest() {
  const { address } = useWallet();
  const params = useParams();
  const contractAddress = params.address as string;

  const [contract, setContract] = useState<any>(null);

  const [title, setTitle] = useState("");
  const [authority, setAuthority] = useState("");
  const [location, setLocation] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [processSteps, setProcessSteps] = useState<string[]>(["Manufacturer"]);

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  const [ipfsUri, setIpfsUri] = useState("");
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
      setLocation(`${pos.coords.latitude}, ${pos.coords.longitude}`);
    });
  }, []);

  const PROCESS_OPTIONS = [
  "Manufacturer",
  "Supplier",
  "Transporter",
  "Warehouse",
  "Distributor",
  "Retailer",
  "Customer",
];

const handleProcessChange = (index: number, value: string) => {
  const updated = [...processSteps];
  updated[index] = value;
  setProcessSteps(updated);
};

const addProcessStep = () => {
  setProcessSteps([...processSteps, "Supplier"]);
};

const removeProcessStep = (index: number) => {
  const updated = processSteps.filter((_, i) => i !== index);
  setProcessSteps(updated);
};

  /* ---------------- UPLOAD ---------------- */
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      setStep(2);
      setStatus("Uploading metadata to IPFS...");

      const formData = new FormData();
      formData.append("ownerAddress", contractAddress);
      formData.append("title", title);
      formData.append("Authority", authority);
      formData.append("location", location);
      formData.append("file", file!);
      formData.append("processSteps", JSON.stringify(processSteps));

      const res = await fetch("http://localhost:5000/api/request", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      setIpfsUri(data.metadataUri);
      setStep(3);
      setStatus("✅ Metadata Uploaded");
    } catch {
      setStatus("❌ Upload failed");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- MINT ---------------- */
  const confirmMint = async () => {
    try {
      setLoading(true);
      setStatus("Minting Request On-Chain...");

      const tx = await contract.mintRequest(address, ipfsUri);
      await tx.wait();

      setTxHash(tx.hash);
      setStatus("🚀 Request Successfully Created");
    } catch {
      setStatus("❌ Mint failed");
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

      <div className="max-w-3xl mx-auto px-6 pt-32 pb-20 relative z-10">

        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-5xl md:text-6xl font-black tracking-tighter">
            CREATE <span className="text-emerald-500">REQUEST</span>
          </h1>
          <p className="text-zinc-500 font-mono text-xs tracking-widest uppercase mt-2">
            Register waste → Upload proof → Mint NFT
          </p>
        </motion.div>

        {/* STEP INDICATOR */}
        <div className="flex justify-between text-xs font-mono text-zinc-600 mb-6">
          <span className={step >= 1 ? "text-white" : ""}>INPUT</span>
          <span className={step >= 2 ? "text-white" : ""}>UPLOAD</span>
          <span className={step >= 3 ? "text-white" : ""}>MINT</span>
        </div>

        {/* PROGRESS BAR */}
        <div className="h-1.5 w-full bg-white/5 rounded-full mb-10">
          <motion.div
            animate={{ width: `${(step / 3) * 100}%` }}
            className="h-full bg-emerald-500"
          />
        </div>

        {/* FORM */}
        {step === 1 && (
          <motion.form
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onSubmit={handleSubmit}
            className="bg-zinc-900/40 backdrop-blur-2xl border border-white/5 p-8 rounded-[2rem] space-y-6"
          >
            <input
              placeholder="Request Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-4 focus:border-emerald-500 outline-none"
            />

            {/* PROCESS FLOW */}
<div className="space-y-4">
  <p className="text-xs text-zinc-500 font-mono uppercase">
    Supply Chain Flow
  </p>

  {processSteps.map((step, idx) => (
    <div key={idx} className="flex gap-3 items-center">

      {/* STEP NUMBER */}
      <span className="text-xs text-zinc-600 w-6">
        {idx + 1}.
      </span>

      {/* DROPDOWN */}
      <select
        value={step}
        onChange={(e) => handleProcessChange(idx, e.target.value)}
        className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:border-emerald-500 outline-none"
      >
        {PROCESS_OPTIONS.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>

      {/* REMOVE BUTTON */}
      {processSteps.length > 1 && (
        <button
          type="button"
          onClick={() => removeProcessStep(idx)}
          className="text-red-400 text-xs"
        >
          ✕
        </button>
      )}
    </div>
  ))}

  {/* ADD STEP */}
  <button
    type="button"
    onClick={addProcessStep}
    className="text-xs text-emerald-400 font-mono"
  >
    + ADD STEP
  </button>
</div>

            <input
              placeholder="GPS Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-4 focus:border-cyan-500 outline-none"
            />

            <div className="border border-dashed border-white/10 rounded-xl p-6 text-center hover:border-emerald-500 transition">
              <input
                type="file"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
              <p className="text-xs text-zinc-600 mt-2">
                Upload waste proof (image / invoice / IoT snapshot)
              </p>
            </div>

            <button
              type="submit"
              className="w-full py-4 rounded-xl bg-emerald-500/20 border border-emerald-500/50 hover:bg-emerald-500 hover:text-black transition-all font-bold"
            >
              {loading ? "Processing..." : "Upload Metadata"}
            </button>
          </motion.form>
        )}

        {/* STEP 2 / 3 STATUS */}
        {step >= 2 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-black/40 border border-white/10 p-6 rounded-xl text-center mt-6"
          >
            <p className="font-mono text-sm">{status}</p>
          </motion.div>
        )}

        {/* MINT BUTTON */}
        {step === 3 && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={confirmMint}
            className="mt-6 w-full py-4 rounded-xl bg-cyan-500/20 border border-cyan-500/50 hover:bg-cyan-500 hover:text-black transition-all font-bold"
          >
            {loading ? "Minting..." : "Confirm & Mint Request"}
          </motion.button>
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