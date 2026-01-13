import React from 'react';
import { motion } from 'framer-motion';
import { 
  Zap, ShieldCheck, Laptop, Sparkles, ArrowRight, 
  Lock, Cloud, FileText, CheckCircle2, Cpu, Globe, 
  FileCheck
} from 'lucide-react';

const Features: React.FC = () => {
  return (
    // Reduced padding from py-24 to py-16
    <section id="features" className="py-16 bg-white/[0.01] dark:bg-[#0F172A] transition-colors duration-300 relative overflow-hidden">
      
      {/* Background Decor */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none">
        <div className="absolute top-40 left-0 w-80 h-80 bg-blue-500/5 rounded-full blur-[80px]" />
        <div className="absolute bottom-40 right-0 w-80 h-80 bg-purple-500/5 rounded-full blur-[80px]" />
      </div>

      <div className="container mx-auto px-4 md:px-8 relative z-10">
        <div className="mb-12 text-center max-w-3xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1 mb-4 rounded-full bg-blue-100/50 dark:bg-blue-900/20 text-[#0061ff] dark:text-blue-400 text-[10px] font-bold uppercase tracking-widest border border-blue-200 dark:border-blue-800"
          >
            <Sparkles size={12} />
            Why Choose Us
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-4 tracking-tighter"
          >
            Powering the future of <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0061ff] to-cyan-400">Digital Documents</span>.
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-slate-500 dark:text-slate-300 text-base md:text-lg leading-relaxed font-medium"
          >
             Engineered for speed, built for security. Experience the next generation of PDF manipulation tools.
          </motion.p>
        </div>

        {/* Bento Grid - Reduced gap to gap-4 */}
        <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-4">
          
          {/* Card 1: AI Engine (Big Highlight) */}
          <motion.div 
            whileHover={{ y: -4 }}
            className="col-span-1 md:col-span-6 lg:col-span-8 bg-white/80 dark:bg-slate-900/60 backdrop-blur-md rounded-[2rem] border border-slate-200 dark:border-slate-700/60 p-6 md:p-10 relative overflow-hidden group shadow-lg dark:shadow-black/40"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-white dark:from-blue-950/20 dark:via-transparent dark:to-transparent opacity-50" />
            
            <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center h-full">
              <div className="flex-1 space-y-4 text-center md:text-left">
                <div className="w-12 h-12 bg-[#0061ff] rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
                  <Cpu size={24} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Next-Gen AI Core</h3>
                  <p className="text-slate-500 dark:text-slate-300 leading-relaxed text-base">
                    Our proprietary model identifies forms, extracts data, and summarizes content with 99.8% accuracy.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                   <span className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300">Auto-Tagging</span>
                   <span className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300">OCR</span>
                   <span className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300">Summarization</span>
                </div>
              </div>

              {/* Visual Element - Reduced Height */}
              <div className="flex-1 w-full relative h-[200px] bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden flex items-center justify-center shadow-inner">
                <div className="absolute inset-0 bg-grid opacity-20" />
                <motion.div 
                  animate={{ scale: [1, 1.05, 1], opacity: [0.8, 1, 0.8] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="w-28 h-36 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-100 dark:border-slate-700 p-3 flex flex-col gap-2.5 relative z-10"
                >
                  <div className="w-3/4 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full" />
                  <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full" />
                  <div className="w-5/6 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full" />
                  <div className="mt-auto w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500 self-end">
                    <CheckCircle2 size={14} />
                  </div>
                </motion.div>
                {/* Scanning Beam */}
                <motion.div 
                  animate={{ top: ["0%", "100%"] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="absolute left-0 right-0 h-1 bg-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.5)] z-20"
                />
              </div>
            </div>
          </motion.div>

          {/* Card 2: Speed (Vertical) */}
          <motion.div 
            whileHover={{ y: -4 }}
            className="col-span-1 md:col-span-3 lg:col-span-4 bg-[#0061ff] rounded-[2rem] p-8 text-white relative overflow-hidden shadow-xl shadow-blue-500/20 group"
          >
            <div className="relative z-10">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center mb-5">
                <Zap size={20} className="text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">Blazing Fast</h3>
              <p className="text-blue-100 mb-6 text-sm">Processed at the edge. <br/>Avg latency under 400ms.</p>
              
              <div className="w-full bg-blue-800/50 rounded-full h-1 mb-2 overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  whileInView={{ width: "95%" }}
                  transition={{ duration: 1.5, ease: "circOut" }}
                  className="bg-white h-full rounded-full"
                />
              </div>
              <div className="flex justify-between text-[10px] font-medium text-blue-200">
                <span>Processing...</span>
                <span>95%</span>
              </div>
            </div>
            
            <Zap size={160} className="absolute -bottom-8 -right-8 text-white opacity-10 group-hover:scale-110 transition-transform duration-500" />
          </motion.div>

          {/* Card 3: Security */}
          <motion.div 
            whileHover={{ y: -4 }}
            className="col-span-1 md:col-span-3 lg:col-span-4 bg-white/80 dark:bg-slate-900/60 backdrop-blur-md rounded-[2rem] border border-slate-200 dark:border-slate-700/60 p-8 relative overflow-hidden group shadow-lg dark:shadow-black/40"
          >
             <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <ShieldCheck size={100} />
             </div>
             
             <div className="w-10 h-10 bg-emerald-500/10 dark:bg-emerald-500/20 rounded-xl flex items-center justify-center mb-5 text-emerald-600 dark:text-emerald-400">
                <Lock size={20} />
             </div>
             <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Vault Security</h3>
             <p className="text-slate-500 dark:text-slate-300 leading-relaxed mb-5 text-sm">
               256-bit AES encryption standard. ISO 27001 certified processing.
             </p>
             
             <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 w-fit">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">End-to-End Encrypted</span>
             </div>
          </motion.div>

          {/* Card 4: Platform */}
          <motion.div 
            whileHover={{ y: -4 }}
            className="col-span-1 md:col-span-3 lg:col-span-4 bg-white dark:bg-slate-900 backdrop-blur-md rounded-[2rem] border border-slate-200 dark:border-slate-700 p-8 relative overflow-hidden shadow-lg dark:shadow-black/40"
          >
             <div className="w-10 h-10 bg-purple-500/10 dark:bg-purple-500/20 rounded-xl flex items-center justify-center mb-5 text-purple-600 dark:text-purple-400">
                <Globe size={20} />
             </div>
             <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Work Anywhere</h3>
             <p className="text-slate-500 dark:text-slate-300 leading-relaxed mb-6 text-sm">
               Seamless experience across desktop, tablet, and mobile devices.
             </p>
             
             <div className="flex justify-between items-center px-2">
                <Laptop size={20} className="text-slate-400" />
                <div className="w-10 h-[1px] bg-slate-200 dark:bg-slate-700" />
                <div className="w-5 h-7 border-2 border-slate-300 dark:border-slate-600 rounded flex items-center justify-center">
                  <div className="w-1 h-1 bg-slate-300 rounded-full" />
                </div>
                <div className="w-10 h-[1px] bg-slate-200 dark:bg-slate-700" />
                <div className="w-3.5 h-6 border-2 border-slate-300 dark:border-slate-600 rounded flex items-center justify-center">
                  <div className="w-0.5 h-0.5 bg-slate-300 rounded-full" />
                </div>
             </div>
          </motion.div>

          {/* Card 5: Documents Processed (Counter) */}
          <motion.div 
            whileHover={{ y: -4 }}
            className="col-span-1 md:col-span-3 lg:col-span-4 bg-slate-900 dark:bg-blue-600 rounded-[2rem] p-8 relative overflow-hidden shadow-lg flex flex-col justify-center items-center text-center group"
          >
            <div className="absolute inset-0 bg-[radial-gradient(#fff_1px,transparent_1px)] dark:bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px] opacity-10" />
            
            <motion.div 
              initial={{ scale: 0.5, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-4xl md:text-5xl font-black text-white mb-2 relative z-10"
            >
              10M+
            </motion.div>
            <p className="text-slate-400 dark:text-blue-200 font-bold tracking-widest uppercase text-xs relative z-10">Files Processed Daily</p>
            
            <FileCheck size={120} className="absolute -bottom-6 -left-6 text-white opacity-5 rotate-12 group-hover:rotate-0 transition-transform duration-500" />
          </motion.div>
        </div>
        
        {/* Bottom CTA */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="inline-flex items-center gap-2 text-[#0061ff] dark:text-blue-400 font-bold hover:underline underline-offset-4 decoration-2 text-sm">
            View all 20+ features <ArrowRight size={14} />
          </button>
        </motion.div>

      </div>
    </section>
  );
};

export default Features;