import { LucideIcon } from 'lucide-react';

export interface PDFTool {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  category: 'edit' | 'convert' | 'optimize' | 'security' | 'organize';
  color: string;
  glow?: string;
  keywords?: string[];
}

export interface Feature {
  title: string;
  description: string;
  icon: LucideIcon;
}
