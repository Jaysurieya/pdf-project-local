
import { 
  Combine, Scissors, FileArchive, FileText, FileSignature, 
  Image as ImageIcon, Type, Lock, Zap, ShieldCheck, Globe,
  RotateCw, Unlock, FileJson
} from 'lucide-react';
import { PDFTool, Feature } from './types';

export const PRIMARY_BLUE = '#0061ff';

// Industry standard color coding
export const TOOLS: PDFTool[] = [
  { 
    id: 'merge-pdf', 
    title: 'Merge PDF', 
    description: 'Combine PDFs in the order you want with the easiest PDF merger available.', 
    icon: Combine, 
    category: 'organize', 
    color: 'text-rose-600 dark:text-rose-400 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 group-hover:border-slate-200 dark:group-hover:border-slate-700',
    glow: 'bg-rose-500',
    keywords: ['combine', 'join', 'binder', 'append']
  },
  { 
    id: 'organize-pdf', 
    title: 'Organize PDF', 
    description: 'Organize and reorder pages in your PDF document.', 
    icon: Scissors, 
    category: 'organize', 
    color: 'text-rose-600 dark:text-rose-400 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 group-hover:border-slate-200 dark:group-hover:border-slate-700',
    glow: 'bg-rose-500',
    keywords: ['organize', 'reorder', 'arrange', 'manage']
  },
  { 
    id: 'remove-pages', 
    title: 'Remove Pages', 
    description: 'Remove unwanted pages from your PDF document.', 
    icon: Scissors, 
    category: 'organize', 
    color: 'text-rose-600 dark:text-rose-400 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 group-hover:border-slate-200 dark:group-hover:border-slate-700',
    glow: 'bg-rose-500',
    keywords: ['remove', 'delete', 'pages', 'trim']
  },
  { 
    id: 'split-pdf', 
    title: 'Split PDF', 
    description: 'Separate one page or a whole set for easy conversion into independent PDF files.', 
    icon: Scissors, 
    category: 'edit', 
    color: 'text-rose-600 dark:text-rose-400 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 group-hover:border-slate-200 dark:group-hover:border-slate-700',
    glow: 'bg-rose-500',
    keywords: ['separate', 'extract', 'pages', 'cut']
  },
  { 
    id: 'scan-to-pdf', 
    title: 'Scan to PDF', 
    description: 'Scan paper documents to create searchable PDF files.', 
    icon: ImageIcon, 
    category: 'organize', 
    color: 'text-rose-600 dark:text-rose-400 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 group-hover:border-slate-200 dark:group-hover:border-slate-700',
    glow: 'bg-rose-500',
    keywords: ['scan', 'document', 'capture', 'paper', 'convert']
  },
  { 
    id: 'compress-pdf', 
    title: 'Compress PDF', 
    description: 'Reduce file size while optimizing for maximal PDF quality.', 
    icon: FileArchive, 
    category: 'optimize', 
    color: 'text-emerald-600 dark:text-emerald-400 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 group-hover:border-slate-200 dark:group-hover:border-slate-700',
    glow: 'bg-emerald-500',
    keywords: ['reduce', 'shrink', 'optimize', 'size', 'minify']
  },
  { 
    id: 'repair-pdf', 
    title: 'Repair PDF', 
    description: 'Repair corrupted or damaged PDF files.', 
    icon: FileArchive, 
    category: 'optimize', 
    color: 'text-emerald-600 dark:text-emerald-400 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 group-hover:border-slate-200 dark:group-hover:border-slate-700',
    glow: 'bg-emerald-500',
    keywords: ['repair', 'fix', 'recover', 'corrupted']
  },
  { 
    id: 'ocr-pdf', 
    title: 'OCR PDF', 
    description: 'Apply OCR technology to make scanned PDFs searchable and editable.', 
    icon: FileText, 
    category: 'optimize', 
    color: 'text-emerald-600 dark:text-emerald-400 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 group-hover:border-slate-200 dark:group-hover:border-slate-700',
    glow: 'bg-emerald-500',
    keywords: ['ocr', 'text recognition', 'scan', 'searchable']
  },
  { 
    id: 'pdf-to-word', 
    title: 'PDF to Word', 
    description: 'Convert your PDF to WORD documents with incredible accuracy.', 
    icon: FileText, 
    category: 'convert', 
    color: 'text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 group-hover:border-slate-200 dark:group-hover:border-slate-700',
    glow: 'bg-blue-500',
    keywords: ['doc', 'docx', 'document', 'edit']
  },
  { 
    id: 'powerpoint-to-pdf', 
    title: 'PowerPoint to PDF', 
    description: 'Turn your PowerPoint presentations into searchable PDF documents.', 
    icon: FileText, 
    category: 'convert', 
    color: 'text-orange-600 dark:text-orange-400 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 group-hover:border-slate-200 dark:group-hover:border-slate-700',
    glow: 'bg-orange-500',
    keywords: ['ppt', 'pptx', 'presentation', 'slides', 'convert']
  },
  { 
    id: 'pdf-to-excel', 
    title: 'PDF to Excel', 
    description: 'Pull data straight from PDFs into Excel spreadsheets in a few short seconds.', 
    icon: FileJson, 
    category: 'convert', 
    color: 'text-green-600 dark:text-green-400 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 group-hover:border-slate-200 dark:group-hover:border-slate-700',
    glow: 'bg-green-500',
    keywords: ['xls', 'xlsx', 'spreadsheet', 'csv', 'table', 'data']
  },
  { 
    id: 'pdf-to-pdfa', 
    title: 'PDF to PDF/A', 
    description: 'Convert your PDF to PDF/A format for long-term archiving and compliance.', 
    icon: FileArchive, 
    category: 'convert', 
    color: 'text-amber-600 dark:text-amber-400 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 group-hover:border-slate-200 dark:group-hover:border-slate-700',
    glow: 'bg-amber-500',
    keywords: ['archive', 'compliance', 'long-term', 'standard', 'pdfa']
  },
  { 
    id: 'word-to-pdf', 
    title: 'Word to PDF', 
    description: 'Make DOC and DOCX files into easy to read PDF documents.', 
    icon: FileText, 
    category: 'convert', 
    color: 'text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 group-hover:border-slate-200 dark:group-hover:border-slate-700',
    glow: 'bg-blue-500',
    keywords: ['doc', 'docx', 'create pdf']
  },
  { 
    id: 'pdf-to-jpg', 
    title: 'PDF to JPG', 
    description: 'Extract all images within a PDF or convert each page to JPG.', 
    icon: ImageIcon, 
    category: 'convert', 
    color: 'text-amber-500 dark:text-amber-400 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 group-hover:border-slate-200 dark:group-hover:border-slate-700',
    glow: 'bg-amber-500',
    keywords: ['image', 'jpg', 'jpeg', 'picture', 'photo', 'png', 'extract images']
  },
  { 
    id: 'edit-pdf', 
    title: 'Edit PDF', 
    description: 'Add text, images, shapes or freehand annotations to your PDF document.', 
    icon: Type, 
    category: 'edit', 
    color: 'text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 group-hover:border-slate-200 dark:group-hover:border-slate-700',
    glow: 'bg-indigo-500',
    keywords: ['annotate', 'drawing', 'write', 'modify']
  },
  { 
    id: 'sign-pdf', 
    title: 'Sign PDF', 
    description: 'Sign a document and request signatures from others.', 
    icon: FileSignature, 
    category: 'security', 
    color: 'text-purple-600 dark:text-purple-400 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 group-hover:border-slate-200 dark:group-hover:border-slate-700',
    glow: 'bg-purple-500',
    keywords: ['signature', 'esign', 'contract']
  },
  { 
    id: 'protect-pdf', 
    title: 'Protect PDF', 
    description: 'Encrypt PDF documents with a password for secure access.', 
    icon: Lock, 
    category: 'security', 
    color: 'text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 group-hover:border-slate-200 dark:group-hover:border-slate-700',
    glow: 'bg-slate-500',
    keywords: ['password', 'encrypt', 'lock', 'secure']
  },
  { 
    id: 'unlock-pdf', 
    title: 'Unlock PDF', 
    description: 'Remove password security from PDF, so you can use it freely.', 
    icon: Unlock, 
    category: 'security', 
    color: 'text-pink-600 dark:text-pink-400 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 group-hover:border-slate-200 dark:group-hover:border-slate-700',
    glow: 'bg-pink-500',
    keywords: ['decrypt', 'remove password', 'open']
  },
  { 
    id: 'jpg-to-pdf', 
    title: 'JPG to PDF', 
    description: 'Convert your image files to PDF with high-quality preservation.', 
    icon: ImageIcon, 
    category: 'convert', 
    color: 'text-amber-500 dark:text-amber-400 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 group-hover:border-slate-200 dark:group-hover:border-slate-700',
    glow: 'bg-amber-500',
    keywords: ['image', 'jpg', 'jpeg', 'png', 'convert']
  },
  { 
    id: 'excel-to-pdf', 
    title: 'Excel to PDF', 
    description: 'Convert your Excel spreadsheets to PDF while preserving formatting.', 
    icon: FileJson, 
    category: 'convert', 
    color: 'text-green-600 dark:text-green-400 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 group-hover:border-slate-200 dark:group-hover:border-slate-700',
    glow: 'bg-green-500',
    keywords: ['xls', 'xlsx', 'spreadsheet', 'excel', 'convert']
  },
  { 
    id: 'html-to-pdf', 
    title: 'HTML to PDF', 
    description: 'Convert HTML web pages or files to PDF documents.', 
    icon: FileText, 
    category: 'convert', 
    color: 'text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 group-hover:border-slate-200 dark:group-hover:border-slate-700',
    glow: 'bg-blue-500',
    keywords: ['webpage', 'html', 'convert', 'format']
  },
  { 
    id: 'rotate-pdf', 
    title: 'Rotate PDF', 
    description: 'Rotate PDF pages in 90-degree increments.', 
    icon: RotateCw, 
    category: 'edit', 
    color: 'text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 group-hover:border-slate-200 dark:group-hover:border-slate-700',
    glow: 'bg-indigo-500',
    keywords: ['rotate', 'turn', 'orientation', 'angle']
  },
  { 
    id: 'crop-pdf', 
    title: 'Crop PDF', 
    description: 'Crop PDF pages to remove unwanted margins or content.', 
    icon: ImageIcon, 
    category: 'edit', 
    color: 'text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 group-hover:border-slate-200 dark:group-hover:border-slate-700',
    glow: 'bg-indigo-500',
    keywords: ['crop', 'trim', 'resize', 'adjust']
  },
  { 
    id: 'add-watermark', 
    title: 'Add Watermark', 
    description: 'Add watermarks to your PDF documents for protection.', 
    icon: FileText, 
    category: 'edit', 
    color: 'text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 group-hover:border-slate-200 dark:group-hover:border-slate-700',
    glow: 'bg-indigo-500',
    keywords: ['watermark', 'protect', 'mark', 'brand']
  },
  { 
    id: 'redact-pdf', 
    title: 'Redact PDF', 
    description: 'Redact sensitive information from your PDF documents.', 
    icon: FileText, 
    category: 'security', 
    color: 'text-purple-600 dark:text-purple-400 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 group-hover:border-slate-200 dark:group-hover:border-slate-700',
    glow: 'bg-purple-500',
    keywords: ['redact', 'hide', 'blackout', 'privacy']
  },
];

export const FEATURES: Feature[] = [
  { title: "Fast & Easy to Use", description: "Our intuitive interface makes PDF editing accessible for everyone. Process your documents in seconds.", icon: Zap },
  { title: "Secure Processing", description: "Your files are encrypted using 256-bit SSL and deleted automatically within 2 hours.", icon: ShieldCheck },
  { title: "Works on Any Device", description: "Access our full suite of PDF tools from your desktop, tablet, or smartphone.", icon: Globe }
];