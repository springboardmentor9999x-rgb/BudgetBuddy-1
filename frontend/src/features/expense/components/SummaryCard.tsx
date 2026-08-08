
import { FaWallet, FaChartLine, FaCalendarAlt } from "react-icons/fa";
import { MdTrendingUp, MdTrendingDown } from "react-icons/md";


const SummaryCard = () => {
  return (
    <div className="bg-[#1e252e] rounded-xl shadow-lg p-4 sm:p-5 border border-white/5 hover:border-red-500/30 transition-all duration-300 group">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-400 text-xs sm:text-sm font-medium uppercase tracking-wider">Total Expenses</p>
          <p className="text-xl sm:text-2xl font-bold text-white mt-1 sm:mt-2">Rs 50,000</p>
          <p className="text-green-400 text-xs mt-1 flex items-center gap-1">
            <MdTrendingUp className="inline" /> 12% from last month
          </p>
        </div>
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-red-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
          <FaWallet className="text-red-400 text-lg sm:text-xl" />
        </div>
      </div>
    </div>
  )
}

export default SummaryCard