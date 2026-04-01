"use client";

import React, { useEffect, useState } from "react";
import Navbar from "../../components/navbar";
import { useQuery } from "@tanstack/react-query";
import { gql, request } from "graphql-request";
import { motion, AnimatePresence } from "framer-motion";

/* ---------------- Types ---------------- */
type RequestMinted = { id: string; to: string; tokenId: string; uri: string; };
type CommitMinted = { id: string; to: string; tokenId: string; requestId: string; uri: string; };
type GraphResponse = { requestMinteds: RequestMinted[]; commitMinteds: CommitMinted[]; };

/* ---------------- GraphQL ---------------- */
const SUBGRAPH_URL = "https://api.studio.thegraph.com/query/117940/crx-waste-managment/version/latest";
const QUERY = gql`
{
  requestMinteds(first: 50, orderBy: blockTimestamp, orderDirection: desc) {
    id
    to
    tokenId
    uri
  }
  commitMinteds(first: 100, orderBy: blockTimestamp, orderDirection: asc) {
    id
    to
    tokenId
    requestId
    uri
  }
}
`;

/* ---------------- Helpers ---------------- */
const GATEWAYS = ["https://cloudflare-ipfs.com/ipfs/", "https://ipfs.io/ipfs/"];
const normalizeToIpfsUri = (input: string): string => {
  if (!input) return "";
  if (input.startsWith("ipfs://")) return input;
  const match = input.match(/\/ipfs\/([^/?#]+)/);
  if (match?.[1]) return `ipfs://${match[1]}`;
  if (/^(Qm|bafy)/.test(input)) return `ipfs://${input}`;
  return "";
};
const ipfsToHttp = (ipfsUri: string, gw = GATEWAYS[0]) => gw + ipfsUri.replace("ipfs://", "");

const fetchMetadata = async (rawUri: string) => {
  const ipfsUri = normalizeToIpfsUri(rawUri);
  const cid = ipfsUri.replace("ipfs://", "");
  for (const gw of GATEWAYS) {
    try {
      const res = await fetch(gw + cid, { cache: "no-store" });
      if (!res.ok) continue;
      const contentType = res.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        const json = await res.json();
        if (json.image) json.image = normalizeToIpfsUri(json.image);
        return json;
      }
      return {
        name: "Attached File",
        description: "This request contains a file attachment",
        image: `ipfs://${cid}`,
        attributes: [{ trait_type: "Content-Type", value: contentType }],
      };
    } catch { continue; }
  }
  return { name: "Metadata unavailable", description: "Failed to fetch" };
};

const getStatus = (commitCount: number) => {
  if (commitCount >= 3) return { label: "Utilized by Company Hub", step: 3, color: "#10b981" };
  if (commitCount === 2) return { label: "Forwarded by Recycler", step: 2, color: "#3b82f6" };
  if (commitCount === 1) return { label: "Forwarded by Collector", step: 1, color: "#f59e0b" };
  return { label: "Request Created", step: 0, color: "#71717a" };
};

/* ---------------- Render Components ---------------- */

const RenderIPFSContent = ({ data }: { data: any }) => {
  if (!data) return (
    <div className="py-4 animate-pulse flex flex-col items-center">
      <div className="h-4 w-32 bg-zinc-800 rounded mb-2"></div>
      <div className="h-3 w-48 bg-zinc-900 rounded"></div>
    </div>
  );

  const { name, description, image, attributes } = data;
  const ipfsImageUri = image ? normalizeToIpfsUri(image) : null;
  const httpPreviewUrl = ipfsImageUri ? ipfsToHttp(ipfsImageUri) : null;
  const isImage = httpPreviewUrl && /\.(png|jpg|jpeg|gif|webp|svg)$/i.test(httpPreviewUrl);

  return (
    <div className="bg-black/40 border border-white/5 p-5 rounded-2xl mt-4 space-y-4 shadow-inner">
      <div className="text-center">
        <h3 className="text-lg font-bold text-emerald-400 tracking-tight">{name}</h3>
        <p className="text-zinc-400 text-sm mt-1">{description}</p>
      </div>

      {isImage && (
        <div className="relative group rounded-xl overflow-hidden border border-white/10 shadow-lg bg-zinc-950">
          <img
            src={httpPreviewUrl!}
            alt={name}
            className="max-h-72 w-full object-contain mx-auto transition-transform duration-500 group-hover:scale-105"
          />
        </div>
      )}

      {ipfsImageUri && (
        <div className="text-center">
          <a
            href={ipfsImageUri}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] font-mono text-zinc-500 hover:text-emerald-400 uppercase tracking-widest transition-colors"
          >
            ↗ View IPFS Hash
          </a>
        </div>
      )}

      {Array.isArray(attributes) && (
        <div className="grid grid-cols-2 gap-2 pt-2">
          {attributes.map((a: any, i: number) => (
            <div key={i} className="bg-zinc-900/50 border border-white/5 rounded-lg p-2">
              <p className="text-[10px] text-zinc-500 font-bold uppercase">{a.trait_type}</p>
              <p className="text-xs text-zinc-200 truncate">{a.value}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/* ---------------- Main Page ---------------- */

export default function CommunityPage() {
  const [requests, setRequests] = useState<(RequestMinted & { commits: CommitMinted[]; metadata?: any })[]>([]);
  const [metadataCache, setMetadataCache] = useState<Record<string, any>>({});

  const { data, isLoading, error } = useQuery<GraphResponse>({
    queryKey: ["communityRequests"],
    queryFn: async () => request<GraphResponse>(SUBGRAPH_URL, QUERY),
  });

  useEffect(() => {
    if (!data) return;
    const commitMap: Record<string, CommitMinted[]> = {};
    data.commitMinteds.forEach((commit) => {
      if (!commitMap[commit.requestId]) commitMap[commit.requestId] = [];
      commitMap[commit.requestId].push(commit);
    });

    const merged = data.requestMinteds.map((req) => ({
      ...req,
      commits: commitMap[req.tokenId] || [],
    }));

    setRequests(merged);

    merged.forEach(async (req) => {
      if (!metadataCache[req.id]) {
        const meta = await fetchMetadata(req.uri);
        setMetadataCache((prev) => ({ ...prev, [req.id]: meta }));
      }
    });
  }, [data]);

  if (error) return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center">
      <div className="px-6 py-3 rounded-full bg-red-500/10 border border-red-500/50 text-red-500 font-mono text-sm uppercase tracking-widest">
        [ System Error ]: Subgraph Connection Failed
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-emerald-500 selection:text-black">
      <Navbar />
      
      {/* Background Decorative Glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-blue-500/5 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-6xl mx-auto px-6 relative z-10 pt-32 pb-20">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-4 uppercase">
            Global <span className="text-emerald-500">Ledger</span>
          </h1>
          <p className="text-zinc-500 font-mono text-sm tracking-[0.4em] uppercase">
            Verified Waste-to-Asset Activity
          </p>
        </motion.div>

        {isLoading && (
          <div className="flex flex-col items-center py-20 animate-pulse">
            <p className="text-zinc-600 font-mono text-xs uppercase tracking-widest">Scanning Ledger...</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <AnimatePresence>
            {requests.map((req, idx) => {
              const status = getStatus(req.commits.length);
              return (
                <motion.div
                  key={req.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-zinc-900/40 backdrop-blur-2xl border border-white/5 p-8 rounded-[2.5rem] shadow-2xl hover:border-emerald-500/30 transition-all group flex flex-col"
                >
                  {/* Status Stepper Header */}
                  <div className="mb-8">
                    <div className="flex justify-between text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-3">
                      <span>Mint</span>
                      <span>Collect</span>
                      <span>Process</span>
                      <span>Reuse</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(status.step / 3) * 100}%` }}
                        className="h-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]"
                      />
                    </div>
                    <p className="text-xs font-mono mt-3 uppercase tracking-tighter" style={{ color: status.color }}>
                      ● {status.label}
                    </p>
                  </div>

                  {/* Body Content */}
                  <div className="flex-1 space-y-4">
                    <div className="flex justify-between items-start">
                      <h2 className="text-2xl font-bold tracking-tight">Request #{req.tokenId}</h2>
                      <span className="text-[10px] font-mono text-zinc-600 px-2 py-1 bg-white/5 rounded">ON-CHAIN</span>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-[10px] text-zinc-500 uppercase font-bold">Origin Address</p>
                      <p className="text-xs font-mono text-zinc-400 break-all bg-black/20 p-2 rounded-lg border border-white/5">{req.to}</p>
                    </div>

                    <RenderIPFSContent data={metadataCache[req.id]} />
                  </div>

                  {/* Commits Section */}
                  <div className="mt-8 pt-6 border-t border-white/5 space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500">History ({req.commits.length})</h3>
                    <div className="space-y-4">
                      {req.commits.length === 0 ? (
                        <p className="text-xs text-zinc-600 italic">No secondary commits recorded.</p>
                      ) : (
                        req.commits.map((commit) => (
                          <div key={commit.id} className="relative pl-6 border-l border-emerald-500/20 py-2">
                            <div className="absolute left-[-4px] top-3 w-2 h-2 rounded-full bg-emerald-500 border border-[#050505]" />
                            <p className="text-[10px] font-mono text-zinc-300">
                              Commit <span className="text-emerald-500">#{commit.tokenId}</span> → {commit.to.slice(0, 6)}...{commit.to.slice(-4)}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}