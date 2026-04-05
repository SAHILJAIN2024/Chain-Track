"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import CONTRACT_ABI from "../../../contractABI/supplyChainABI.json";
import { useWallet } from "../../../components/WalletContext";
import Navbar from "../../../components/navbar";
import { fetchIPFS, RenderIPFSContent } from "../../../components/IPFSRenderer";
import { motion } from "framer-motion";

/* ---------------- TYPES ---------------- */

type Request = {
  tokenId: number;
  to: string;
  uri: string;
};

type Commit = {
  tokenId: number;
  requestId: number;
  to: string;
  uri: string;
};

/* ---------------- COMPONENT ---------------- */

export default function ChainPage() {
  const router = useRouter();
  const { address } = useWallet();
  const params = useParams();
  const contractAddress = params.address as string;

  const [requests, setRequests] = useState<Request[]>([]);
  const [commits, setCommits] = useState<Commit[]>([]);
  const [metadata, setMetadata] = useState<Record<string, any>>({});

  /* ---------------- INIT ---------------- */

  useEffect(() => {
    if (!address) return;

    const init = async () => {
      const provider = new ethers.BrowserProvider((window as any).ethereum);

      const instance = new ethers.Contract(
        contractAddress,
        CONTRACT_ABI.abi,
        provider
      );

      await loadEvents(instance);
    };

    init();
  }, [address, contractAddress]);

  /* ---------------- LOAD EVENTS ---------------- */

  const loadEvents = async (instance: any) => {
    const reqLogs = await instance.queryFilter(
      instance.filters.RequestMinted()
    );

    const comLogs = await instance.queryFilter(
      instance.filters.CommitMinted()
    );

    setRequests(
      reqLogs.map((log: any) => ({
        tokenId: Number(log.args.tokenId),
        to: log.args.to,
        uri: log.args.uri,
      }))
    );

    setCommits(
      comLogs.map((log: any) => ({
        tokenId: Number(log.args.tokenId),
        requestId: Number(log.args.requestId),
        to: log.args.to,
        uri: log.args.uri,
      }))
    );
  };

  /* ---------------- LOAD IPFS ---------------- */

  useEffect(() => {
    const load = async () => {
      const cache: any = {};

      for (const r of requests) {
        cache[r.tokenId] = await fetchIPFS(r.uri);
      }

      for (const c of commits) {
        cache[c.tokenId] = await fetchIPFS(c.uri);
      }

      setMetadata(cache);
    };

    if (requests.length || commits.length) load();
  }, [requests, commits]);

  /* ---------------- GRAPH HELPER ---------------- */

  const getGraphFlow = (reqId: number) => {
    const relatedCommits = commits.filter((c) => c.requestId === reqId);

    return [reqId, ...relatedCommits.map((c) => c.tokenId)];
  };

  /* ---------------- UI ---------------- */

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <Navbar />

      <div className="max-w-6xl mx-auto px-6 pt-32 pb-20">

        {/* HEADER */}
        <h1 className="text-6xl font-black mb-12">
          CHAIN <span className="text-emerald-500">TIMELINE</span>
        </h1>

        {/* ACTIONS */}
        <div className="flex gap-4 mb-12">
          <button
            onClick={() => router.push(`/chain/${contractAddress}/create-request`)}
            className="px-6 py-3 bg-emerald-500 text-black rounded-full font-bold hover:scale-105 transition"
          >
            + CREATE REQUEST
          </button>

          <button
            onClick={() => router.push(`/chain/${contractAddress}/add-commit`)}
            className="px-6 py-3 border border-white/10 rounded-full hover:bg-white hover:text-black transition"
          >
            + ADD COMMIT
          </button>
          <button
            onClick={() => router.push(`/chain/${contractAddress}/batch-request`)}
            className="px-6 py-3 bg-emerald-500 text-black rounded-full font-bold hover:scale-105 transition"
          >
            + CREATE BATCH REQUEST
          </button>
          <button
            onClick={() => router.push(`/chain/${contractAddress}/batch-commit`)}
            className="px-6 py-3 border border-white/10 rounded-full hover:bg-white hover:text-black transition"
          >
            + CREATE COMMIT REQUEST
          </button>
          <button
            onClick={() => router.push(`/chain/${contractAddress}/map`)}
            className="px-6 py-3 border border-white/10 rounded-full hover:bg-white hover:text-black transition"
          >
            + VIEW ON MAP
          </button>
        </div>

        {/* REQUEST TIMELINE */}
        <div className="space-y-16">

          {requests.map((req, idx) => {
            const flow = getGraphFlow(req.tokenId);
            const reqMeta = metadata[req.tokenId];

            return (
              <motion.div
                key={req.tokenId}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.08 }}
                className="p-8 rounded-[2rem] bg-zinc-900/40 border border-white/5"
              >

                {/* TITLE */}
                <h2 className="text-2xl font-bold mb-4">
                  Request #{req.tokenId}
                </h2>

                {/* PROCESS FLOW */}
                {reqMeta?.attributes && (
                  <div className="flex flex-wrap gap-2 mb-6">
                    {reqMeta.attributes
                      .find((a: any) => a.trait_type === "Process Steps")
                      ?.value?.split(", ")
                      .map((step: string, i: number) => (
                        <span
                          key={i}
                          className="px-3 py-1 bg-emerald-500/20 text-xs rounded-full"
                        >
                          {step}
                        </span>
                      ))}
                  </div>
                )}

                {/* GRAPH VISUALIZATION */}
                <div className="flex items-center gap-4 overflow-x-auto mb-8">

                  {flow.map((id, i) => (
                    <div key={i} className="flex items-center gap-2">

                      {/* NODE */}
                      <div className="flex flex-col gap-1">

  {/* TOP ROW → ID + PROCESS TAG */}
  <div className="px-4 py-2 bg-black/50 border border-white/10 rounded-xl text-xs font-mono flex items-center gap-2">
    
    {/* TOKEN ID */}
    <span>#{id}</span>

    {/* PROCESS TAG */}
    {metadata[id]?.attributes && (
      <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-500 rounded-full text-xs">
        {
          metadata[id].attributes.find(
            (a: any) => a.trait_type === "Process Steps"
          )?.value
        }
      </span>
    )}
  </div>

  {/* 🔥 AUTHORITY BELOW */}
  {(() => {
  const meta = metadata[id];

  console.log("🔍 FULL METADATA:", meta);

  let authorityValue = "Not Available";

  // ✅ CASE 1: Standard attributes array
  if (Array.isArray(meta?.attributes)) {
    console.log("📦 ATTRIBUTES ARRAY:", meta.attributes);

    const contributor = meta.attributes.find(
      (a: any) =>
        a?.trait_type === "Contributor" ||
        a?.trait_type === "contributor" ||
        a?.key === "Contributor"
    );

    if (contributor) {
      authorityValue =
        contributor.value ||
        contributor.val ||
        contributor.name ||
        JSON.stringify(contributor);
    }
  }

  // ✅ CASE 2: attributes is object (bad backend format)
  else if (meta?.attributes && typeof meta.attributes === "object") {
    console.log("⚠️ ATTRIBUTES OBJECT:", meta.attributes);

    authorityValue =
      meta.attributes.Contributor ||
      meta.attributes.contributor ||
      meta.attributes.Authority ||
      meta.attributes.authority ||
      JSON.stringify(meta.attributes);
  }

  // ✅ CASE 3: fallback — check root level
  if (authorityValue === "Not Available") {
    console.log("⚠️ FALLBACK ROOT CHECK");

    authorityValue =
      meta?.Contributor ||
      meta?.contributor ||
      meta?.Authority ||
      meta?.authority ||
      meta?.title || // last fallback so you SEE something
      "Not Available";
  }

  return (
    <div className="text-[10px] text-cyan-400 font-mono px-1">
      {authorityValue}
    </div>
  );
})()}

</div>

                      {/* ARROW */}
                      {i !== flow.length - 1 && (
                        <div className="w-6 h-[2px] bg-emerald-500" />
                      )}
                    </div>
                  ))}

                </div>

                {/* REQUEST META */}
                <div className="mb-6">
                  <RenderIPFSContent data={reqMeta} />
                </div>

                {/* TIMELINE */}
                <div className="border-l border-white/10 pl-6 space-y-6">

                  {commits
                    .filter((c) => c.requestId === req.tokenId)
                    .map((c, i) => (
                      <motion.div
                        key={c.tokenId}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="relative"
                      >

                        {/* DOT */}
                        <div className="absolute -left-[11px] top-2 w-3 h-3 bg-emerald-500 rounded-full" />

                        {/* CARD */}
                        <div className="p-4 bg-black/40 border border-white/5 rounded-xl">

                          <p className="text-xs text-zinc-400 mb-2">
                            Commit #{c.tokenId}
                          </p>

                          <RenderIPFSContent data={metadata[c.tokenId]} />

                        </div>
                      </motion.div>
                    ))}

                </div>

              </motion.div>
            );
          })}

        </div>
      </div>
    </div>
  );
}


