// import React, { useState } from 'react';
// import { Search, ArrowUpRight, Sparkles } from 'lucide-react';
// import { motion, AnimatePresence } from 'framer-motion';
// import { TOOLS } from './constants';
// import { PDFTool } from './types';

// const Tools: React.FC = () => {
//   const [search, setSearch] = useState("");
//   const [activeCategory, setActiveCategory] = useState<string>("all");

//   const filteredTools = TOOLS.filter(tool => {
//     const matchesSearch = tool.title.toLowerCase().includes(search.toLowerCase()) || 
//                          tool.description.toLowerCase().includes(search.toLowerCase());
//     const matchesCategory = activeCategory === "all" || tool.category === activeCategory;
//     return matchesSearch && matchesCategory;
//   });

//   const handleAlert = () => alert("Frontend demo only");

//   const categories = [
//     { id: 'all', label: 'All Tools' },
//     { id: 'edit', label: 'Edit & Sign' },
//     { id: 'convert', label: 'Convert' },
//     { id: 'optimize', label: 'Optimize' },
//     { id: 'security', label: 'Security' },
//   ];

//   return (
//     <section className="py-24 bg-white dark:bg-slate-950 transition-colors" id="tools">
//       <div className="container mx-auto px-4 md:px-8">
//         {/* Header Area */}
//         <div className="flex flex-col md:flex-row md:items-center justify-between gap-10 mb-20">
//           <div className="space-y-4">
//             <div className="flex items-center gap-2 text-[#0061ff] font-black text-xs uppercase tracking-[0.2em]">
//               <Sparkles size={16} />
//               The Intelligence Hub
//             </div>
//             <h2 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter">Your AI Toolbox.</h2>
//             <p className="text-lg text-slate-500 dark:text-slate-400 max-w-lg font-medium">Streamline your document workflow with 20+ specialized PDF tools optimized by AI.</p>
//           </div>
          
//           <div className="relative group min-w-[320px]">
//             <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#0061ff] transition-colors" size={22} />
//             <input 
//               type="text"
//               placeholder="Search AI tools..."
//               className="w-full pl-14 pr-8 py-5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-[#0061ff] dark:focus:border-blue-500 transition-all font-semibold text-slate-700 dark:text-slate-200"
//               value={search}
//               onChange={(e) => setSearch(e.target.value)}
//             />
//           </div>
//         </div>

//         {/* Categories Bar */}
//         <div className="flex flex-wrap gap-3 mb-12 items-center">
//           <span className="text-xs font-black text-slate-400 uppercase tracking-widest mr-2">Filter By:</span>
//           {categories.map((cat) => (
//             <button
//               key={cat.id}
//               onClick={() => setActiveCategory(cat.id)}
//               className={`px-6 py-3 rounded-2xl text-sm font-bold transition-all ${
//                 activeCategory === cat.id 
//                   ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-950 shadow-xl scale-105' 
//                   : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-100 dark:border-slate-800'
//               }`}
//             >
//               {cat.label}
//             </button>
//           ))}
//         </div>

//         {/* Grid */}
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
//           <AnimatePresence mode="popLayout">
//             {filteredTools.map((tool, idx) => (
//               <motion.div
//                 key={tool.id}
//                 layout
//                 initial={{ opacity: 0, scale: 0.8, y: 40 }}
//                 whileInView={{ opacity: 1, scale: 1, y: 0 }}
//                 viewport={{ once: true, amount: 0.1 }}
//                 exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
//                 transition={{ 
//                   duration: 0.6, 
//                   delay: (idx % 4) * 0.1, 
//                   ease: [0.16, 1, 0.3, 1] 
//                 }}
//               >
//                 <ToolCard tool={tool} onClick={handleAlert} />
//               </motion.div>
//             ))}
//           </AnimatePresence>
//         </div>

//         {filteredTools.length === 0 && (
//           <motion.div 
//             initial={{ opacity: 0 }} 
//             animate={{ opacity: 1 }}
//             className="text-center py-32 bg-slate-50 dark:bg-slate-900/50 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-800"
//           >
//             <div className="bg-white dark:bg-slate-800 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl">
//               <Search size={32} className="text-slate-300" />
//             </div>
//             <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No tools found</h3>
//             <p className="text-slate-500 dark:text-slate-400 font-medium">Try searching for something else like "Merge" or "Word".</p>
//           </motion.div>
//         )}
//       </div>
//     </section>
//   );
// };

