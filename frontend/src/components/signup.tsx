"use client";

import React, { useEffect } from "react";
import { useWallet } from "../components/WalletContext";
import { useRouter, usePathname } from "next/navigation";

const Signup: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { address, connectWallet } = useWallet();

  // Redirect only if we are on "/" and wallet connects
  useEffect(() => {
    if (address && pathname === "/") {
      router.push("/dashboard");
    }
  }, [address, pathname, router]);

  return (
    <button
      onClick={connectWallet}
      className={`px-6 py-2 rounded-xl text-center transition duration-300 
        ${
          address
            ? "bg-[#39FF14] text-black shadow-[0_0_15px_#39FF14] hover:shadow-[0_0_25px_#39FF14]"
            : "bg-gradient-to-r from-[#007206] to-[#39FF14] shadow-[0_0_10px_#9D00FF] hover:from-[#2eb2ff] hover:to-[#002fff] hover:shadow-[0_0_15px_#FF2E88] animate-pulse"
        }`}
    >
      {address ? (
        <span className="font-semibold text-sm tracking-wide">
          🔗 Wallet Connected
        </span>
      ) : (
        <div className="flex flex-col items-center leading-tight">
          <span className="font-semibold text-sm">⚡ Connect Wallet</span>
          <span className="text-xs opacity-80">Step into Web3 🚀</span>
        </div>
      )}
    </button>
  );
};

export default Signup;
