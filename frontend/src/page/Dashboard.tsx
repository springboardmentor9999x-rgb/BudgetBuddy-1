import { FcMoneyTransfer } from "react-icons/fc";
import { setPageTitle } from "../utils/setTitle";

const Dashboard = () => {
  setPageTitle("Dashboard")
  return (
    <>
      <main>
        <div className="flex flex-col items-center justify-center min-h-screen text-white background-color">
          <div className="flex flex-col items-center justify-center text-center">
            <FcMoneyTransfer size={100} className="mb-4" />
            <h1 className="text-4xl font-bold mb-2">Welcome to BudgetBuddy</h1>
            <p className="text-lg text-gray-400">Your personal finance companion</p>
          </div>
        </div>
      </main>
      {/* )} */}
    </>

  )
}

export default Dashboard;