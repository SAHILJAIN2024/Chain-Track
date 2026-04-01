"use client";

import React, { useState, useEffect, FormEvent } from "react";
import { ethers } from "ethers";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../../components/navbar";
import { useWallet } from "../../components/WalletContext";
import FACTORY_ABI from "../../contractABI/contractABI.json";

/* ---------------- TYPES ---------------- */

interface BackendResponse {
  success: boolean;
  metadataUri: string;
}

/* ---------------- COMPONENT ---------------- */

export default function CreateSupplyChain() {
  const { address } = useWallet();

  const [contract, setContract] = useState<ethers.Contract | null>(null);

  const [name, setName] = useState("");
  const [location, setLocation] = useState("");

  const [creators, setCreators] = useState("");
  const [committers, setCommitters] = useState("");

  const [file, setFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  const FACTORY_ADDRESS = "0x94D9Dd2ACB1a6b72c55D3D0eCB6e4682D68C0014";

  /* ---------------- CONTRACT SETUP ---------------- */

  useEffect(() => {
    if (!address) return;

    const setup = async () => {
      const provider = new ethers.BrowserProvider(
        (window as any).ethereum
      );
      const signer = await provider.getSigner();

      const instance = new ethers.Contract(
        FACTORY_ADDRESS,
        FACTORY_ABI.abi,
        signer
      );

      setContract(instance);
    };

    setup();
  }, [address]);

  /* ---------------- SUBMIT ---------------- */

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!contract || !address || !file) return;

    try {
      setLoading(true);
      setStatus("UPLOADING METADATA TO BACKEND...");

      const formData = new FormData();
      formData.append("ownerAddress", address);
      formData.append("name", name);
      formData.append("location", location);
      formData.append("file", file);

      const res = await fetch("http://localhost:5000/api/supply-chains", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Backend upload failed");

      const data: BackendResponse = await res.json();

      /* -------- PREPARE ARRAYS -------- */

      const creatorArray = creators
        ? creators.split(",").map((a) => a.trim())
        : [address];

      const committerArray = committers
        ? committers.split(",").map((a) => a.trim())
        : [address];

      setStatus("DEPLOYING SUPPLY CHAIN CONTRACT...");

      /* -------- CALL FACTORY -------- */

      const tx = await contract.createSupplyChain(
        name,
        address,          // admin
        creatorArray,
        committerArray
      );

      const receipt = await tx.wait();

      /* -------- EXTRACT EVENT -------- */

      let deployedAddress = "";

      for (const log of receipt.logs) {
        try {
          const parsed = contract.interface.parseLog(log);
          if (parsed?.name === "SupplyChainCreated") {
            deployedAddress = parsed.args.contractAddress;
          }
        } catch {}
      }

      setStatus(`✅ DEPLOYED: ${deployedAddress}`);

      /* -------- RESET -------- */

      setName("");
      setLocation("");
      setCreators("");
      setCommitters("");
      setFile(null);

    } catch (err: any) {
      console.error(err);
      setStatus("❌ ERROR: " + err.message);
    } finally {
      setLoading(false);
      setTimeout(() => setStatus(""), 6000);
    }
  };

  /* ---------------- UI ---------------- */

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <Navbar />

      <main className="pt-32 pb-20 px-6 max-w-4xl mx-auto">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-14"
        >
          <h1 className="text-6xl font-black">
            CREATE <span className="text-emerald-500 italic">SUPPLY CHAIN</span>
          </h1>
          <p className="text-zinc-500 font-mono text-sm uppercase tracking-widest">
            Deploy Custom ERC-1155 Contract
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-zinc-900/40 border border-white/5 p-10 rounded-[2.5rem]"
        >
          <form onSubmit={handleSubmit} className="space-y-8">

            <div className="grid md:grid-cols-2 gap-6">

              <input
                placeholder="Supply Chain Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="bg-white/5 rounded-xl px-5 py-4"
              />


              <input
                placeholder="Pickup Location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
                className="bg-white/5 rounded-xl px-5 py-4"
              />

              <input
                placeholder="Creators (comma-separated addresses)"
                value={creators}
                onChange={(e) => setCreators(e.target.value)}
                className="bg-white/5 rounded-xl px-5 py-4"
              />

              <input
                placeholder="Committers (comma-separated addresses)"
                value={committers}
                onChange={(e) => setCommitters(e.target.value)}
                className="bg-white/5 rounded-xl px-5 py-4"
              />

              <input
                type="file"
                required
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="md:col-span-2 text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-5 rounded-2xl font-black tracking-widest
                ${
                  loading
                    ? "bg-zinc-800 text-zinc-500"
                    : "bg-emerald-500 text-black hover:bg-emerald-400"
                }`}
            >
              {loading ? "PROCESSING..." : "DEPLOY SUPPLY CHAIN"}
            </button>

          </form>
        </motion.div>

      </main>

      <AnimatePresence>
        {status && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-emerald-500 text-black px-8 py-4 rounded-full font-mono text-xs"
          >
            {status}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}