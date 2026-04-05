"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import L from "leaflet";
import Navbar from "@/src/components/navbar";
import { ethers } from "ethers";
import CONTRACT_ABI from "../../../../contractABI/supplyChainABI.json";
import { fetchIPFS } from "../../../../components/IPFSRenderer";
import { useParams } from "next/navigation";

/* ---------------- DYNAMIC IMPORT ---------------- */
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import("react-leaflet").then((mod) => mod.Popup),
  { ssr: false }
);
const Polyline = dynamic(
  () => import("react-leaflet").then((mod) => mod.Polyline),
  { ssr: false }
);

/* ---------------- TYPES ---------------- */
type LocationPoint = {
  lat: number;
  lng: number;
  label: string;
  type: "request" | "commit";
  address: string;
  name?: string;
  description?: string;
  attributes?: any[];
};

/* ---------------- ICON ---------------- */
const markerIcon = new L.Icon({
  iconUrl: "https://maps.google.com/mapfiles/ms/icons/green-dot.png",
  iconSize: [32, 32],
});

/* ---------------- HELPERS ---------------- */

const extractLatLng = (meta: any) => {
  if (!meta) return null;

  let locationStr = "";

  if (meta.location) locationStr = meta.location;

  if (!locationStr && Array.isArray(meta.attributes)) {
    const locAttr = meta.attributes.find(
      (a: any) => a.trait_type?.toLowerCase() === "location"
    );
    if (locAttr) locationStr = locAttr.value;
  }

  if (!locationStr) return null;

  try {
    const [lat, lng] = locationStr.split(",").map(Number);
    if (isNaN(lat) || isNaN(lng)) return null;
    return { lat, lng };
  } catch {
    return null;
  }
};

/* ---------------- COMPONENT ---------------- */
export default function SupplyChainMap() {
  const params = useParams();
  const contractAddress = params.address as string;

  const [points, setPoints] = useState<LocationPoint[]>([]);
  const [mounted, setMounted] = useState(false);

  /* ---------------- LOAD CSS ---------------- */
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href =
      "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";

    document.head.appendChild(link);
    setMounted(true);

    return () => {
      document.head.removeChild(link);
    };
  }, []);

  /* ---------------- LOAD EVENTS ---------------- */
  useEffect(() => {
    if (!contractAddress) return;

    const load = async () => {
      try {
        const provider = new ethers.BrowserProvider(
          (window as any).ethereum
        );

        const contract = new ethers.Contract(
          contractAddress,
          CONTRACT_ABI.abi,
          provider
        );

        const reqLogs = await contract.queryFilter(
          contract.filters.RequestMinted()
        );

        const comLogs = await contract.queryFilter(
          contract.filters.CommitMinted()
        );

        let allPoints: LocationPoint[] = [];

        /* ---------- REQUESTS ---------- */
        for (const log of reqLogs) {
          const eventLog = log as ethers.EventLog;
          const meta = await fetchIPFS(eventLog.args.uri);

          const coords = extractLatLng(meta);

          if (coords) {
            allPoints.push({
              ...coords,
              label: `Request #${eventLog.args.tokenId}`,
              type: "request",
              address: eventLog.args.to,
              name: meta?.name,
              description: meta?.description,
              attributes: meta?.attributes,
            });
          }
        }

        /* ---------- COMMITS ---------- */
        for (const log of comLogs) {
          const eventLog = log as ethers.EventLog;
          const meta = await fetchIPFS(eventLog.args.uri);

          const coords = extractLatLng(meta);

          if (coords) {
            allPoints.push({
              ...coords,
              label: `Commit #${eventLog.args.tokenId}`,
              type: "commit",
              address: eventLog.args.to,
              name: meta?.name,
              description: meta?.description,
              attributes: meta?.attributes,
            });
          }
        }

        setPoints(allPoints);

      } catch (err) {
        console.error("MAP ERROR:", err);
      }
    };

    load();
  }, [contractAddress]);

  if (!mounted) return null;

  const center: [number, number] =
    points.length > 0
      ? [points[0].lat, points[0].lng]
      : [20.5937, 78.9629];

  const pathPositions = points.map((p) => [p.lat, p.lng] as [number, number]);

  return (
    <>
      <Navbar />

      <div className="w-full max-w-6xl mx-auto bg-black/40 p-4 rounded-3xl border mt-20">

        <h2 className="text-white text-lg mb-4">
          🌍 Smart Supply Chain Map
        </h2>

        <div className="w-full h-[500px] rounded-2xl overflow-hidden">
          <MapContainer center={center} zoom={5} className="w-full h-full">
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

            {/* ROUTE */}
            {pathPositions.length > 1 && (
              <Polyline positions={pathPositions} pathOptions={{ color: "lime" }} />
            )}

            {/* MARKERS */}
            {points.map((p, i) => (
              <Marker key={i} position={[p.lat, p.lng]} icon={markerIcon}>
                <Popup>
                  <div className="text-xs space-y-1">

                    <b>{p.label}</b>

                    <p>📌 Type: {p.type}</p>

                    <p>
                      👤 {p.address.slice(0, 6)}...
                      {p.address.slice(-4)}
                    </p>

                    {p.name && (
                      <p>🧾 {p.name}</p>
                    )}

                    {p.description && (
                      <p className="text-zinc-400">{p.description}</p>
                    )}

                    <p>
                      📍 {p.lat}, {p.lng}
                    </p>

                    {/* ATTRIBUTES */}
                    {Array.isArray(p.attributes) && (
                      <div className="mt-2 space-y-1">
                        {p.attributes.map((a: any, idx: number) => (
                          <div key={idx}>
                            <span className="text-zinc-400">
                              {a.trait_type}:
                            </span>{" "}
                            {a.value}
                          </div>
                        ))}
                      </div>
                    )}

                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>
    </>
  );
}