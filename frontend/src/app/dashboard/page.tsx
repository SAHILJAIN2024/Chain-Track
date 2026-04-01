"use client";

import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { useWallet } from "../../components/WalletContext";
import FACTORY_ABI from "../../contractABI/contractABI.json";
import Link from "next/link";

const FACTORY_ADDRESS = "0x94D9Dd2ACB1a6b72c55D3D0eCB6e4682D68C0014";

export default function Dashboard() {
  const { address } = useWallet();
  const [chains, setChains] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!address) return;

    const loadChains = async () => {
      try {
        const provider = new ethers.BrowserProvider(
          (window as any).ethereum
        );
        const contract = new ethers.Contract(
          FACTORY_ADDRESS,
          FACTORY_ABI.abi,
          provider
        );

        const data = await contract.getAllSupplyChains();
        setChains(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadChains();
  }, [address]);

  return (
    <div className="min-h-screen bg-black text-white p-10">
      <h1 className="text-4xl font-bold mb-10">Your Supply Chains</h1>

      {loading ? (
        <p>Loading...</p>
      ) : chains.length === 0 ? (
        <p>No supply chains found</p>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {chains.map((chain, i) => (
            <Link
              key={i}
              href={`/chain/${chain.contractAddress}`}
              className="p-6 bg-zinc-900 rounded-xl border border-white/10 hover:border-emerald-500"
            >
              <h2 className="text-xl font-bold">{chain.name}</h2>
              <p className="text-sm text-zinc-400 mt-2">
                {chain.contractAddress}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}