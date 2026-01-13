// import React from 'react';
// import { Sparkles, ArrowRight, Upload, FileCheck, Layers, Cpu, CheckCircle2, FileText, ShieldCheck } from 'lucide-react';
// import { motion } from 'framer-motion';

// const Hero: React.FC = () => {
//   const handleAlert = () => alert("Frontend demo only");

//   return (
//     <section className="relative pt-32 pb-24 overflow-hidden mesh-gradient">
//       <div className="container mx-auto px-4 md:px-8 flex flex-col lg:flex-row items-center gap-16 lg:gap-24 relative z-10">
        
//         {/* Content Side */}
//         <div className="w-full lg:w-[55%] space-y-10">
//           <motion.div 
//             initial={{ opacity: 0, scale: 0.9 }}
//             animate={{ opacity: 1, scale: 1 }}
//             transition={{ duration: 0.5 }}
//             className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 text-[#0061ff] dark:text-blue-400 rounded-full text-xs font-bold uppercase tracking-widest shadow-sm"
//           >
//             <Sparkles size={14} className="animate-pulse" />
//             Empowering 20 Million+ Users Monthly
//           </motion.div>

//           <div className="space-y-6">
//             <motion.h1 
//               initial={{ opacity: 0, y: 30 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ duration: 0.7, delay: 0.1 }}
//               className="text-6xl md:text-7xl xl:text-8xl font-black text-slate-900 dark:text-white leading-[0.95] tracking-tighter"
//             >
//               Master Your <span className="text-[#0061ff] relative">PDFs<span className="absolute -bottom-2 left-0 w-full h-2 bg-blue-200 dark:bg-blue-900/40 rounded-full -z-10"></span></span> <br /> 
//               <span className="text-slate-800 dark:text-slate-200">With AI Precision.</span>
//             </motion.h1>

//             <motion.p 
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ duration: 0.7, delay: 0.2 }}
//               className="text-xl text-slate-600 dark:text-slate-400 leading-relaxed max-w-xl font-medium"
//             >
//               Every tool you need to work with PDFs in one place. Combine, split, compress, and convert with our high-speed AI engine.
//             </motion.p>
//           </div>

//           <motion.div 
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.7, delay: 0.3 }}
//             className="flex flex-col sm:flex-row items-center gap-6"
//           >
//             <button 
//               onClick={handleAlert}
//               className="w-full sm:w-auto px-10 py-5 bg-[#0061ff] text-white font-black text-lg rounded-2xl shadow-2xl shadow-blue-500/40 hover:bg-blue-700 hover:shadow-blue-500/60 hover:-translate-y-1.5 transition-all flex items-center justify-center gap-3 group active:scale-95"
//             >
//               Select PDF files
//               <ArrowRight size={24} className="group-hover:translate-x-1.5 transition-transform" />
//             </button>
//             <div className="hidden sm:flex items-center gap-4 px-8 py-5 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl text-slate-500 dark:text-slate-400 font-bold hover:border-[#0061ff] transition-colors cursor-pointer group">
//               <Upload size={20} className="group-hover:-translate-y-1 transition-transform" />
//               Drop PDFs here
//             </div>
//           </motion.div>

//           <motion.div 
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             transition={{ delay: 0.6 }}
//             className="flex flex-wrap gap-x-8 gap-y-4 pt-6"
//           >
//             {['No Installation', 'High Security', 'Unlimited Access'].map(item => (
//               <div key={item} className="flex items-center gap-2 text-sm font-bold text-slate-500 dark:text-slate-400">
//                 <CheckCircle2 size={18} className="text-[#0061ff]" />
//                 {item}
//               </div>
//             ))}
//           </motion.div>
//         </div>

//         {/* Visual Side (Advanced Orbital UI) */}
//         <motion.div 
//           initial={{ opacity: 0, x: 50 }}
//           animate={{ opacity: 1, x: 0 }}
//           transition={{ duration: 1 }}
//           className="w-full lg:w-[45%] flex justify-center lg:justify-end relative"
//         >
//           <div className="relative w-80 h-80 md:w-[500px] md:h-[500px] flex items-center justify-center">
//             {/* Animated Glow Rings */}
//             <div className="absolute inset-0 bg-[#0061ff]/5 dark:bg-blue-500/10 rounded-full blur-[100px] animate-pulse" />
//             <div className="absolute inset-[15%] border border-[#0061ff]/10 dark:border-blue-500/10 rounded-full animate-[spin_20s_linear_infinite]" />
//             <div className="absolute inset-[25%] border border-[#0061ff]/20 dark:border-blue-500/20 rounded-full animate-[spin_15s_linear_infinite_reverse]" />
            
