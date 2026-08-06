import { useState } from "react";

import RegisterFormBlock from "../components/auth/RegisterPage"
import SigninPage from "../components/auth/SigninPage"


const AuthPage = () => {
  const [registerClicked, setRegisterClicked] = useState(false);

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

export default AuthPage