"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ethers } from "ethers";
import Navbar from "../../../../components/navbar";
import { useWallet } from "../../../../components/WalletContext";
import ABI from "../../../../contractABI/supplyChainABI.json";
import { motion } from "framer-motion";

/* ---------------- TYPES ---------------- */
type BatchCommit = {
  requestId: string;
  title: string;
  authority: string;
  location: string;
  file: File | null;
};

export default function BatchCommit() {
  const { address } = useWallet();
  const params = useParams();
  const contractAddress = params.address as string;

  const [contract, setContract] = useState<any>(null);

  const [items, setItems] = useState<BatchCommit[]>([
    { requestId: "", title: "", authority: "", location: "", file: null }
  ]);

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  const [ipfsUris, setIpfsUris] = useState<string[]>([]);
  const [requestIds, setRequestIds] = useState<number[]>([]);
  const [txHash, setTxHash] = useState("");

  /* ---------------- INIT ---------------- */
  useEffect(() => {
    if (!address) return;

    const init = async () => {
      const provider = new ethers.BrowserProvider((window as any).ethereum);
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
    setItems([
      ...items,
      { requestId: "", title: "", authority: "", location: "", file: null }
    ]);
  };

  /* ---------------- UPDATE ITEM ---------------- */
  const updateItem = (index: number, field: string, value: any) => {
    const updated = [...items];
    (updated[index] as any)[field] = value;
    setItems(updated);
  };

  /* ---------------- UPLOAD ---------------- */
  const handleUpload = async () => {
    try {
      setLoading(true);
      setStep(2);
      setStatus("Uploading metadata to IPFS...");

      const uris: string[] = [];
      const ids: number[] = [];

      for (const item of items) {
        if (!item.file || !item.requestId) {
          throw new Error("Missing file or requestId");
        }

        const formData = new FormData();
        formData.append("ownerAddress", contractAddress);
        formData.append("title", item.title);
        formData.append("Authority", item.authority); // ✅ IMPORTANT
        formData.append("location", item.location);
        formData.append("file", item.file);

        const res = await fetch("http://localhost:5000/api/commit", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const errText = await res.text();
          throw new Error(errText);
        }

        const data = await res.json();

        uris.push(data.metadataUri);
        ids.push(Number(item.requestId));
      }

      setIpfsUris(uris);
      setRequestIds(ids);

      setStep(3);
      setStatus("✅ Metadata uploaded");
    } catch (err: any) {
      console.error(err);
      setStatus("❌ " + err.message);
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- MINT ---------------- */
  const confirmBatchMint = async () => {
    try {
      if (!ipfsUris.length || !requestIds.length) {
        setStatus("❌ Missing data");
        return;
      }

      setLoading(true);
      setStatus("Minting Batch Commits...");

      console.log("Sending:", {
        requestIds,
        ipfsUris,
      });

      /* 🔥 MATCH YOUR CONTRACT */
      const tx = await contract.batchMintCommit(
        address,
        requestIds,
        ipfsUris,
        {
          gasLimit: 4000000,
        }
      );

      await tx.wait();

      setTxHash(tx.hash);
      setStatus("🚀 Batch Commit Minted Successfully");
    } catch (err: any) {
      console.error("FULL ERROR:", err);

      if (err?.reason) {
        setStatus("❌ " + err.reason);
      } else if (err?.message) {
        setStatus("❌ " + err.message);
      } else {
        setStatus("❌ Mint failed");
      }
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <Navbar />

      <div className="max-w-4xl mx-auto px-6 pt-32 pb-20">

        <h1 className="text-6xl font-black">
          BATCH <span className="text-cyan-500">COMMIT</span>
        </h1>

        {/* STEP BAR */}
        <div className="mt-6 h-1 bg-white/10 rounded">
          <motion.div
            animate={{ width: `${(step / 3) * 100}%` }}
            className="h-full bg-cyan-500"
          />
        </div>

        {/* STEP 1 */}
        {step === 1 && (
          <div className="space-y-6 mt-8">
            {items.map((item, i) => (
              <div key={i} className="p-6 bg-zinc-900/40 rounded-2xl">

                <input
                  placeholder="Request ID"
                  onChange={(e) =>
                    updateItem(i, "requestId", e.target.value)
                  }
                  className="w-full mb-3 p-3 bg-black/40 border rounded"
                />

                <input
                  placeholder="Title"
                  onChange={(e) =>
                    updateItem(i, "title", e.target.value)
                  }
                  className="w-full mb-3 p-3 bg-black/40 border rounded"
                />

                <input
                  placeholder="Authority"
                  onChange={(e) =>
                    updateItem(i, "authority", e.target.value)
                  }
                  className="w-full mb-3 p-3 bg-black/40 border rounded"
                />

                <input
                  value={item.location}
                  onChange={(e) =>
                    updateItem(i, "location", e.target.value)
                  }
                  className="w-full mb-3 p-3 bg-black/40 border rounded"
                />

                <input
                  type="file"
                  onChange={(e) =>
                    updateItem(i, "file", e.target.files?.[0])
                  }
                />
              </div>
            ))}

            <button onClick={addItem} className="px-6 py-2 bg-white/10 rounded">
              + Add More
            </button>

            <button
              onClick={handleUpload}
              className="w-full py-4 bg-cyan-500 text-black rounded-xl"
            >
              {loading ? "Uploading..." : "Upload Batch"}
            </button>
          </div>
        )}

        {/* STATUS */}
        {step >= 2 && (
          <div className="mt-6 text-center font-mono text-sm">
            {status}
          </div>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <button
            onClick={confirmBatchMint}
            className="mt-6 w-full py-4 bg-emerald-500 text-black rounded-xl"
          >
            {loading ? "Minting..." : "Confirm Batch Mint"}
          </button>
        )}

        {/* TX */}
        {txHash && (
          <a
            href={`https://sepolia.etherscan.io/tx/${txHash}`}
            target="_blank"
            className="block mt-4 text-center text-cyan-400"
          >
            View Transaction →
          </a>
        )}
      </div>
    </div>
  );
}