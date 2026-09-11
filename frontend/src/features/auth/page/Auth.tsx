import { useAuthStore } from "../store/useAuthStore.ts";
import { setPageTitle } from "../../../utils/setTitle.ts";
import SigninPage from "../SigninPage.tsx";
import Loading from "../../Loading.tsx";


const Auth = () => {
  setPageTitle("BudgetBuddy - Sign In / Register");
  const loading = useAuthStore((state) => state.loading);

  if (loading) {
    return <Loading />;
  }
  return (
    <>
      <SigninPage />
    </>
  )
}

export default Auth