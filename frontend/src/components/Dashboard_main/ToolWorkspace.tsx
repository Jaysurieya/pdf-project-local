import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, ArrowLeft, X, CheckCircle2, AlertCircle, FileText, Plus, Trash2 } from 'lucide-react';
import { PDFTool } from './types';

interface ToolWorkspaceProps {
  tool: PDFTool;
  onBack: () => void;
}

const ToolWorkspace: React.FC<ToolWorkspaceProps> = ({ tool, onBack }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = (newFiles: File[]) => {
    const validFiles = newFiles.filter(file => {
        // Define accepted file types based on tool ID
        const acceptedTypes: Record<string, string[]> = {
          'merge-pdf': ['.pdf'],
          'split-pdf': ['.pdf'],
          'compress-pdf': ['.pdf'],
          'pdf-to-word': ['.pdf'],
          'powerpoint-to-pdf': ['.ppt', '.pptx'],
          'pdf-to-excel': ['.pdf'],
          'word-to-pdf': ['.doc', '.docx'],
          'pdf-to-jpg': ['.pdf'],
          'edit-pdf': ['.pdf'],
          'sign-pdf': ['.pdf'],
          'protect-pdf': ['.pdf'],
          'unlock-pdf': ['.pdf'],
          'jpg-to-pdf': ['.jpg', '.jpeg', '.png', '.gif', '.bmp'],
          'excel-to-pdf': ['.xls', '.xlsx', '.csv'],
          'html-to-pdf': ['.html', '.htm'],
          'rotate-pdf': ['.pdf'],
          'crop-pdf': ['.pdf'],
          'add-watermark': ['.pdf'],
          'redact-pdf': ['.pdf'],
          'scan-to-pdf': ['.jpg', '.jpeg', '.png'],
          'organize-pdf': ['.pdf'],
          'remove-pages': ['.pdf'],
          'ocr-pdf': ['.pdf'],
        };
        
        const acceptedExts = acceptedTypes[tool.id] || ['.pdf']; // Default to PDF
        const fileExt = '.' + file.name.toLowerCase().split('.').pop();
        const isAccepted = acceptedExts.includes(fileExt);
        
        return isAccepted;
    });

    if (validFiles.length === 0 && newFiles.length > 0) {
        alert("Please upload valid files for this tool.");
        return;
    }

    setFiles(prev => [...prev, ...validFiles]);
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Extract color class for border/text from the tailwind classes string
  const getThemeColor = () => {
    if (tool.color.includes('rose')) return 'rose';
    if (tool.color.includes('emerald')) return 'emerald';
    if (tool.color.includes('orange')) return 'orange';
    if (tool.color.includes('green')) return 'green';
    if (tool.color.includes('amber')) return 'amber';
    if (tool.color.includes('indigo')) return 'indigo';
    if (tool.color.includes('purple')) return 'purple';
    if (tool.color.includes('pink')) return 'pink';
    return 'blue'; // default
  };

  const theme = getThemeColor();
  
  // Dynamic classes based on tool theme
  const borderClass = isDragging 
    ? `border-${theme}-500 bg-${theme}-50 dark:bg-${theme}-900/10` 
    : `border-${theme}-400/50 dark:border-${theme}-500/30 hover:bg-${theme}-50/30 dark:hover:bg-${theme}-900/5`;
  
  // Refined button and text classes
  const btnClass = `bg-${theme}-600 hover:bg-${theme}-700 text-white shadow-lg shadow-${theme}-500/20`;
  const textClass = `text-${theme}-600 dark:text-${theme}-400`;
  const iconClass = `text-${theme}-500 dark:text-${theme}-400`;

  return (
    <section className="min-h-screen bg-white dark:bg-[#0B1220] pt-24 pb-12 px-4 relative z-10">
      <div className="container mx-auto max-w-6xl">
        
        {/* Back Navigation */}
        <motion.button 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={onBack}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors mb-8 font-medium group"
        >
          <div className="p-2 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 group-hover:border-slate-300 transition-all">
             <ArrowLeft size={16} />
          </div>
          <span>Back to Tools</span>
        </motion.button>

        <div className="flex flex-col lg:flex-row gap-12 items-start">
          
          {/* Main Workspace Area */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1 w-full"
          >
            <div className="mb-8">
               <div className={`w-16 h-16 rounded-2xl mb-6 flex items-center justify-center ${(tool.glow || 'bg-blue-500').replace('bg-', 'bg-').replace('500', '100')} dark:bg-opacity-10`}>
                 <tool.icon size={32} className={textClass} />
               </div>
               <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">
                 {tool.title}
               </h1>
               <p className="text-lg text-slate-500 dark:text-slate-400 leading-relaxed max-w-2xl">
                 {tool.description}
               </p>
            </div>

            {/* The Drop Zone Area */}
            <div className="relative">
              {files.length === 0 ? (
                <div 
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`relative w-full h-[320px] md:h-[380px] rounded-[2rem] border-[3px] border-dashed transition-all duration-300 flex flex-col items-center justify-center gap-4 group overflow-hidden bg-slate-50/50 dark:bg-slate-900/20 backdrop-blur-sm ${borderClass}`}
                >
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    className="hidden" 
                    onChange={handleFileSelect}
                    multiple
                  />
                  
                  {/* Subtle background glow */}
                  <div className={`absolute inset-0 bg-gradient-to-br from-${theme}-500/5 via-transparent to-${theme}-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none`} />

                  <motion.div 
                    animate={{ scale: isDragging ? 1.1 : 1, y: isDragging ? -5 : 0 }}
                    className={`relative z-10 p-4 rounded-full bg-${theme}-50 dark:bg-${theme}-900/30 mb-2`}
                  >
                    <Upload size={48} strokeWidth={1.5} className={iconClass} />
                  </motion.div>

                  <div className="text-center relative z-10 space-y-1">
                    <h3 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">
                      Drag files here
                    </h3>
                  </div>

                  <div className="flex items-center gap-4 w-full max-w-[200px] relative z-10 my-2">
                    <div className="h-px bg-slate-200 dark:bg-slate-700 flex-1" />
                    <span className="text-slate-400 dark:text-slate-400 font-medium text-sm">or</span>
                    <div className="h-px bg-slate-200 dark:bg-slate-700 flex-1" />
                  </div>

                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className={`px-10 py-3.5 rounded-xl font-bold text-base md:text-lg transition-all relative z-10 transform hover:scale-105 active:scale-95 ${btnClass}`}
                  >
                    Select Files
                  </button>
                </div>
              ) : (
                // Files Selected State - List/Grid View
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="w-full rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-xl p-6 md:p-8 relative overflow-hidden"
                >
                   <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                         Files Selected <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-lg text-sm">{files.length}</span>
                      </h3>
                      <button 
                         onClick={() => setFiles([])}
                         className="text-sm font-medium text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 px-3 py-1.5 rounded-lg transition-colors"
                      >
                         Clear All
                      </button>
                   </div>
                   
                   <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                      <AnimatePresence mode="popLayout">
                        {files.map((file, index) => (
                           <motion.div
                              key={`${file.name}-${index}`}
                              layout
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.8 }}
                              className="group relative bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-4 flex flex-col gap-3 hover:border-blue-400 dark:hover:border-blue-500 transition-colors"
                           >
                              <div className="flex items-start justify-between">
                                 <div className={`w-10 h-10 rounded-lg bg-${theme}-100 dark:bg-${theme}-900/30 flex items-center justify-center text-${theme}-600 dark:text-${theme}-400`}>
                                    <FileText size={20} />
                                 </div>
                                 <button 
                                    onClick={() => removeFile(index)}
                                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                 >
                                    <Trash2 size={16} />
                                 </button>
                              </div>
                              
                              <div>
                                 <p className="font-semibold text-slate-700 dark:text-slate-200 text-sm truncate mb-0.5" title={file.name}>
                                    {file.name}
                                 </p>
                                 <p className="text-xs text-slate-500 dark:text-slate-400">
                                    {(file.size / 1024 / 1024).toFixed(2)} MB
                                 </p>
                              </div>
                           </motion.div>
                        ))}
                        
                        {/* Add More Button Card */}
                        <motion.button
                           layout
                           onClick={() => fileInputRef.current?.click()}
                           className="flex flex-col items-center justify-center gap-2 h-[132px] rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all text-slate-400 dark:text-slate-400 hover:text-blue-500 dark:hover:text-blue-400 group"
                        >
                           <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 flex items-center justify-center transition-colors">
                              <Plus size={20} />
                           </div>
                           <span className="text-sm font-bold">Add More</span>
                        </motion.button>
                      </AnimatePresence>
                   </div>
                   
                   {/* Hidden input for adding more */}
                   <input 
                     type="file" 
                     ref={fileInputRef}
                     className="hidden" 
                     onChange={handleFileSelect}
                     multiple
                   />

                   <div className="flex justify-center">
                     <button className={`px-12 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2 ${btnClass}`}>
                       Process {files.length} {files.length === 1 ? 'File' : 'Files'} <CheckCircle2 size={20} />
                     </button>
                   </div>
                </motion.div>
              )}
            </div>

            {/* Bottom Info */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-between text-sm text-slate-500 dark:text-slate-400 gap-4">
               <div className="flex items-center gap-2">
                  <AlertCircle size={16} />
                  <span>Files are automatically deleted after 2 hours.</span>
               </div>
               <button className={`font-bold hover:underline ${textClass}`}>
                  Give Feedback on This Tool
               </button>
            </div>
          </motion.div>

          {/* Sidebar Info (Desktop) */}
          <motion.div 
             initial={{ opacity: 0, x: 20 }}
             animate={{ opacity: 1, x: 0 }}
             transition={{ delay: 0.2 }}
             className="hidden lg:block w-80 shrink-0 space-y-6"
          >
             <div className="p-6 rounded-2xl bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 backdrop-blur-sm">
                <h4 className="font-bold text-slate-900 dark:text-white mb-4">How to use</h4>
                <ul className="space-y-4">
                   {[
                      "Drag and drop your files into the box.",
                      "Rearrange files if needed (Merge).",
                      "Choose your conversion settings.",
                      "Download your processed documents."
                   ].map((step, i) => (
                      <li key={i} className="flex gap-3 text-sm text-slate-600 dark:text-slate-300">
                         <span className={`flex-shrink-0 w-5 h-5 rounded-full bg-${theme}-100 dark:bg-${theme}-900/50 text-${theme}-600 dark:text-${theme}-400 flex items-center justify-center font-bold text-xs`}>
                           {i + 1}
                         </span>
                         {step}
                      </li>
                   ))}
                </ul>
             </div>

             <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-lg">
                <h4 className="font-bold mb-2">Need Pro Features?</h4>
                <p className="text-sm text-slate-300 mb-4">Get unlimited conversions and larger file sizes.</p>
                <button className="w-full py-2.5 bg-white text-slate-900 rounded-lg font-bold text-sm hover:bg-slate-50 transition-colors">
                   Upgrade Plan
                </button>
             </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ToolWorkspace;