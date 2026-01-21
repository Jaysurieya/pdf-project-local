import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import Hero from './Hero';
import Tools from './Tools';
import Features from './Features';
import Footer from './Footer';
import AIAssistant from './AIAssistant';
import { Sparkles, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PDFTool } from './types';

const DashboardMain = () => {
  const navigate = useNavigate();

  const handleToolSelect = (tool: PDFTool) => {
    // Navigate to the upload page for the selected tool
    navigate(`/tool/${tool.id}`);
  };

  const handleNavigate = (page: 'home') => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };



  return (
    // Removed 'bg-white' and 'dark:bg-slate-950' to allow the body's 'aurora-bg' to control global theme
    <div className="min-h-screen bg-white dark:bg-[#0B1220] transition-colors duration-300 relative z-0">
      <Navbar onNavigate={handleNavigate} />
      
      <main>
        <Hero />
        <Tools onToolSelect={handleToolSelect} />
        <Features />
        <Footer />
        <AIAssistant />
      </main>
    </div>
  );
};

export default DashboardMain;