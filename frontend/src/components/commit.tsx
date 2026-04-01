"use client";

import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { motion, AnimatePresence } from "framer-motion";
import { useWallet } from "../components/WalletContext";
import CONTRACT_ABI from "../contractABI/contractABI.json";

/* ---------------- Helpers ---------------- */

const ipfsToHttp = (ipfsUri: string) =>
  `https://ipfs.io/ipfs/${ipfsUri.replace("ipfs://", "")}`;

/* ---------------- Main Component ---------------- */

export default function Commit() {
  const { address } = useWallet();
  const [contract, setContract] = useState<ethers.Contract | null>(null);

  const [repoID, setRepoID] = useState("");
  const [contributor, setContributor] = useState("");
  const [message, setMessage] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const [metadataUri, setMetadataUri] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  /* ---------------- Contract Init ---------------- */

  useEffect(() => {
    if (!address) return;

    const initContract = async () => {
      try {
        const provider = new ethers.BrowserProvider(
          (window as any).ethereum
        );
        const signer = await provider.getSigner();

        const instance = new ethers.Contract(
          "0x340E18FF8E4De6958977b2Bd8dF9A3bAB51ddD09",
          CONTRACT_ABI.abi,
          signer
        );

        setContract(instance);
      } catch (err) {
        console.error("❌ Contract Init Error:", err);
      }
    };

    initContract();
  }, [address]);

  /* ---------------- Mint Commit ---------------- */

  const mintCommit = async () => {
    if (!address) {
      setStatus("⚠️ WALLET NOT CONNECTED");
      return;
    }

    if (!repoID || !contributor || !message || !file) {
      setStatus("⚠️ ALL FIELDS REQUIRED");
      return;
    }

    try {
      setLoading(true);
      setStatus("UPLOADING TO IPFS...");

      const formData = new FormData();
      formData.append("ownerAddress", address);
      formData.append("contributor", contributor);
      formData.append("message", message);
      formData.append("file", file);

      const response = await fetch("https://crx-7rjl.onrender.com/api/commit", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || "UPLOAD_FAILED");
      }

      setMetadataUri(data.metadataUri);

      setStatus("MINTING ON-CHAIN COMMIT...");

      const tx = await contract?.mintCommit(
        address,
        Number(repoID),
        data.metadataUri
      );
      await tx?.wait();

      setStatus("✅ COMMIT VERIFIED ON-CHAIN");

      // Reset
      setRepoID("");
      setContributor("");
      setMessage("");
      setFile(null);
    } catch (err: any) {
      console.error(err);
      setStatus(`❌ ERROR: ${err.message || "MINT_FAILED"}`);
    } finally {
      setLoading(false);
      setTimeout(() => setStatus(""), 5000);
    }
  };

  /* ---------------- UI ---------------- */

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-xl mx-auto bg-zinc-900/40 backdrop-blur-2xl border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl"
    >
      {/* Header */}
      <div className="px-8 pt-10 pb-6 border-b border-white/5">
        <h2 className="text-3xl font-black tracking-tighter flex items-center gap-3">
          <span className="text-emerald-500">⚡</span> MINT COMMIT
        </h2>
        <p className="text-zinc-500 font-mono text-[10px] uppercase tracking-[0.3em] mt-2">
          Update Asset Lifecycle Data
        </p>
      </div>

      <div className="p-8 space-y-6">

        {/* Wallet */}
        <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl px-4 py-3 flex justify-between">
          <span className="text-[10px] font-bold text-emerald-500/50 uppercase tracking-widest">
            Signer
          </span>
          <span className="text-xs font-mono text-emerald-400">
            {address
              ? `${address.slice(0, 6)}...${address.slice(-4)}`
              : "AUTH_REQUIRED"}
          </span>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { label: "Repository ID", val: repoID, set: setRepoID },
            { label: "Contributor", val: contributor, set: setContributor },
          ].map((input, i) => (
            <div key={i} className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">
                {input.label}
              </label>
              <input
                value={input.val}
                onChange={(e) => input.set(e.target.value)}
                className="bg-white/5 border border-white/10 p-4 rounded-xl text-zinc-200 focus:ring-emerald-500/50"
              />
            </div>
          ))}
        </div>

        {/* Message */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">
            Commit Message
          </label>
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="bg-white/5 border border-white/10 p-4 rounded-xl text-zinc-200 focus:ring-emerald-500/50"
          />
        </div>

        {/* File */}
        <div>
          <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">
            Proof of Work
          </label>
          <input
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="w-full text-sm mt-2"
          />
        </div>

        {/* Action */}
        <button
          onClick={mintCommit}
          disabled={loading}
          className={`w-full py-5 rounded-2xl font-black uppercase tracking-widest text-sm transition-all
            ${
              loading
                ? "bg-zinc-800 text-zinc-600 cursor-wait"
                : "bg-emerald-500 text-black hover:bg-emerald-400"
            }`}
        >
          {loading ? "INITIALIZING..." : "EXECUTE MINT"}
        </button>

        {/* Status */}
        <AnimatePresence>
          {status && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-[10px] font-mono text-emerald-500 uppercase tracking-widest"
            >
              {status}
            </motion.p>
          )}
        </AnimatePresence>

        {/* Metadata */}
        {metadataUri && (
          <div className="pt-6 border-t border-white/5 text-center">
            <a
              href={ipfsToHttp(metadataUri)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-bold text-emerald-400 hover:text-white uppercase tracking-widest"
            >
              🌐 VIEW METADATA
            </a>
            <p className="text-[9px] text-zinc-600 font-mono break-all mt-2">
              {metadataUri}
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}