// const ToolCard: React.FC<{ tool: PDFTool; onClick: () => void }> = ({ tool, onClick }) => {
//   return (
//     <button 
//       onClick={onClick}
//       className="w-full text-left bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 hover:border-[#0061ff]/30 dark:hover:border-blue-500/30 hover:shadow-[0_40px_80px_-20px_rgba(0,97,255,0.1)] transition-all group relative overflow-hidden flex flex-col h-full active:scale-[0.98]"
//     >
//       <div className="relative mb-8 w-fit">
//         <div className={`absolute inset-0 blur-xl opacity-20 group-hover:opacity-40 transition-opacity ${tool.color}`} />
//         <div className={`relative z-10 p-5 rounded-2xl transition-all group-hover:scale-110 group-hover:-rotate-6 ${tool.color}`}>
//           <tool.icon size={32} strokeWidth={2} />
//         </div>
//       </div>

//       <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-4 group-hover:text-[#0061ff] dark:group-hover:text-blue-400 transition-colors tracking-tight">
//         {tool.title}
//       </h3>
//       <p className="text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed mb-8 flex-grow">
//         {tool.description}
//       </p>
      
//       <div className="flex items-center gap-2 text-xs font-black text-[#0061ff] dark:text-blue-400 uppercase tracking-widest group-hover:translate-x-1 transition-transform">
//         Open Tool <ArrowUpRight size={16} />
//       </div>

//       <div className="absolute -bottom-6 -right-6 p-4 opacity-[0.03] dark:opacity-[0.05] group-hover:opacity-10 transition-opacity rotate-12">
//         <tool.icon size={120} />
//       </div>
//     </button>
//   );
// };

// export default Tools;

import React, { useState, useRef } from 'react';
import { Search, Sparkles, ArrowUpRight, X } from 'lucide-react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { TOOLS } from './constants';
import { PDFTool } from './types';

// Define proper types for motion components
const MotionDiv = motion.div;
const MotionButton = motion.button;

interface ToolsProps {
  onToolSelect?: (tool: PDFTool) => void;
}