//             {/* Center Engine Core */}
//             <div className="relative z-10 w-40 h-40 md:w-64 md:h-64 bg-white dark:bg-slate-900 rounded-[3rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.2)] dark:shadow-[0_50px_100px_-20px_rgba(0,97,255,0.15)] flex flex-col items-center justify-center p-8 border border-slate-100 dark:border-slate-800 float-animation">
//               <div className="bg-[#0061ff] p-5 rounded-3xl text-white mb-4 shadow-xl shadow-blue-500/30 transform transition-transform group-hover:scale-110">
//                 <Cpu size={48} strokeWidth={1.5} />
//               </div>
//               <span className="font-black text-slate-900 dark:text-white text-xl md:text-2xl tracking-tight">PDF AI</span>
//               <div className="mt-2 flex gap-1">
//                 <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
//                 <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">System Active</span>
//               </div>
//             </div>

//             {/* Floating Orbiting Items */}
//             <OrbitIcon 
//               Icon={FileCheck} 
//               delay={0} 
//               label="Intelligent Scan" 
//               color="bg-blue-500 text-white" 
//               pos="-top-4 left-1/2 -translate-x-1/2"
//             />
//             <OrbitIcon 
//               Icon={Layers} 
//               delay={0.8} 
//               label="Bulk Process" 
//               color="bg-indigo-500 text-white" 
//               pos="top-1/2 right-0 translate-x-4 -translate-y-1/2"
//             />
//             <OrbitIcon 
//               Icon={FileText} 
//               delay={1.6} 
//               label="OCR Vision" 
//               color="bg-emerald-500 text-white" 
//               pos="-bottom-4 left-1/2 -translate-x-1/2"
//             />
//             <OrbitIcon 
//               Icon={ShieldCheck} 
//               delay={2.4} 
//               label="Encryption" 
//               color="bg-[#0061ff] text-white" 
//               pos="top-1/2 left-0 -translate-x-4 -translate-y-1/2"
//             />
//           </div>
//         </motion.div>
//       </div>
//     </section>
//   );
// };

// const OrbitIcon: React.FC<{ Icon: any, delay: number, label: string, color: string, pos: string }> = ({ Icon, delay, label, color, pos }) => (
//   <motion.div 
//     initial={{ scale: 0, opacity: 0 }}
//     animate={{ 
//       scale: 1, 
//       opacity: 1,
//       y: [0, -15, 0],
//     }}
//     transition={{
//       scale: { delay: delay + 0.5 },
//       opacity: { delay: delay + 0.5 },
//       y: { duration: 5, repeat: Infinity, ease: "easeInOut", delay }
//     }}
//     className={`absolute ${pos} flex flex-col items-center gap-3 z-20`}
//   >
//     <div className={`p-5 ${color} rounded-[1.75rem] shadow-2xl shadow-black/10 backdrop-blur-md border-4 border-white dark:border-slate-800 transition-transform hover:scale-110 cursor-default`}>
//       <Icon size={28} />
//     </div>
//     <div className="hidden md:block">
//       <div className="px-4 py-1.5 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md rounded-full shadow-xl border border-slate-100 dark:border-slate-700">
//         <span className="text-[10px] font-black text-slate-800 dark:text-slate-100 uppercase tracking-widest">{label}</span>
//       </div>
//     </div>
//   </motion.div>
// );

// export default Hero;


import React, { useEffect, useRef, useState } from 'react';
import { Sparkles, Upload, Layers, Cpu, FileText, ShieldCheck, Zap, FileCog, Lock, Search, FileCheck, ArrowDown, Minimize2, ArrowRightLeft } from 'lucide-react';
import { motion, useTransform, useSpring, useMotionValue, AnimatePresence } from 'framer-motion';

// Cast motion components to any to avoid TypeScript errors with missing props
const MotionDiv = motion.div as any;
const MotionH1 = motion.h1 as any;
const MotionP = motion.p as any;

