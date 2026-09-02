import React, { useEffect } from 'react';
import {
  RiFileChartLine,
  RiInformationLine,
  RiShieldUserLine,
} from 'react-icons/ri';
import { setPageTitle } from '../../../utils/setTitle.ts';
import ContentWrapper from '../../../components/ContentWrapper.tsx';
import Loading from '../../Loading.tsx';
import { useReportStore } from '../store/useReportStore.ts';
import { useAuthStore } from '../../auth/store/useAuthStore.ts';
import { ReportFilters } from '../components/ReportFilters.tsx';
import { ReportSummaryCards } from '../components/ReportSummaryCards.tsx';
import { ReportCharts } from '../components/ReportCharts.tsx';
import { ReportBreakdownTables } from '../components/ReportBreakdownTables.tsx';
import { ReportTransactionsTable } from '../components/ReportTransactionsTable.tsx';

const ReportsPage: React.FC = () => {
  setPageTitle('Financial Reports & PDF / Excel Export | BudgetBuddy');

  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.role === 'admin';

  const {
    reportData,
    isLoading,
    fetchReportData,
    exportExcel,
    exportPdf,
    isExportingExcel,
    isExportingPdf,
    error,
  } = useReportStore();

  useEffect(() => {
    fetchReportData();
  }, [fetchReportData]);

  return (
    <ContentWrapper>
      <div className="flex-1 max-width mx-auto w-full space-y-6">
        {/* ── Page Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#161c24] border border-white/5 rounded-2xl p-6 shadow-xl">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 text-2xl shadow-[0_0_12px_rgba(6,182,212,0.2)]">
                <RiFileChartLine />
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Financial Reports & Export
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-gray-400">
              Generate customizable financial audit summaries and download PDF performance reports or Excel spreadsheets.
            </p>
          </div>
          {isAdmin && (
            <div className="inline-flex items-center gap-1.5 bg-purple-500/15 text-purple-300 border border-purple-500/30 px-3.5 py-1.5 rounded-xl text-xs font-bold shadow-[0_0_12px_rgba(168,85,247,0.15)] shrink-0 self-start sm:self-auto">
              <RiShieldUserLine className="text-purple-400 text-sm" />
              <span>ADMIN AUDIT ACCESS</span>
            </div>
          )}
        </div>

        {/* ── Filters Section ── */}
        <ReportFilters />

        {/* ── Main Content / Loading ── */}
        {isLoading && !reportData ? (
          <div className="py-20 flex justify-center">
            <Loading />
          </div>
        ) : error && !reportData ? (
          <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-8 text-center text-rose-300 space-y-2">
            <RiInformationLine className="text-3xl mx-auto" />
            <p className="font-semibold">{error}</p>
            <button
              onClick={() => fetchReportData()}
              className="px-4 py-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 text-xs font-bold rounded-xl transition-all cursor-pointer"
            >
              Retry
            </button>
          </div>
        ) : reportData ? (
          <>
            {/* ── KPI Summary Cards ── */}
            <ReportSummaryCards summary={reportData.summary} />

            {/* ── Visual Interactive Charts ── */}
            <ReportCharts
              timeline={reportData.timeline_breakdown}
              categories={reportData.category_breakdown}
              sources={reportData.source_breakdown}
            />

            {/* ── Category & Account Breakdown Tables ── */}
            <ReportBreakdownTables
              categories={reportData.category_breakdown}
              sources={reportData.source_breakdown}
              accounts={reportData.account_breakdown}
            />

            {/* ── Full Transaction Ledger Table ── */}
            <ReportTransactionsTable
              transactions={reportData.transactions}
              onExportExcel={exportExcel}
              isExportingExcel={isExportingExcel}
              onExportPdf={exportPdf}
              isExportingPdf={isExportingPdf}
            />
          </>
        ) : null}
      </div>
    </ContentWrapper>
  );
};

export default ReportsPage;
