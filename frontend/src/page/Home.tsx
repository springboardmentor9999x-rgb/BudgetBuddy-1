import { FcMoneyTransfer } from "react-icons/fc"

const Home = () => {
  return (
    <main>
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-[#1e1e2f] to-[#15151f] text-white">
        <div className="flex flex-col items-center justify-center text-center">
          <FcMoneyTransfer size={100} className="mb-4" />
          <h1 className="text-4xl font-bold mb-2">Welcome to BudgetBuddy</h1>
          <p className="text-lg text-gray-400">Your personal finance companion</p>
        </div>
        <button
          onClick={() => window.location.href = '/login'}
          className="mt-8 px-6 py-3 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-colors duration-300 active:scale-95 hover:scale-102">
          Get started
        </button>
      </div>
    </main>
  )
}

export default Home