import React, { useState } from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import type {
  ReportTimelineItem,
  ReportCategoryBreakdown,
  ReportSourceBreakdown,
} from '../types/report.type.ts';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface Props {
  timeline: ReportTimelineItem[];
  categories: ReportCategoryBreakdown[];
  sources: ReportSourceBreakdown[];
}

const CATEGORY_COLORS = [
  '#F43F5E',
  '#FB923C',
  '#FACC15',
  '#4ADE80',
  '#2DD4BF',
  '#38BDF8',
  '#818CF8',
  '#C084FC',
  '#F472B6',
  '#A3A3A3',
];

const SOURCE_COLORS = [
  '#10B981',
  '#06B6D4',
  '#3B82F6',
  '#8B5CF6',
  '#EC4899',
  '#F59E0B',
];

export const ReportCharts: React.FC<Props> = ({ timeline, categories, sources }) => {
  const [doughnutMode, setDoughnutMode] = useState<'expenses' | 'income'>('expenses');

  // ── Timeline Bar Chart Data ──
  const barData = {
    labels: timeline.map((t) => t.label),
    datasets: [
      {
        label: 'Income (₹)',
        data: timeline.map((t) => t.income),
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
        borderColor: '#10B981',
        borderWidth: 1,
        borderRadius: 6,
      },
      {
        label: 'Expenses (₹)',
        data: timeline.map((t) => t.expenses),
        backgroundColor: 'rgba(244, 63, 94, 0.8)',
        borderColor: '#F43F5E',
        borderWidth: 1,
        borderRadius: 6,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#94a3b8',
          usePointStyle: true,
          boxWidth: 8,
          font: { size: 12 },
        },
      },
      tooltip: {
        backgroundColor: '#161c24',
        titleColor: '#fff',
        bodyColor: '#cbd5e1',
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        padding: 10,
        callbacks: {
          label: (context: any) =>
            ` ${context.dataset.label}: ₹${Number(context.raw || 0).toLocaleString('en-IN')}`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(255,255,255,0.05)' },
        ticks: {
          color: '#64748b',
          font: { size: 11 },
          callback: (value: any) => `₹${Number(value).toLocaleString('en-IN')}`,
        },
      },
      x: {
        grid: { display: false },
        ticks: { color: '#64748b', font: { size: 11 } },
      },
    },
  };

  // ── Doughnut Chart Data (Expenses vs Income toggle) ──
  const activeItems = doughnutMode === 'expenses' ? categories : sources;
  const activeColors = doughnutMode === 'expenses' ? CATEGORY_COLORS : SOURCE_COLORS;

  const doughnutData = {
    labels:
      doughnutMode === 'expenses'
        ? categories.map((c) => c.category)
        : sources.map((s) => s.source),
    datasets: [
      {
        data: activeItems.map((item) => item.amount),
        backgroundColor: activeColors.slice(0, activeItems.length),
        borderColor: '#161c24',
        borderWidth: 2,
        hoverOffset: 6,
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: '#94a3b8',
          usePointStyle: true,
          boxWidth: 8,
          font: { size: 11 },
          padding: 14,
        },
      },
      tooltip: {
        backgroundColor: '#161c24',
        titleColor: '#fff',
        bodyColor: '#cbd5e1',
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        padding: 10,
        callbacks: {
          label: (context: any) =>
            ` ${context.label}: ₹${Number(context.raw || 0).toLocaleString('en-IN')}`,
        },
      },
    },
    cutout: '68%',
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
      {/* Timeline Trend Chart (Span 2 cols on desktop) */}
      <div className="lg:col-span-2 bg-[#161c24] border border-white/5 rounded-2xl p-5 shadow-lg flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-gray-200">Income vs Expense Trend</h3>
            <p className="text-xs text-gray-400">Cashflow dynamics over the selected period</p>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-lg bg-white/5 text-gray-400 font-medium">
            {timeline.length} Intervals
          </span>
        </div>
        <div className="h-64 sm:h-72 w-full flex-1">
          {timeline.length > 0 ? (
            <Bar data={barData} options={barOptions} />
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500 text-sm">
              No timeline data available for this range.
            </div>
          )}
        </div>
      </div>

      {/* Doughnut Chart (Expense vs Income toggle) */}
      <div className="bg-[#161c24] border border-white/5 rounded-2xl p-5 shadow-lg flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-gray-200">
              {doughnutMode === 'expenses' ? 'Expense Categories' : 'Income Sources'}
            </h3>
            <p className="text-xs text-gray-400">Distribution breakdown</p>
          </div>
          <div className="flex items-center bg-[#0f141a] rounded-lg p-0.5 border border-white/5">
            <button
              onClick={() => setDoughnutMode('expenses')}
              className={`px-2 py-1 text-[11px] font-semibold rounded-md transition-all cursor-pointer ${
                doughnutMode === 'expenses'
                  ? 'bg-rose-500/20 text-rose-300'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              Expense
            </button>
            <button
              onClick={() => setDoughnutMode('income')}
              className={`px-2 py-1 text-[11px] font-semibold rounded-md transition-all cursor-pointer ${
                doughnutMode === 'income'
                  ? 'bg-emerald-500/20 text-emerald-300'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              Income
            </button>
          </div>
        </div>
        <div className="h-64 sm:h-72 w-full flex-1 relative">
          {activeItems.length > 0 ? (
            <Doughnut data={doughnutData} options={doughnutOptions} />
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500 text-sm">
              No data records found for this view.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
