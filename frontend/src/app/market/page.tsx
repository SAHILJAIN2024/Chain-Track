"use client";

import React, { useState } from "react";
import Navbar from "../../components/navbar";
import { motion, AnimatePresence } from "framer-motion";

/* ---------------- TYPES ---------------- */
type Commit = {
  id: string;
  to: string;
  tokenId: string;
};

type Request = {
  id: string;
  part: string;
  commits: Commit[];
  metadata: any;
};

/* ---------------- INITIAL DATA ---------------- */
const INITIAL_DATA: Request[] = [
  {
    id: "1",
    part: "Filters",
    commits: [
      { id: "c1", to: "Assembly Unit", tokenId: "101" },
      { id: "c2", to: "QA Inspection", tokenId: "102" },
    ],
    metadata: {
      name: "Air Filter Batch",
      description: "Production line batch for Maruti Suzuki air filters",
      attributes: [
        { trait_type: "Material", value: "Fiber Composite" },
        { trait_type: "Units", value: "200" },
        { trait_type: "Status", value: "QA Completed" },
      ],
    },
  },
  {
    id: "2",
    part: "Gaskets",
    commits: [{ id: "c3", to: "Assembly Unit", tokenId: "103" }],
    metadata: {
      name: "Engine Gasket Lot",
      description: "Heat-resistant gasket production",
      attributes: [
        { trait_type: "Material", value: "Rubber + Steel" },
        { trait_type: "Units", value: "150" },
        { trait_type: "Status", value: "In Assembly" },
      ],
    },
  },
  {
    id: "3",
    part: "Spark Plugs",
    commits: [],
    metadata: {
      name: "Spark Plug Batch",
      description: "Precision ignition components",
      attributes: [
        { trait_type: "Voltage", value: "12V" },
        { trait_type: "Units", value: "300" },
        { trait_type: "Status", value: "Created" },
      ],
    },
  },
  {
    id: "4",
    part: "Pumps",
    commits: [
      { id: "c4", to: "Assembly Unit", tokenId: "104" },
      { id: "c5", to: "QA Inspection", tokenId: "105" },
      { id: "c6", to: "Logistics", tokenId: "106" },
    ],
    metadata: {
      name: "Fuel Pump Batch",
      description: "IoT monitored fuel pump system",
      attributes: [
        { trait_type: "Pressure", value: "3.5 bar" },
        { trait_type: "Units", value: "80" },
        { trait_type: "Status", value: "Dispatched" },
      ],
    },
  },
];

/* ---------------- STATUS ---------------- */
const getStatus = (commits: Commit[]) => {
  if (commits.length >= 3) return "🚚 Dispatched";
  if (commits.length === 2) return "🧪 QA Completed";
  if (commits.length === 1) return "⚙️ In Assembly";
  return "🟡 Created";
};

/* ---------------- PAGE ---------------- */
export default function SmartWarehousePage() {
  const [data, setData] = useState<Request[]>(INITIAL_DATA);
  const [loading, setLoading] = useState(false);

  /* ---------------- UPDATE WITH DELAY ---------------- */
  const handleUpdate = async () => {
    setLoading(true);

    // ⏳ Simulate blockchain / IoT delay
    await new Promise((resolve) => setTimeout(resolve, 2500));

    const updated = data.map((item) => {
      const newCommit: Commit = {
        id: "c" + Math.random(),
        to: "Next Stage",
        tokenId: Math.floor(Math.random() * 1000).toString(),
      };

      return {
        ...item,
        commits: [...item.commits, newCommit],
      };
    });

    setData(updated);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <Navbar />

      <div className="max-w-6xl mx-auto px-6 pt-32 pb-20">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-12">
          <h1 className="text-5xl font-black">
            SMART <span className="text-emerald-500">WAREHOUSE</span>
          </h1>

          {/* BUTTON */}
          <button
            onClick={handleUpdate}
            disabled={loading}
            className={`px-6 py-3 rounded-xl font-bold transition-all
              ${loading
                ? "bg-zinc-700 text-zinc-400 cursor-not-allowed"
                : "bg-emerald-500 text-black hover:bg-emerald-400"
              }`}
          >
            {loading ? "⏳ Processing..." : "🔄 Update"}
          </button>
        </div>

        {/* GRID */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence>
            {data.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ delay: i * 0.05 }}
                className="p-6 rounded-2xl bg-zinc-900/40 border border-white/10"
              >
                <h2 className="text-xl font-bold text-emerald-400 mb-2">
                  {item.part}
                </h2>

                <p className="text-sm text-zinc-300 mb-2">
                  {item.metadata.name}
                </p>

                <p className="text-xs mb-4">
                  Status: {getStatus(item.commits)}
                </p>

                <p className="text-xs text-zinc-500 mb-4">
                  {item.metadata.description}
                </p>

                <div className="grid grid-cols-2 gap-2 mb-4">
                  {item.metadata.attributes.map((attr: any, idx: number) => (
                    <div key={idx} className="bg-black/40 p-2 rounded-lg text-xs">
                      <p className="text-zinc-500">{attr.trait_type}</p>
                      <p>{attr.value}</p>
                    </div>
                  ))}
                </div>

                <div className="text-xs text-zinc-400">
                  Commits: {item.commits.length}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}