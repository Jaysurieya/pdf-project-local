import React, { useState, useEffect } from 'react';
import { Menu, X, Command, Moon, Sun, ChevronRight, Minimize2, ArrowRightLeft, PenTool, Layers, CreditCard } from 'lucide-react';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';

// Cast motion.div to any to avoid TypeScript errors
const MotionDiv = motion.div as any;
const MotionNav = motion.nav as any;
const MotionButton = motion.button as any;

interface NavbarProps {
  onNavigate: (page: 'home') => void;
}

const Navbar: React.FC<NavbarProps> = ({ onNavigate }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { scrollY } = useScroll();
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const scrolled = latest > 20;
    if (scrolled !== isScrolled) {
      setIsScrolled(scrolled);
    }
  });
  
  const { isDark, toggleTheme } = useTheme();



  const handleNavigation = (target: string) => {
    setIsMobileMenuOpen(false);
    
    if (target === 'top') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const el = document.getElementById(target);
    if (el) {
      const offset = 120;
      const elementPosition = el.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: elementPosition - offset, behavior: 'smooth' });
    }
  };

  const navLinks = [
    { name: 'Merge & Split', id: 'tools', icon: Layers },
    { name: 'Compress', id: 'tools', icon: Minimize2 },
    { name: 'Convert', id: 'tools', icon: ArrowRightLeft },
    { name: 'Edit', id: 'tools', icon: PenTool },
    { name: 'Pricing', id: 'features', icon: CreditCard },
  ];

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 flex justify-center pointer-events-none pt-4">
        <MotionNav
          initial={false}
          animate={isScrolled ? "scrolled" : "top"}
          variants={{
            top: { 
              width: "100%", 
              maxWidth: "100%", 
              y: 0,
              padding: "0.5rem 2rem",
              backgroundColor: "rgba(0,0,0,0)",
              backdropFilter: "blur(0px)",
              boxShadow: "none",
            },
            scrolled: { 
              width: "90%", 
              maxWidth: "1000px", 
              y: 0,
              padding: "0.5rem 1rem",
              backgroundColor: isDark ? "rgba(15, 23, 42, 0.85)" : "rgba(255, 255, 255, 0.85)", // slight transparency
              backdropFilter: "blur(16px)",
              borderRadius: "9999px",
              // Blue tinted shadow/border for "Gradient Blue" theme
              border: isDark ? "1px solid rgba(31, 41, 55, 0.3)" : "1px solid rgba(230, 236, 245, 0.8)", 
              boxShadow: isDark ? "0 25px 50px -12px rgba(0, 0, 0, 0.5)" : "0 20px 40px -10px rgba(59, 130, 246, 0.15)",
            }
          }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="pointer-events-auto flex items-center justify-between z-50 h-16"
        >
          {/* Logo */}
          <button 
            onClick={() => handleNavigation('top')}
            className="flex items-center gap-3 group focus:outline-none pl-2"
          >
            <div className="relative w-8 h-8 flex items-center justify-center">
              <div className="bg-gradient-to-tr from-[#0061ff] to-cyan-400 w-full h-full rounded-lg flex items-center justify-center text-white shadow-lg shadow-blue-500/30 group-hover:rotate-6 transition-transform duration-300">
                <Command size={18} strokeWidth={2.5} />
              </div>
            </div>
            <span className={`font-bold tracking-tight text-slate-900 dark:text-white transition-all text-lg`}>
              Doc<span className="text-[#0061ff] dark:text-blue-400">Flow</span>
            </span>
          </button>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((item) => (
              <button
                key={item.name}
                onClick={() => handleNavigation(item.id)}
                onMouseEnter={() => setHoveredLink(item.name)}
                onMouseLeave={() => setHoveredLink(null)}
                className={`relative px-4 py-2 text-sm font-semibold transition-colors ${hoveredLink === item.name ? 'text-[#0061ff] dark:text-blue-300' : 'text-slate-500 dark:text-slate-400'}`}
              >
                {hoveredLink === item.name && (
                  <MotionDiv
                    layoutId="navHover"
                    className="absolute inset-0 bg-blue-50 dark:bg-blue-900/20 rounded-full z-0"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10">{item.name}</span>
              </button>
            ))}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2 pr-1">
             {/* Theme Toggle */}
            <button 
              onClick={toggleTheme}
              className="p-2 text-slate-500 hover:text-[#0061ff] dark:text-slate-400 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-all"
              aria-label="Toggle Theme"
            >
              <AnimatePresence mode="wait">
                {isDark ? (
                  <MotionDiv key="sun" initial={{ rotate: -90, scale: 0 }} animate={{ rotate: 0, scale: 1 }} exit={{ rotate: 90, scale: 0 }}>
                    <Sun size={18} />
                  </MotionDiv>
                ) : (
                  <MotionDiv key="moon" initial={{ rotate: 90, scale: 0 }} animate={{ rotate: 0, scale: 1 }} exit={{ rotate: -90, scale: 0 }}>
                    <Moon size={18} />
                  </MotionDiv>
                )}
              </AnimatePresence>
            </button>

            <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 mx-1 hidden md:block" />

            <div className="hidden md:flex items-center gap-2">
              <MotionButton
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleNavigation('tools')}
                className="px-5 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-sm font-bold rounded-full shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-shadow"
              >
                Get Started
              </MotionButton>
            </div>

            {/* Mobile Menu Toggle */}
            <button 
              className="lg:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <AnimatePresence mode="wait">
                {isMobileMenuOpen ? (
                  <MotionDiv key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }}>
                    <X size={20} />
                  </MotionDiv>
                ) : (
                  <MotionDiv key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }}>
                    <Menu size={20} />
                  </MotionDiv>
                )}
              </AnimatePresence>
            </button>
          </div>
        </MotionNav>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <MotionDiv 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[40] lg:hidden"
          >
            {/* Backdrop */}
            <div 
              className="absolute inset-0 bg-white/95 dark:bg-[#0F172A]/95 backdrop-blur-xl"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            
            {/* Content */}
            <MotionDiv 
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ delay: 0.1 }}
              className="relative z-10 flex flex-col pt-32 px-6 h-full overflow-y-auto"
            >
              <div className="grid gap-2">
                {navLinks.map((item, idx) => (
                  <MotionButton
                    key={item.name}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: idx * 0.05 + 0.1 }}
                    onClick={() => handleNavigation(item.id)} 
                    className="flex items-center gap-4 p-4 rounded-2xl text-left hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors group"
                  >
                    <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-[#0061ff] flex items-center justify-center group-hover:scale-110 transition-transform">
                      <item.icon size={24} />
                    </div>
                    <div>
                      <span className="block text-lg font-bold text-slate-900 dark:text-white">{item.name}</span>
                      <span className="text-sm text-slate-500 dark:text-slate-400">Access {item.name.toLowerCase()} tools</span>
                    </div>
                    <ChevronRight size={20} className="ml-auto text-slate-300 group-hover:text-[#0061ff] transition-colors" />
                  </MotionButton>
                ))}
              </div>

              <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-800">
                <button 
                  onClick={() => handleNavigation('tools')}
                  className="w-full py-4 rounded-xl font-bold text-white bg-gradient-to-r from-blue-600 to-cyan-500 hover:shadow-lg hover:shadow-blue-500/25 transition-all"
                >
                  Explore Tools
                </button>
                
                <button 
                  onClick={toggleTheme}
                  className="mt-6 flex items-center justify-center gap-3 w-full py-4 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-xl transition-colors font-medium"
                >
                   {isDark ? <Sun size={20} /> : <Moon size={20} />}
                   Switch to {isDark ? 'Light' : 'Dark'} Mode
                </button>
              </div>
            </MotionDiv>
          </MotionDiv>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;