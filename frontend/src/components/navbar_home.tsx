"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Signup from "./signup";
import { motion } from "framer-motion";

export default function Navbar() {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);

  // Add scroll listener to change navbar background
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 px-6 md:px-12 py-4 ${
        scrolled 
          ? "bg-[#050505]/80 backdrop-blur-md border-b border-white/5 py-3" 
          : "bg-transparent py-6"
      }`}
    >
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo / Brand */}
        <div 
          className="flex items-center gap-2 cursor-pointer group"
          onClick={() => router.push("/")}
        >
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center font-black text-black group-hover:rotate-12 transition-transform">
            C
          </div>
          <h1 className="text-xl font-black tracking-tighter text-white">
            CRX<span className="text-emerald-500">.</span>
          </h1>
        </div>

        {/* Menu Items */}
        <ul className="hidden md:flex gap-10 items-center">
          <li>
            <button
              className="text-xs font-mono uppercase tracking-[0.2em] text-zinc-400 hover:text-white transition-colors cursor-pointer"
              onClick={() => router.push("/")}
            >
              System
            </button>
          </li>
          <li>
            <button
              className="text-xs font-mono uppercase tracking-[0.2em] text-zinc-400 hover:text-white transition-colors cursor-pointer"
              onClick={() => scrollToSection("about")}
            >
              Mission
            </button>
          </li>
          <li>
            <button
              className="text-xs font-mono uppercase tracking-[0.2em] text-zinc-400 hover:text-white transition-colors cursor-pointer"
              onClick={() => scrollToSection("features")}
            >
              Network
            </button>
          </li>
          <li className="ml-4 border-l border-white/10 pl-10">
            <Signup />
          </li>
        </ul>

        {/* Mobile Menu Icon (Placeholder for functionality) */}
        <div className="md:hidden text-white text-2xl">
            ☰
        </div>
      </div>
    </motion.nav>
  );
}