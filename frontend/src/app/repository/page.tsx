"use client";

import React, { useState, useEffect, FormEvent } from "react";
import { ethers } from "ethers";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../../components/navbar";
import { useWallet } from "../../components/WalletContext";
import FACTORY_ABI from "../../contractABI/contractABI.json";
import CreateIOTSupplyChain from "../../components/IOTChain";

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

  const [processSteps, setProcessSteps] = useState<string[]>(["Manufacturer"]);

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  const FACTORY_ADDRESS = "0xf2F76eFB368c56817ED0bdeEFC7689DC859Eb467";

  /* ---------------- CONTRACT SETUP ---------------- */

  useEffect(() => {
    if (!address) return;

    const setup = async () => {
      const provider = new ethers.BrowserProvider((window as any).ethereum);
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

  useEffect(() => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition((pos) => {
      setLocation(`${pos.coords.latitude}, ${pos.coords.longitude}`);
    });
  }, []);

  /* ---------------- PROCESS STEPS HANDLERS ---------------- */

  const handleProcessChange = (index: number, value: string) => {
    const updated = [...processSteps];
    updated[index] = value;
    setProcessSteps(updated);
  };

  const addStep = () => setProcessSteps([...processSteps, ""]);
  const removeStep = (index: number) => setProcessSteps(processSteps.filter((_, i) => i !== index));

  /* ---------------- SUBMIT ---------------- */

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!contract || !address ) return;

    try {
      setLoading(true);
      setStatus("UPLOADING METADATA TO BACKEND...");

      const formData = new FormData();
      formData.append("ownerAddress", address);
      formData.append("name", name);
      formData.append("location", location);
      formData.append("processSteps", JSON.stringify(processSteps));

      const res = await fetch("http://localhost:5000/api/supply-chains", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Backend upload failed");

      const data: BackendResponse = await res.json();

      const creatorArray = creators
        ? creators.split(",").map((a) => a.trim())
        : [address];

      const committerArray = committers
        ? committers.split(",").map((a) => a.trim())
        : [address];

      setStatus("DEPLOYING SUPPLY CHAIN CONTRACT...");

      const tx = await contract.createSupplyChain(
        name,
        address,
        creatorArray,
        committerArray
      );

      const receipt = await tx.wait();

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

      // Reset all fields
      setName("");
      setLocation("");
      setCreators("");
      setCommitters("");
      setProcessSteps(["Manufacturer"]);

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
                placeholder="GPS Location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-4 focus:border-cyan-500 outline-none"
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

              <div className="md:col-span-2 space-y-2">
  <label className="font-mono text-xs uppercase text-zinc-400">
    Supply Chain Process Line
  </label>
  {processSteps.map((step, idx) => (
    <div key={idx} className="flex gap-2 items-center">
      <select
        value={step}
        onChange={(e) => handleProcessChange(idx, e.target.value)}
        className="flex-1 bg-black rounded-xl px-5 py-4"
      >
        <option value="">Select Role</option>
        <option value="Manufacturer">Manufacturer</option>
        <option value="Supplier">Supplier</option>
        <option value="Transporter">Transporter</option>
        <option value="Warehouse Owner">Warehouse Owner</option>
        <option value="Retailer">Retailer</option>
        <option value="Distributor">Distributor</option>
        <option value="Quality Inspector">Quality Inspector</option>
        <option value="Customs">Customs</option>
      </select>

      {processSteps.length > 1 && (
        <button
          type="button"
          onClick={() => removeStep(idx)}
          className="px-3 py-2 text-red-400 rounded-xl bg-white/10"
        >
          Remove
        </button>
      )}
    </div>
  ))}
  <button
    type="button"
    onClick={addStep}
    className="mt-2 bg-emerald-500 text-black px-6 py-3 rounded-xl hover:bg-emerald-400"
  >
    + Add Step
  </button>
</div>

              
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-5 rounded-2xl font-black tracking-widest
                ${loading ? "bg-zinc-800 text-zinc-500" : "bg-emerald-500 text-black hover:bg-emerald-400"}`}
            >
              {loading ? "PROCESSING..." : "DEPLOY SUPPLY CHAIN"}
            </button>
          </form>
        </motion.div>

        <CreateIOTSupplyChain />
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