import React from 'react';
import { Download, FileSpreadsheet } from 'lucide-react';

interface PageHeaderProps {
  title: React.ReactNode;
  subtitle?: string;
  onExportExcel?: () => void;
  primaryAction?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  onExportExcel,
  primaryAction,
}) => {
  const handleExportPDF = () => {
    window.print();
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div>
        <h2 className="font-display font-bold text-2xl sm:text-3xl text-white flex items-center gap-2">
          {title}
        </h2>
        {subtitle && (
          <p className="text-slate-400 text-sm mt-1">{subtitle}</p>
        )}
      </div>
      
      <div className="flex items-center gap-2 sm:gap-3 self-start sm:self-auto">
        <button
          onClick={handleExportPDF}
          className="print-hidden flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900/50 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white transition-all cursor-pointer"
        >
          <Download className="w-4 h-4 text-indigo-400" />
          <span>PDF</span>
        </button>
        {onExportExcel && (
          <button
            onClick={onExportExcel}
            className="print-hidden flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900/50 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-emerald-400 transition-all cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Excel</span>
          </button>
        )}
        {primaryAction && <div className="ml-1 print-hidden">{primaryAction}</div>}
      </div>
    </div>
  );
};
