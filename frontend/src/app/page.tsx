"use client";

import React, { useState, useRef, useEffect } from "react";
import Navbar from "../components/navbar_home";
import { useWallet } from "../components/WalletContext";
import Signup from "../components/signup";
import { motion, AnimatePresence, useScroll, useTransform, useMotionValue, useSpring } from "framer-motion";

const NetworkCapabilities = () => {
  // Spotlight effect logic
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <section 
      id="features" 
      className="py-32 px-6 bg-[#050505] relative overflow-hidden"
      onMouseMove={handleMouseMove}
    >
      
      {/* CRAZY BACKGROUND: Moving Grid Lines */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header with Glitch Effect */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-24 gap-8">
          <div className="relative group">
            <h2 className="text-7xl md:text-9xl font-black tracking-tighter leading-none">
              NETWORK <br /> 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-emerald-200 to-cyan-500 animate-pulse">
                CAPABILITIES
              </span>
            </h2>
            {/* Ghost Heading for "Crazy" styling */}
            <h2 className="absolute top-0 left-0 text-7xl md:text-9xl font-black tracking-tighter leading-none opacity-10 blur-sm group-hover:translate-x-2 group-hover:-translate-y-2 transition-transform duration-300 pointer-events-none">
              NETWORK <br /> CAPABILITIES
            </h2>
          </div>
          
          <div className="flex flex-col items-end text-right">
            <div className="h-1 w-24 bg-emerald-500 mb-4" />
            <p className="text-zinc-500 max-w-xs font-mono text-xs uppercase tracking-[0.3em] leading-relaxed">
              Propelling waste management into the <span className="text-white">Web3 Era</span> via immutable distributed ledgers.
            </p>
          </div>
        </div>

        {/* Feature Grid with Spotlight Effect */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className="relative group p-10 bg-zinc-900/20 border border-white/5 rounded-[2rem] overflow-hidden transition-all duration-500 hover:border-emerald-500/50 hover:shadow-[0_0_30px_-10px_rgba(16,185,129,0.3)]"
            >
              {/* THE SPOTLIGHT: Only visible on hover */}
              <motion.div
                className="pointer-events-none absolute -inset-px rounded-[2rem] opacity-0 group-hover:opacity-100 transition duration-300"
                style={{
                  background: useTransform(
                    [mouseX, mouseY],
                    ([x, y]) => `radial-gradient(600px circle at ${x}px ${y}px, rgba(16,185,129,0.15), transparent 40%)`
                  ),
                }}
              />

              {/* Icon Container with Glassmorphism */}
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-zinc-950 border border-white/10 flex items-center justify-center text-emerald-500 mb-8 group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-black transition-all duration-500 shadow-xl">
                  <span className="font-mono text-lg font-bold">0{index + 1}</span>
                </div>

                <h3 className="text-2xl font-bold text-white mb-4 tracking-tight group-hover:translate-x-2 transition-transform">
                  {feature.title}
                </h3>
                
                <p className="text-zinc-500 leading-relaxed text-sm font-medium group-hover:text-zinc-300 transition-colors">
                  {feature.description}
                </p>
              </div>

              {/* Decorative "Data Corner" */}
              <div className="absolute bottom-4 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-[10px] font-mono text-emerald-500/50 uppercase tracking-widest">
                  Secure_Node_0{index + 1}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ---------- Data ----------
const features = [
  { title: "Decentralized Waste Storage", description: "Records stored on IPFS or Arweave, ensuring tamper-proof, immutable records accessible to all." },
  { title: "On-Chain Tracking", description: "Verifiable timestamps and blockchain metadata for full transparency of the waste lifecycle." },
  { title: "Tokenized Recognition", description: "Contributors earn reputation tokens or NFTs for responsible handling." },
  { title: "Automated Lifecycle", description: "Smart contracts update status from collection to utilization automatically." },
  { title: "Audit & Compliance", description: "Publicly auditable movement ensuring regulatory compliance and accountability." },
  { title: "AI-Powered Analytics", description: "Predict generation and optimize routes for smarter city management." }
];

const stages = [
  { 
    id: 0, 
    label: "User", 
    image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=300&q=80", // Cyberpunk Person
    asset: "https://cdn-icons-png.flaticon.com/512/644/644617.png", // E-waste icon
    color: "#10b981", 
    description: "The journey begins with the user initiating a decentralized waste request for end-of-life electronics." 
  },
  { 
    id: 1, 
    label: "Collector", 
    image: "https://images.unsplash.com/photo-1586769852836-bc069f19e1b6?auto=format&fit=crop&w=300&q=80", // High-tech truck/logistics
    asset: "https://cdn-icons-png.flaticon.com/512/1739/1739521.png", // Truck icon
    color: "#3b82f6", 
    description: "Certified collectors receive the request and transport the e-waste to specialized sorting facilities." 
  },
  { 
    id: 2, 
    label: "Recycler", 
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=300&q=80", // Circuitry/Hardware
    asset: "https://cdn-icons-png.flaticon.com/512/2950/2950153.png", // Recycled components
    color: "#8b5cf6", 
    description: "Recyclers dismantle and extract valuable rare-earth metals and reusable components." 
  },
  { 
    id: 3, 
    label: "Processing Hub", 
    image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=300&q=80", // AI/Robotics
    asset: "https://cdn-icons-png.flaticon.com/512/900/900618.png", // New device icon
    color: "#f59e0b", 
    description: "The hub integrates recycled materials into new manufacturing lines, completing the circular loop." 
  },
];

const MissionManifesto = () => {
  const [scrambleText, setScrambleText] = useState("PLANETARY_INTEGRITY");
  const phrases = ["IMMUTABLE_LOGS", "AI_OPTIMIZATION", "ZERO_LEAKAGE", "CIRCULAR_PROTOCOL"];
  
  // Simple cycle effect for the "scramble" feel
  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setScrambleText(phrases[i % phrases.length]);
      i++;
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative py-32 px-6 overflow-hidden bg-black">
      {/* BACKGROUND CRAZINESS: Animated Scanning Laser */}
      <motion.div 
        animate={{ 
          top: ["-10%", "110%"],
          opacity: [0, 1, 1, 0] 
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent z-0 shadow-[0_0_20px_#10b981]"
      />

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="flex flex-col items-center">
          
          {/* Status Badge */}
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            className="flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/5 mb-10"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[10px] font-mono text-emerald-500 uppercase tracking-[0.3em]">
              System_Mission // {scrambleText}
            </span>
          </motion.div>

          {/* Main Hero Text */}
          <div className="relative">
            <motion.p 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-4xl md:text-7xl font-bold text-center tracking-tighter leading-[0.9] md:leading-[0.85]"
            >
              WE ARE DELETING <br />
              <span className="text-zinc-800">MESSY LEGACY LOGS</span> <br />
              TO DEPLOY THE <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                PLANETARY LEDGER.
              </span>
            </motion.p>
          </div>

          {/* Core Descriptive Text */}
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl"
          >
            <div className="border-l border-emerald-500/50 pl-6">
              <p className="text-zinc-400 text-lg leading-relaxed">
                CRX replaces vulnerable paper trails with <span className="text-white font-mono">Immutable Blockchain Records</span>. 
                Every gram of waste is a digital asset, tracked from origin to reuse.
              </p>
            </div>
            <div className="border-l border-zinc-800 pl-6">
              <p className="text-zinc-400 text-lg leading-relaxed">
                By infusing <span className="text-white font-mono">AI-Driven Efficiency</span> into logistics, we don&apos;t just manage waste; 
                we architect the end of the landfill era.
              </p>
            </div>
          </motion.div>

          {/* Decorative Binary Rain (Static/Subtle) */}
          <div className="mt-16 opacity-10 font-mono text-[8px] flex gap-4 text-emerald-500 pointer-events-none select-none">
            {Array.from({ length: 12 }).map((_, i) => (
              <span key={i}>01011001 11001010 00110101</span>
            ))}
          </div>
        </div>
      </div>

      {/* Edge Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#000_80%)] pointer-events-none" />
    </section>
  );
};
// ---------- Sub-Components ----------

const ParallaxImage = ({ src, title, direction }: { src: string; title: string; direction: number }) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const x = useTransform(scrollYProgress, [0, 1], [150 * direction, -150 * direction]);

  return (
    <div ref={ref} className="relative h-[50vh] flex items-center justify-center overflow-hidden my-12">
      <motion.div style={{ x }} className="flex gap-12 items-center whitespace-nowrap">
        <div className="w-[350px] h-[250px] md:w-[600px] md:h-[400px] overflow-hidden rounded-3xl border border-white/10 shadow-2xl">
          <img src={src} alt={title} className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700" />
        </div>
        <h2 className="text-8xl md:text-[12rem] font-black uppercase text-white/5 tracking-tighter select-none">
          {title}
        </h2>
      </motion.div>
    </div>
  );
};

const CircularEconomy = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeStage, setActiveStage] = useState(0);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Calculate rotation and path drawing
  const rotate = useTransform(scrollYProgress, [0, 1], [0, 360]);
  const pathLength = useTransform(scrollYProgress, [0, 1], [0, 1]);

  useEffect(() => {
    return scrollYProgress.onChange((v) => {
      if (v < 0.25) setActiveStage(0);
      else if (v < 0.5) setActiveStage(1);
      else if (v < 0.75) setActiveStage(2);
      else setActiveStage(3);
    });
  }, [scrollYProgress]);

  return (
    <section ref={containerRef} className="relative h-[400vh] bg-[#050505]">
      <div className="sticky top-0 h-screen flex items-center justify-center overflow-hidden">
        
        {/* Ambient background glow based on stage color */}
        <motion.div 
          animate={{ backgroundColor: stages[activeStage].color }}
          className="absolute w-[800px] h-[800px] rounded-full blur-[180px] opacity-5 transition-colors duration-1000"
        />

        <div className="max-w-7xl w-full mx-auto px-6 flex flex-col lg:flex-row items-center gap-20 relative z-10">
          
          {/* TEXT CONTENT */}
          <div className="flex-1 order-2 lg:order-1">
            <AnimatePresence mode="wait">
              <motion.div 
                key={activeStage}
                initial={{ opacity: 0, x: -50 }} 
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50 }}
                transition={{ duration: 0.6, ease: "anticipate" }}
                className="space-y-8"
              >
                <div className="flex items-center gap-4">
                  <div className="h-[2px] w-12 bg-emerald-500" />
                  <span className="text-zinc-500 font-mono text-sm tracking-[0.4em] uppercase">
                    Phase 0{activeStage + 1}
                  </span>
                </div>
                <h2 className="text-6xl md:text-8xl font-black tracking-tighter uppercase leading-none text-white">
                  {stages[activeStage].label}
                </h2>
                <p className="text-zinc-400 text-xl leading-relaxed max-w-lg font-light">
                  {stages[activeStage].description}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* CIRCULAR VISUAL */}
          <div className="relative w-[320px] h-[320px] md:w-[600px] md:h-[600px] order-1 lg:order-2">
            
            {/* SVG Connector Path */}
            <svg className="absolute inset-0 w-full h-full -rotate-90 overflow-visible" viewBox="0 0 100 100">
              {/* Static Background Path */}
              <circle cx="50" cy="50" r="48" fill="none" stroke="white" strokeWidth="0.1" strokeOpacity="0.1" />
              {/* Dynamic Progress Path */}
              <motion.circle
                cx="50"
                cy="50"
                r="48"
                fill="none"
                stroke={stages[activeStage].color}
                strokeWidth="0.5"
                pathLength={pathLength}
                strokeLinecap="round"
                style={{ filter: `drop-shadow(0 0 8px ${stages[activeStage].color})` }}
              />
            </svg>

            {/* THE TRAVELER (Moving Asset Image) */}
            <motion.div style={{ rotate }} className="absolute inset-0 pointer-events-none">
              <motion.div 
                className="absolute top-[-25px] left-1/2 -translate-x-1/2 w-16 h-16 p-2 bg-zinc-900 border border-white/20 rounded-xl shadow-2xl flex items-center justify-center"
                style={{ rotate: useTransform(rotate, (v) => -v) }}
              >
                <img src={stages[activeStage].asset} alt="traveler" className="w-10 h-10 object-contain brightness-125" />
              </motion.div>
            </motion.div>

            {/* CYCLE POINTS (The 4 Stations) */}
            {stages.map((stage, i) => {
              const angle = i * 90;
              const isActive = activeStage === i;
              
              return (
                <div
                  key={stage.id}
                  className="absolute w-24 h-24 md:w-32 md:h-32 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center"
                  style={{
                    top: `${50 + 50 * Math.sin((angle - 90) * (Math.PI / 180))}%`,
                    left: `${50 + 50 * Math.cos((angle - 90) * (Math.PI / 180))}%`,
                  }}
                >
                  <motion.div 
                    animate={{ 
                      scale: isActive ? 1.2 : 1,
                      borderColor: isActive ? stage.color : "rgba(255,255,255,0.1)"
                    }}
                    className="w-full h-full rounded-full border-2 overflow-hidden bg-zinc-900 relative group cursor-pointer"
                  >
                    <img src={stage.image} alt={stage.label} className={`w-full h-full object-cover transition-all duration-700 ${isActive ? "opacity-100 grayscale-0" : "opacity-30 grayscale"}`} />
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-transparent transition-colors" />
                  </motion.div>
                  
                  <motion.span 
                    animate={{ color: isActive ? "#fff" : "#555" }}
                    className="absolute -bottom-8 text-[10px] font-black uppercase tracking-[0.2em] whitespace-nowrap"
                  >
                    {stage.label}
                  </motion.span>
                </div>
              );
            })}

            {/* Central Brand Unit */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
               <div className="w-24 h-24 md:w-40 md:h-40 rounded-full bg-zinc-950/80 backdrop-blur-3xl border border-white/5 flex flex-col items-center justify-center shadow-2xl">
                  <div className="text-emerald-500 font-black text-2xl tracking-tighter italic">CRX.</div>
                  <div className="text-[8px] font-mono text-zinc-500 uppercase tracking-widest mt-1 italic">On-Chain Cycle</div>
               </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};

const Footer = () => {
  return (
    <footer className="relative py-24 px-6 bg-[#050505] border-t border-white/5 overflow-hidden">
      {/* Background Decorative "Grid" Pulse */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent opacity-20" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          
          {/* Brand Column */}
          <div className="col-span-1 md:col-span-2 space-y-6">
            <motion.div 
              whileHover={{ skewX: -10 }}
              className="text-4xl font-black italic tracking-tighter cursor-default"
            >
              CRX<span className="text-emerald-500">.</span>
            </motion.div>
            <p className="text-zinc-500 max-w-sm text-sm leading-relaxed font-medium">
              Architecting the future of waste management through decentralized protocols and AI-driven reclamation.
            </p>
            {/* Live Status Indicator */}
            <div className="flex items-center gap-3">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">
                Network_Status: <span className="text-emerald-500">Operational</span>
              </span>
            </div>
          </div>

          {/* Navigation Columns */}
          <div className="space-y-4">
            <h4 className="text-[10px] font-black uppercase text-zinc-300 tracking-[0.3em]">Protocol</h4>
            <ul className="space-y-2 text-sm text-zinc-500 font-mono">
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Governance</a></li>
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Smart Contracts</a></li>
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Whitepaper</a></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-[10px] font-black uppercase text-zinc-300 tracking-[0.3em]">Connect</h4>
            <ul className="space-y-2 text-sm text-zinc-500 font-mono">
              <li><a href="#" className="hover:text-cyan-400 transition-colors">Terminal_X</a></li>
              <li><a href="#" className="hover:text-cyan-400 transition-colors">Discord_Server</a></li>
              <li><a href="#" className="hover:text-cyan-400 transition-colors">Github_Repo</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex gap-6">
            <span className="text-[10px] text-zinc-600 font-mono uppercase tracking-tighter">Lat: 51.5074° N</span>
            <span className="text-[10px] text-zinc-600 font-mono uppercase tracking-tighter">Long: 0.1278° W</span>
          </div>
          
          <div className="text-center md:text-right">
            <p className="text-zinc-500 text-[10px] font-mono uppercase tracking-[0.2em]">
              © 2026 CRX NETWORK // <span className="text-emerald-500/80">AUTHENTICATED_LEDGER</span>
            </p>
          </div>
        </div>
      </div>

      {/* Extreme Styling: Corner Accent */}
      <div className="absolute bottom-0 right-0 w-32 h-32 bg-emerald-500/5 blur-[60px] pointer-events-none" />
    </footer>
  );
};

// ---------- Main Page ----------

const Dashboard: React.FC = () => {
  const { address } = useWallet();

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-emerald-500 selection:text-black">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-900/20 blur-[150px] rounded-full" />
        
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-[5rem] md:text-[8rem] font-black leading-[0.85] tracking-tighter mb-8">
              CRX <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-500">
                ECO-SYSTEM
              </span>
            </h1>
            <p className="text-zinc-400 text-xl md:text-2xl leading-relaxed max-w-lg mb-10">
              Transforming waste into digital assets. Secure, transparent, and decentralized management for the modern city.
            </p>
            <div className="flex gap-4">
              <Signup />
              <button className="px-8 py-4 rounded-full border border-white/10 hover:bg-white hover:text-black transition-all font-bold">
                EXPLORE DATA
              </button>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative flex justify-center"
          >
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
              <img
                src="/CODE BLOCK.png"
                alt="Logo"
                className="relative rounded-full w-72 h-72 md:w-[500px] md:h-[500px] object-cover grayscale brightness-75 hover:grayscale-0 transition-all duration-700 border-2 border-white/10"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Mission Section */}
      <MissionManifesto />
      

      <CircularEconomy />

      <section className="py-20">
        <div className="text-center mb-10">
            <h2 className="text-emerald-500 font-mono text-xs tracking-widest uppercase">Visual Journey</h2>
        </div>
        <ParallaxImage src="https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=1200" title="COLLECT" direction={1} />
        <ParallaxImage src="/download.jpg" title="SORT" direction={-1} />
        <ParallaxImage src="/image3.jpg" title="PROCESS" direction={1} />
      </section>

      {/* Features Grid */}
      <NetworkCapabilities />

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Dashboard;