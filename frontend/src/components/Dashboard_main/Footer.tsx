import React from 'react';
import { Command, Twitter, Github, Linkedin, Facebook, Globe, Heart } from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    "Solutions": ["Merge PDF", "Split PDF", "Compress PDF", "Office to PDF", "PDF to JPG"],
    "Company": ["About Us", "Story", "Careers", "Security", "Contact"],
    "Community": ["API Documentation", "Knowledge Base", "Forum", "Blog", "Developers"],
    "Legal": ["Terms of Service", "Privacy Policy", "Cookie Policy", "GDPR"]
  };

  return (
    // Changed bg to transparent in both modes
    <footer className="bg-white/[0.01] dark:bg-[#0F172A] border-t border-slate-200 dark:border-slate-700 pt-20 pb-10 transition-colors backdrop-blur-sm">
      <div className="container mx-auto px-4 md:px-8">
        
        {/* Top Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-10 mb-16">
          
          {/* Brand Column */}
          <div className="col-span-2 lg:col-span-2 pr-0 lg:pr-10">
            <div className="flex items-center gap-2.5 mb-6">
              <div className="bg-[#0061ff] p-2 rounded-xl text-white shadow-lg shadow-blue-500/30">
                <Command size={22} strokeWidth={2.5} />
              </div>
              <span className="font-extrabold tracking-tight text-slate-900 dark:text-white text-xl">
                Doc<span className="text-[#0061ff]">Flow</span>
              </span>
            </div>
            <p className="text-slate-500 dark:text-slate-300 font-medium leading-relaxed mb-6">
              Making document workflows easy, fast, and smart. Trusted by millions of users worldwide to manage their files efficiently.
            </p>
            <div className="flex items-center gap-4">
               <SocialLink href="#" icon={Twitter} />
               <SocialLink href="#" icon={Github} />
               <SocialLink href="#" icon={Linkedin} />
               <SocialLink href="#" icon={Facebook} />
            </div>
          </div>

          {/* Links Columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category} className="col-span-1">
              <h4 className="font-bold text-slate-900 dark:text-white mb-6 text-sm uppercase tracking-widest">{category}</h4>
              <ul className="space-y-4">
                {links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-slate-500 dark:text-slate-300 hover:text-[#0061ff] dark:hover:text-blue-400 font-medium text-sm transition-colors block">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-200 dark:border-slate-700 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-slate-500 dark:text-slate-400 text-sm font-medium flex items-center gap-1">
            © {currentYear} DocFlow. Made with <Heart size={14} className="text-red-500 fill-red-500" /> in San Francisco.
          </div>
          
          <div className="flex items-center gap-6">
             <button className="flex items-center gap-2 text-slate-600 dark:text-slate-300 font-bold text-sm hover:text-[#0061ff] transition-colors">
               <Globe size={16} />
               English
             </button>
          </div>
        </div>

      </div>
    </footer>
  );
};

const SocialLink: React.FC<{ href: string; icon: any }> = ({ href, icon: Icon }) => (
  <a 
    href={href} 
    className="w-10 h-10 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-white dark:hover:text-white hover:bg-[#0061ff] hover:border-[#0061ff] transition-all duration-300 shadow-sm"
  >
    <Icon size={18} />
  </a>
);

export default Footer;