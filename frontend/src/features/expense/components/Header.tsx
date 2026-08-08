import { FaPlus } from "react-icons/fa"
import { HiMiniCurrencyRupee } from "react-icons/hi2"

const Header = ({ openCreateForm }: { openCreateForm: () => void }) => {
  return (
    <div className="md:mt-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 mb-6 sm:mb-8">
      <div className="flex items-center gap-3">
        <div className="p-2 sm:p-3 bg-gradient-to-br from-red-500/20 to-red-600/10 rounded-xl sm:rounded-2xl shadow-lg border border-red-500/20">
          <HiMiniCurrencyRupee className="text-2xl sm:text-3xl text-red-400" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Expenses
          </h1>
          <p className="text-gray-400 text-xs sm:text-sm hidden sm:block">
            Track and manage your spending
          </p>
        </div>
      </div>

      <button
        onClick={openCreateForm}
        className="group relative bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl shadow-lg transition-all duration-300 flex items-center gap-2 overflow-hidden w-full sm:w-auto justify-center"
      >
        {/* Glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <FaPlus className="text-sm sm:text-base group-hover:rotate-90 transition-transform duration-300" />
        <span className="font-medium text-sm sm:text-base">Add Expense</span>

        {/* Ripple effect on hover */}
        <span className="absolute inset-0 rounded-xl bg-white/10 scale-0 group-hover:scale-100 transition-transform duration-500" />
      </button>
    </div>
  )
}

export default Header