const Hero: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  // Mouse position motion values (0 to 1)
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);

  // Smooth spring animation for mouse movement - gentler config for premium feel
  const springConfig = { damping: 30, stiffness: 100, mass: 0.8 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  // Parallax transforms - Background layers
  const xBack = useTransform(smoothX, [0, 1], ["2%", "-2%"]); 
  const yBack = useTransform(smoothY, [0, 1], ["2%", "-2%"]);
  
  const xGrid = useTransform(smoothX, [0, 1], ["1%", "-1%"]);
  const yGrid = useTransform(smoothY, [0, 1], ["1%", "-1%"]);

  // Orbital UI 3D Tilt Effect
  const rotateX = useTransform(smoothY, [0, 1], ["15deg", "-15deg"]);
  const rotateY = useTransform(smoothX, [0, 1], ["-15deg", "15deg"]);

  // Status text cycling for the Core
  const [currentStatus, setCurrentStatus] = useState(0);
  const statuses = [
    { text: "System Ready", color: "text-blue-500 dark:text-blue-400", icon: Zap },
    { text: "Scanning Files", color: "text-cyan-500 dark:text-cyan-400", icon: Search },
    { text: "Optimizing", color: "text-emerald-500 dark:text-emerald-400", icon: Layers },
    { text: "Encrypting", color: "text-purple-500 dark:text-purple-400", icon: Lock }
  ];

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Only run if sectionRef is valid to prevent errors
      if (!sectionRef.current) return;
      
      const { left, top, width, height } = sectionRef.current.getBoundingClientRect();
      // Calculate normalized coordinates
      const x = (e.clientX - left) / width;
      const y = (e.clientY - top) / height;
      
      mouseX.set(x);
      mouseY.set(y);
      
      // Update CSS variables for other effects
      sectionRef.current.style.setProperty('--mouse-x', `${x * 100}%`);
      sectionRef.current.style.setProperty('--mouse-y', `${y * 100}%`);
    };

    window.addEventListener('mousemove', handleMouseMove);
    
    // Cycle statuses
    const interval = setInterval(() => {
      setCurrentStatus((prev) => (prev + 1) % statuses.length);
    }, 2500);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearInterval(interval);
    };
  }, [mouseX, mouseY]);

  // Drag and Drop Logic
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    // Only set dragging to false if we're actually leaving the container (not entering a child)
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    if (file.type === 'application/pdf') {
      alert(`Demo: Successfully received "${file.name}"\nSize: ${(file.size / 1024 / 1024).toFixed(2)} MB\n\nIn a production environment, this would start the upload/processing pipeline.`);
    } else {
      alert('Invalid file format. Please upload a PDF document.');
    }
  };

  // Staggered Container for Content
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30, filter: 'blur(8px)' },
    visible: { 
      opacity: 1, 
      y: 0, 
      filter: 'blur(0px)',
      transition: { 
        duration: 0.8, 
        ease: [0.21, 0.47, 0.32, 0.98] // Custom smooth ease
      }
    },
  };

  return (
    <section 
      ref={sectionRef} 
      id="hero-section"
      // Reduced top and bottom padding for more compact look
      className="relative pt-24 md:pt-36 pb-12 md:pb-20 overflow-hidden min-h-[85vh] flex items-center bg-white/[0.01] dark:bg-[#0F172A] transition-colors duration-500 perspective-[2000px]"
    >
      {/* Interactive Background */}
      <div className="absolute inset-0 w-full h-full -z-10 pointer-events-none overflow-hidden">
         {/* Parallax Grid - Made more visible with blue tint in global CSS */}
         <MotionDiv style={{ x: xGrid, y: yGrid }} className="absolute inset-0 bg-grid opacity-[0.6] dark:opacity-[0.3]" />
         
         {/* Ambient Blobs - Enhanced for "Gradient Blue" feel */}
         <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[100px] animate-blob mix-blend-screen" />
         <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-cyan-500/20 rounded-full blur-[80px] animate-blob animation-delay-2000 mix-blend-screen" />
         <div className="absolute top-[40%] left-[30%] w-[300px] h-[300px] bg-indigo-500/20 rounded-full blur-[60px] animate-blob animation-delay-4000 mix-blend-screen" />

         {/* Mouse Follow Glow */}
         <MotionDiv style={{ x: xBack, y: yBack }} className="absolute inset-0 opacity-80 dark:opacity-60 transition-opacity duration-500">
            <div className="absolute inset-0"
              style={{
                background: `radial-gradient(circle 600px at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(0, 97, 255, 0.12), transparent 40%)`
              }} 
            />
         </MotionDiv>
         
         {/* Bottom Fade */}
         <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-surface-50/80 dark:to-[#0b1121] pointer-events-none" />
      </div>

      <div className="container mx-auto px-4 md:px-8 flex flex-col lg:flex-row items-center gap-12 lg:gap-8 relative z-10">
        
        {/* Left Side: Content - Staggered Container */}
        <MotionDiv 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full lg:w-[55%] space-y-8 text-center lg:text-left pt-6 lg:pt-0"
        >
          <MotionDiv variants={itemVariants} className="inline-flex items-center gap-2 px-3 py-1 bg-white dark:bg-slate-900 backdrop-blur-md border border-slate-200 dark:border-slate-700 text-blue-600 dark:text-blue-300 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-sm mx-auto lg:mx-0 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            <Sparkles size={12} className="text-[#0061ff]" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0061ff] to-cyan-500">New AI Engine 3.0</span>
          </MotionDiv>

          <div className="space-y-4">
            {/* Reduced text size */}
            <MotionH1 
              variants={itemVariants}
              className="text-5xl md:text-6xl xl:text-7xl font-black text-slate-900 dark:text-white leading-[0.9] tracking-tighter"
            >
              Document <br/>
              Intelligence. <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0061ff] via-cyan-400 to-[#0061ff] bg-[length:200%_auto] animate-shimmer relative">Reimagined.</span>
            </MotionH1>

            <MotionP 
              variants={itemVariants}
              className="text-base md:text-lg text-slate-500 dark:text-blue-100/70 leading-relaxed max-w-lg font-medium mx-auto lg:mx-0"
            >
              The most advanced PDF toolkit powered by generative AI. Merge, split, edit, and analyze documents with unprecedented speed.
            </MotionP>

            {/* Quick Access Actions */}
            <MotionDiv 
              variants={itemVariants}
              className="flex flex-wrap items-center justify-center lg:justify-start gap-2.5"
            >
              {[
                { icon: Layers, label: 'Merge', color: 'text-rose-500' },
                { icon: ArrowRightLeft, label: 'Convert', color: 'text-blue-500' },
                { icon: Minimize2, label: 'Compress', color: 'text-emerald-500' },
                { icon: ShieldCheck, label: 'Secure', color: 'text-purple-500' },
              ].map((action) => (
                <button
                  key={action.label}
                  onClick={() => document.getElementById('tools')?.scrollIntoView({ behavior: 'smooth' })}
                  className="group flex items-center gap-2 px-3.5 py-2 bg-white dark:bg-slate-900 backdrop-blur-md border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all hover:scale-105 hover:shadow-lg active:scale-95 hover:border-blue-200 dark:hover:border-blue-800"
                >
                  <div className={`p-1 rounded-md bg-white dark:bg-slate-900 shadow-sm ${action.color}`}>
                    <action.icon size={12} strokeWidth={2.5} />
                  </div>
                  <span className="text-[10px] font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wide">{action.label}</span>
                </button>
              ))}
            </MotionDiv>
          </div>

          <MotionDiv 
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 md:gap-4"
          >
            <div 
              className="relative group w-full sm:w-auto"
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {/* Hidden File Input */}
              <input 
                type="file" 
                ref={fileInputRef}
                className="hidden" 
                accept="application/pdf"
                onChange={handleFileSelect}
              />

              <div className={`absolute -inset-1 bg-gradient-to-r from-[#0061ff] to-cyan-400 rounded-2xl blur opacity-30 group-hover:opacity-80 transition duration-500 ${isDragging ? 'opacity-100 scale-105' : ''}`}></div>
              
              <button 
                onClick={() => fileInputRef.current?.click()}
                className={`relative w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold text-base rounded-2xl shadow-xl shadow-blue-500/20 flex items-center justify-center gap-3 transition-all overflow-hidden ${isDragging ? 'scale-[1.02]' : 'active:scale-95'} hover:brightness-110`}
              >
                <Upload size={20} className={isDragging ? 'animate-bounce' : ''} />
                {isDragging ? 'Drop PDF here' : 'Upload PDF'}
                {/* Shine effect */}
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12" />
              </button>

              {/* Drag Overlay Feedback */}
              <AnimatePresence>
                {isDragging && (
                  <MotionDiv
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="absolute inset-0 bg-[#0061ff] rounded-2xl z-20 flex items-center justify-center text-white font-bold text-base shadow-2xl pointer-events-none ring-4 ring-white/50"
                  >
                     <div className="flex items-center gap-2">
                        <FileCheck className="animate-bounce" /> Release to Upload
                     </div>
                  </MotionDiv>
                )}
              </AnimatePresence>
            </div>

            {/* Secondary CTA */}
            <button 
               onClick={() => document.getElementById('tools')?.scrollIntoView({ behavior: 'smooth' })}
               className="px-6 py-4 rounded-2xl font-bold text-slate-600 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-white/50 dark:hover:bg-slate-800 hover:border-blue-200 dark:hover:border-blue-800 transition-colors hidden sm:flex items-center gap-2 text-sm backdrop-blur-sm"
            >
              Explore Tools
              <ArrowDown size={16} />
            </button>
          </MotionDiv>
        </MotionDiv>

        {/* Right Side: Visual Engine - Reduced dimensions */}
        <MotionDiv 
          initial={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }}
          animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
          transition={{ duration: 1, delay: 0.2 }}
          style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
          className="w-full lg:w-[45%] flex justify-center lg:justify-end relative perspective-1000 h-[350px] md:h-[420px] items-center mt-6 lg:mt-0"
        >
          <div className="relative w-[280px] h-[280px] md:w-[420px] md:h-[420px] flex items-center justify-center transform-style-3d">
            
            {/* Active Data Pipes - Visualizing connectivity */}
            <DataPipe rotate={-45} delay={0} />
            <DataPipe rotate={45} delay={1.5} />
            <DataPipe rotate={135} delay={0.5} />
            <DataPipe rotate={225} delay={2} />

            {/* Glowing Background Rings */}
            <div className="absolute inset-0 bg-[#0061ff]/10 dark:bg-blue-500/10 rounded-full blur-[60px] animate-pulse-glow" />
            <div className="absolute inset-[10%] border border-dashed border-[#0061ff]/30 dark:border-blue-400/30 rounded-full animate-[spin_60s_linear_infinite]" />
            <div className="absolute inset-[25%] border border-[#0061ff]/20 dark:border-blue-500/20 rounded-full animate-[spin_40s_linear_infinite_reverse]" />
            <div className="absolute inset-[35%] border border-slate-200/50 dark:border-slate-700/50 rounded-full" />

            {/* Central Processing Core - Reduced size */}
            <div className="relative z-20 w-40 h-40 md:w-56 md:h-56 bg-white dark:bg-[#111827] backdrop-blur-xl rounded-[2.5rem] shadow-[0_30px_60px_-10px_rgba(0,97,255,0.15)] dark:shadow-[0_30px_60px_-10px_rgba(0,0,0,0.5)] flex flex-col items-center justify-center p-5 border border-slate-200 dark:border-slate-700 group overflow-hidden">
              
              {/* Internal shine */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-blue-50/40 dark:via-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

              {/* Scanning Beam Effect */}
              <MotionDiv 
                className="absolute inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#0061ff] to-transparent z-30 shadow-[0_0_20px_#0061ff]"
                animate={{ top: ['10%', '90%'], opacity: [0, 1, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              />

              <div className="relative z-10 flex flex-col items-center">
                <div className="bg-gradient-to-br from-white to-slate-100 dark:from-slate-800 dark:to-slate-900 p-4 rounded-xl mb-3 shadow-inner relative ring-1 ring-slate-900/5 dark:ring-white/10">
                  <Cpu size={32} className="text-[#0061ff] dark:text-blue-400" strokeWidth={1.5} />
                  <span className="absolute -top-1.5 -right-1.5 flex h-3.5 w-3.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0061ff] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-[#0061ff] border-2 border-white dark:border-slate-900"></span>
                  </span>
                </div>
                
                <h3 className="font-bold text-slate-900 dark:text-white text-base tracking-tight mb-1">AI Core</h3>
                
                {/* Dynamic Status Text */}
                <div className="h-5 flex items-center justify-center w-full overflow-hidden relative">
                  <AnimatePresence mode="wait">
                    <MotionDiv
                      key={currentStatus}
                      initial={{ y: 15, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -15, opacity: 0 }}
                      className={`flex items-center gap-1.5 text-[9px] md:text-[10px] font-bold uppercase tracking-widest ${statuses[currentStatus].color}`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                      {statuses[currentStatus].text}
                    </MotionDiv>
                  </AnimatePresence>
                </div>
              </div>

              {/* Grid Overlay inside Card */}
              <div className="absolute inset-0 bg-grid opacity-[0.1] pointer-events-none" />
            </div>

            {/* Orbiting Tools (Satellites) - Positioned relative to size */}
            <OrbitIcon Icon={FileText} label="OCR" pos="-top-4 left-1/2 -translate-x-1/2" delay={0} />
            <OrbitIcon Icon={Layers} label="Merge" pos="top-1/2 -right-4 -translate-y-1/2" delay={0.5} />
            <OrbitIcon Icon={FileCog} label="Edit" pos="-bottom-4 left-1/2 -translate-x-1/2" delay={1} />
            <OrbitIcon Icon={ShieldCheck} label="Secure" pos="top-1/2 -left-4 -translate-y-1/2" delay={1.5} />
            
            {/* Floating connecting lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20 dark:opacity-10 z-0">
               <circle cx="50%" cy="50%" r="35%" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" className="text-blue-400 dark:text-blue-600 animate-[spin_100s_linear_infinite]" />
            </svg>
          </div>
        </MotionDiv>
      </div>
    </section>
  );
};

// Component for the animated data lines connecting orbit to center
const DataPipe: React.FC<{ rotate: number, delay: number }> = ({ rotate, delay }) => {
  return (
    <div 
      className="absolute top-1/2 left-1/2 w-[60%] h-16 origin-left pointer-events-none flex items-center justify-start overflow-hidden z-0"
      style={{ transform: `translateY(-50%) rotate(${rotate}deg)` }}
    >
       {/* The Line */}
       <div className="absolute top-1/2 left-0 w-full h-[1px] bg-gradient-to-r from-blue-300/80 dark:from-blue-700/80 to-transparent" />
       
       {/* Moving Data Packet */}
       <MotionDiv 
         className="w-12 h-12 bg-blue-500/10 rounded-full blur-xl absolute left-0 flex items-center justify-center"
         animate={{ x: ["0%", "250%"], opacity: [0, 1, 0] }}
         transition={{ duration: 2.5, repeat: Infinity, ease: "linear", delay }}
       >
          <div className="w-1 h-1 bg-[#0061ff] rounded-full shadow-[0_0_8px_#0061ff]" />
       </MotionDiv>
    </div>
  );
}

// Updated OrbitIcon with z-index handling - Reduced size
const OrbitIcon: React.FC<{ Icon: any, delay: number, label: string, pos: string }> = ({ Icon, delay, label, pos }) => (
  <MotionDiv 
    initial={{ scale: 0, opacity: 0 }}
    animate={{ scale: 1, opacity: 1, y: [0, -8, 0] }}
    transition={{
      scale: { delay: delay + 0.5 },
      opacity: { delay: delay + 0.5 },
      y: { duration: 4, repeat: Infinity, ease: "easeInOut", delay: delay * 2 }
    }}
    style={{ transform: 'translateZ(40px)' }}
    className={`absolute ${pos} flex flex-col items-center gap-2 z-30`}
  >
    <div className="relative group">
       <div className="absolute inset-0 bg-[#0061ff] rounded-xl blur-md opacity-20 group-hover:opacity-40 transition-opacity" />
       <div className="relative p-3 bg-white dark:bg-slate-800 rounded-xl shadow-xl shadow-blue-500/10 dark:shadow-black/60 border border-blue-50 dark:border-blue-900/30 text-[#0061ff] dark:text-blue-400 cursor-pointer hover:scale-110 transition-transform duration-300">
         <Icon size={20} />
       </div>
       
       {/* Tooltip-like label */}
       <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-900/90 dark:bg-white/90 backdrop-blur text-white dark:text-slate-900 text-[9px] font-bold uppercase tracking-wider rounded-md opacity-0 group-hover:opacity-100 transition-all transform translate-y-1 group-hover:translate-y-0 whitespace-nowrap shadow-lg">
         {label}
       </div>
    </div>
  </MotionDiv>
);

export default Hero;