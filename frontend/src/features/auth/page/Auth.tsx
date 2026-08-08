import { useEffect, useState } from "react";

import useAuth from "../hooks/useAuthStore.ts";
import RegisterFormBlock from "../RegisterPage.tsx";
import SigninPage from "../SigninPage.tsx";
import Loading from "../../Loading.tsx";


const Auth = () => {

  const [registerClicked, setRegisterClicked] = useState(false);
  const { getUserProfile } = useAuth();

  
  useEffect(() => {
    async function fetchUser() {
      await getUserProfile();
    }
    fetchUser();
  }, []);

  return (
    <>
      {/* {user ? <Navigate to="/dashboard" /> : null} */}
      {registerClicked ? (
        <RegisterFormBlock setRegisterClicked={setRegisterClicked} />
      ) : (
        <SigninPage setRegisterClicked={setRegisterClicked} />
      )}
    </>
  )
}

export default Auth