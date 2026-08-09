import { useEffect, useState } from "react";

import { useAuthStore } from "../store/useAuthStore.ts";
import RegisterFormBlock from "../RegisterPage.tsx";
import SigninPage from "../SigninPage.tsx";
import { setPageTitle } from "../../../utils/setTitle.ts";
import Loading from "../../Loading.tsx";


const Auth = () => {
  setPageTitle("BudgetBuddy - Sign In / Register");
  const [registerClicked, setRegisterClicked] = useState(false);
  // const getUserProfile = useAuthStore((state) => state.getUserProfile);
  const loading = useAuthStore((state) => state.loading);

  if (loading) {
    return <Loading />;
  }
  return (
    <>
      {registerClicked ? (
        <RegisterFormBlock setRegisterClicked={setRegisterClicked} />
      ) : (
        <SigninPage setRegisterClicked={setRegisterClicked} />
      )}
    </>
  )
}

export default Auth