const Tools: React.FC<ToolsProps> = ({ onToolSelect }) => {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const clearSearch = () => {
    setSearch("");
  };

  const filteredTools = TOOLS.filter(tool => {
    const query = search.toLowerCase().trim();
    // Search matching logic
    const matchesSearch = tool.title.toLowerCase().includes(query) || 
                         tool.description.toLowerCase().includes(query) ||
                         tool.keywords?.some(k => k.toLowerCase().includes(query));
    
    // If search is active, override category filter to search globally.
    // Otherwise, respect the active category.
    const matchesCategory = search.length > 0 ? true : (activeCategory === "all" || tool.category === activeCategory);
    
    return matchesSearch && matchesCategory;
  });

  const handleToolClick = (tool: PDFTool) => {
    if (onToolSelect) {
      onToolSelect(tool);
    } else {
      // Fallback to AI assistant if no handler provided (legacy behavior)
      const event = new CustomEvent('open-ai-assistant', {
        detail: {
          prompt: `I want to learn more about the **${tool.title}** tool.
          
  Please provide a comprehensive guide covering:
  1. **What it does**: A clear, technical explanation of the process.
  2. **Key Features**: What makes this tool powerful?
  3. **Common Use Cases**: Real-world scenarios where this is useful.
  4. **Pro Tips**: How to get the best results (e.g., file formats, limits, quality settings).`
        }
      });
      window.dispatchEvent(event);
    }
  };

  const handleAskAI = (e: React.MouseEvent, tool: PDFTool) => {
    e.stopPropagation(); // Prevent opening the tool
    const event = new CustomEvent('open-ai-assistant', {
        detail: {
          prompt: `Tell me about the **${tool.title}** tool.`
        }
      });
    window.dispatchEvent(event);
  };

  const categories = [
    { id: 'all', label: 'All Tools' },
    { id: 'organize', label: 'Organize' },
    { id: 'edit', label: 'Edit & Sign' },
    { id: 'convert', label: 'Convert' },
    { id: 'optimize', label: 'Optimize' },
    { id: 'security', label: 'Security' },
  ];

  return (
    // Reduced padding from py-24 to py-16 for compactness
    <section className="py-16 bg-white/[0.01] dark:bg-[#0F172A] transition-colors duration-300 relative" id="tools">
      
      {/* Optional: Add a subtle gradient overlay for dark mode depth if needed, otherwise transparent */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-50/50 dark:to-slate-950/20 pointer-events-none" />

      <div className="container mx-auto px-4 md:px-8 relative z-10">
        {/* Header Area - Reduced margins and text sizes */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-[#0061ff] font-black text-[10px] uppercase tracking-[0.2em]">
              <Sparkles size={14} />
              The Intelligence Hub
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tighter">Your AI Toolbox.</h2>
            <p className="text-base text-slate-500 dark:text-slate-300 max-w-lg font-medium">
              Streamline your document workflow. Click any tool to start.
            </p>
          </div>
          
          <div className="relative group min-w-[280px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-400 group-focus-within:text-[#0061ff] transition-colors" size={18} />
            <input 
              type="text"
              placeholder="Search tools (e.g., 'JPG', 'Merge')..."
              className="w-full pl-11 pr-10 py-3.5 bg-white dark:bg-slate-900 backdrop-blur-md border border-slate-200 dark:border-slate-700 rounded-[1.5rem] focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-[#0061ff] dark:focus:border-blue-500 transition-all font-semibold text-sm text-slate-700 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
              value={search}
              onChange={handleSearchChange}
            />
            <AnimatePresence>
              {search && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-700/50 rounded-full transition-colors"
                >
                  <X size={14} />
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Categories Bar - Reduced padding and font size */}
        <div className="flex flex-wrap gap-2 mb-8 items-center">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">Filter By:</span>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setActiveCategory(cat.id);
                if (search) setSearch("");
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeCategory === cat.id && !search
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-950 shadow-lg scale-105' 
                  : 'bg-white/60 dark:bg-slate-800/60 backdrop-blur-md text-slate-500 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-100 dark:border-slate-700/50'
              }`}
              style={{
                opacity: search ? 0.5 : 1,
                pointerEvents: search ? 'none' : 'auto'
              }}
            >
              {cat.label}
            </button>
          ))}
          {search && (
            <motion.span 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="ml-2 text-xs font-bold text-[#0061ff]"
            >
              Searching All Tools
            </motion.span>
          )}
        </div>

        {/* Grid - Reduced gap from gap-8 to gap-5 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          <AnimatePresence mode="popLayout">
            {filteredTools.map((tool, idx) => (
              <MotionDiv
                key={tool.id}
                initial={{ opacity: 0, scale: 0.8, y: 40 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true, amount: 0.1 }}
                exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
                transition={{ 
                  duration: 0.6, 
                  delay: (idx % 4) * 0.05, 
                  ease: [0.16, 1, 0.3, 1] 
                }}
              >
                <ToolCard 
                  tool={tool} 
                  onClick={() => handleToolClick(tool)} 
                  onAskAI={(e) => handleAskAI(e, tool)}
                />
              </MotionDiv>
            ))}
          </AnimatePresence>
        </div>

        {filteredTools.length === 0 && (
          <MotionDiv 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }}
            className="text-center py-24 bg-slate-50/50 dark:bg-slate-900/50 rounded-[2rem] border-2 border-dashed border-slate-200 dark:border-slate-800"
          >
            <div className="bg-white dark:bg-slate-800 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Search size={24} className="text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">No tools found</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Try searching for something else like "Merge" or "Word".</p>
            {search && (
              <button 
                onClick={clearSearch}
                className="mt-4 px-5 py-1.5 bg-[#0061ff] text-white rounded-full font-bold text-xs hover:bg-blue-600 transition-colors"
              >
                Clear Search
              </button>
            )}
          </MotionDiv>
        )}
      </div>
    </section>
  );
};

const ToolCard: React.FC<{ tool: PDFTool; onClick: () => void; onAskAI: (e: React.MouseEvent) => void }> = ({ tool, onClick, onAskAI }) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 120 };
  const mouseX = useSpring(x, springConfig);
  const mouseY = useSpring(y, springConfig);

  const iconX = useTransform(mouseX, [-150, 150], [-8, 8]);
  const iconY = useTransform(mouseY, [-150, 150], [-8, 8]);

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;
    
    // For spotlight (css gradient)
    setPosition({ x: clientX, y: clientY });
    
    // For parallax (center based)
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    x.set(clientX - centerX);
    y.set(clientY - centerY);
  };
  
  const handleMouseLeave = () => {
      setIsHovered(false);
      x.set(0);
      y.set(0);
  }

  return (
    <MotionButton 
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
      initial="idle"
      whileHover="hover"
      whileTap="tap"
      variants={{
        idle: { y: 0, rotate: 0, scale: 1 },
        hover: { 
          y: -5, 
          scale: 1.03, // Enhanced scaling
          transition: { type: "spring", stiffness: 400, damping: 25 }
        },
        tap: { scale: 0.98 }
      }}
      className="w-full text-left bg-white dark:bg-slate-900 backdrop-blur-xl p-5 rounded-[1.5rem] border border-slate-200 dark:border-slate-700 hover:border-[#0061ff]/30 dark:hover:border-blue-500/50 hover:shadow-[0_20px_40px_-10px_rgba(0,97,255,0.1)] dark:hover:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] transition-colors duration-300 group relative overflow-hidden flex flex-col h-full min-h-[220px]"
    >
      {/* Spotlight Effect */}
      <div 
        className="absolute inset-0 pointer-events-none transition-opacity duration-500 opacity-0 group-hover:opacity-100"
        style={{
          background: `radial-gradient(400px circle at ${position.x}px ${position.y}px, rgba(0, 97, 255, 0.08), transparent 40%)`
        }}
      />
      <div 
        className="absolute inset-0 pointer-events-none transition-opacity duration-500 opacity-0 group-hover:opacity-100 dark:mix-blend-overlay"
        style={{
           background: `radial-gradient(300px circle at ${position.x}px ${position.y}px, rgba(255,255,255,0.1), transparent 40%)`
        }}
      />

      {/* Card Background Glow */}
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-[0.05] transition-opacity duration-500 pointer-events-none ${tool.glow}`} />

      {/* Header with Icon */}
      <div className="relative mb-4 w-fit z-10">
        {/* Particle Burst Effect */}
        <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
          {[...Array(8)].map((_, i) => {
            const angle = (i * 360) / 8;
            const radian = (angle * Math.PI) / 180;
            return (
              <MotionDiv
                key={i}
                variants={{
                  idle: { x: 0, y: 0, opacity: 0, scale: 0 },
                  hover: {
                    x: Math.cos(radian) * 25,
                    y: Math.sin(radian) * 25,
                    opacity: [0, 1, 0],
                    scale: [0, 1.2, 0],
                    transition: {
                      duration: 0.8,
                      ease: "easeOut",
                      repeat: Infinity,
                      delay: Math.random() * 0.2
                    }
                  }
                }}
                className={`absolute w-1 h-1 rounded-full ${tool.glow}`}
              />
            );
          })}
        </div>

        {/* Glow Effect for Icon */}
        <div className={`absolute inset-0 blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-500 ${tool.glow}`} />
        
        <MotionDiv 
           style={{ x: iconX, y: iconY }}
           variants={{
              idle: { scale: 1, rotate: 0 },
              hover: { scale: 1.15, rotate: -5 }
           }}
           className={`relative z-10 p-3.5 rounded-xl transition-colors duration-300 ${tool.color}`}
        >
          <tool.icon size={24} strokeWidth={2} />
        </MotionDiv>
      </div>

      <h3 className="relative z-10 text-lg font-black text-slate-900 dark:text-white mb-2 group-hover:text-[#0061ff] dark:group-hover:text-blue-400 transition-colors tracking-tight flex items-center gap-2">
        {tool.title}
        <ArrowUpRight size={14} className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-slate-400" />
      </h3>
      
      <p className="relative z-10 text-xs font-medium text-slate-500 dark:text-slate-300 leading-relaxed mb-6 flex-grow">
        {tool.description}
      </p>
      
      {/* Footer / CTA Area */}
      <div className="relative z-10 mt-auto pt-4 border-t border-slate-200 dark:border-slate-700 group-hover:border-[#0061ff]/20 dark:group-hover:border-blue-500/20 transition-colors w-full flex items-center justify-between">
         <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest group-hover:text-slate-500 dark:group-hover:text-slate-400 transition-colors">
            {tool.category}
         </span>
         
         <div 
          onClick={onAskAI}
          className="cursor-pointer flex items-center gap-1.5 pl-3 py-1 pr-1 rounded-full bg-slate-50 dark:bg-slate-800 group-hover:bg-[#0061ff] group-hover:text-white transition-all duration-300 hover:scale-105"
        >
            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 group-hover:text-white transition-colors">
              Ask AI
            </span>
            <div className="w-5 h-5 rounded-full bg-white dark:bg-slate-800 group-hover:bg-white/20 flex items-center justify-center text-[#0061ff] dark:text-white group-hover:text-white transition-colors">
               <Sparkles size={10} className="group-hover:animate-pulse" />
            </div>
         </div>
      </div>

      {/* Decorative large icon background - Reduced size */}
      <div className="absolute -bottom-4 -right-4 p-4 opacity-[0.03] dark:opacity-[0.05] group-hover:opacity-[0.08] transition-opacity rotate-12 pointer-events-none">
        <tool.icon size={80} />
      </div>
    </MotionButton>
  );
};

export default Tools;