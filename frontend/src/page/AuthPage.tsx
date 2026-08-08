import { useState } from "react";

import RegisterFormBlock from "../features/auth/RegisterPage.tsx"
import SigninPage from "../features/auth/SigninPage.tsx"


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