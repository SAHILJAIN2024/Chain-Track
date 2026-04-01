"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import CONTRACT_ABI from "../../contractABI/supplyChainABI.json";
import { useWallet } from "../../components/WalletContext";

export default function ChainPage() {
  const { address } = useWallet();
  const params = useParams();
  const contractAddress = params.address as string;

  const [contract, setContract] = useState<any>(null);
  const [uri, setUri] = useState("");
  const [requestId, setRequestId] = useState("");
  const [commitUri, setCommitUri] = useState("");
  const [status, setStatus] = useState("");

  /* ---------------- SETUP ---------------- */

  useEffect(() => {
    if (!address) return;

    const setup = async () => {
      const provider = new ethers.BrowserProvider(
        (window as any).ethereum
      );
      const signer = await provider.getSigner();

      const instance = new ethers.Contract(
        contractAddress,
        CONTRACT_ABI.abi,
        signer
      );

      setContract(instance);
    };

    setup();
  }, [address, contractAddress]);

  /* ---------------- MINT REQUEST ---------------- */

  const mintRequest = async () => {
    try {
      setStatus("Minting request...");

      const tx = await contract.mintRequest(address, uri);
      await tx.wait();

      setStatus("✅ Request Minted");
      setUri("");
    } catch (err: any) {
      setStatus("❌ " + err.message);
    }
  };

  /* ---------------- MINT COMMIT ---------------- */

  const mintCommit = async () => {
    try {
      setStatus("Adding commit...");

      const tx = await contract.mintCommit(
        address,
        Number(requestId),
        commitUri
      );

      await tx.wait();

      setStatus("✅ Commit Added");
      setCommitUri("");
      setRequestId("");
    } catch (err: any) {
      setStatus("❌ " + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-10">

      <h1 className="text-3xl font-bold mb-8">
        Supply Chain: {contractAddress}
      </h1>

      {/* -------- MINT REQUEST -------- */}
      <div className="mb-10 p-6 bg-zinc-900 rounded-xl">
        <h2 className="text-xl mb-4">Create Product (Request)</h2>

        <input
          placeholder="Metadata URI"
          value={uri}
          onChange={(e) => setUri(e.target.value)}
          className="p-3 w-full mb-4 bg-black border"
        />

        <button
          onClick={mintRequest}
          className="bg-emerald-500 px-4 py-2 text-black"
        >
          Mint Request
        </button>
      </div>

      {/* -------- MINT COMMIT -------- */}
      <div className="mb-10 p-6 bg-zinc-900 rounded-xl">
        <h2 className="text-xl mb-4">Add Commit</h2>

        <input
          placeholder="Request ID"
          value={requestId}
          onChange={(e) => setRequestId(e.target.value)}
          className="p-3 w-full mb-4 bg-black border"
        />

        <input
          placeholder="Commit URI"
          value={commitUri}
          onChange={(e) => setCommitUri(e.target.value)}
          className="p-3 w-full mb-4 bg-black border"
        />

        <button
          onClick={mintCommit}
          className="bg-blue-500 px-4 py-2"
        >
          Add Commit
        </button>
      </div>

      {/* -------- STATUS -------- */}
      {status && (
        <div className="bg-emerald-500 text-black px-6 py-3 rounded">
          {status}
        </div>
      )}
    </div>
  );
}