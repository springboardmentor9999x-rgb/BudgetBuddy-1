import { useState } from "react";
import { motion } from "framer-motion";
import { FiLock, FiEye, FiEyeOff } from "react-icons/fi";

const PasswordInput = ({
  label,
  name,
  value,
  onChange,
  required = false,
  autoComplete = "new-password",
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="relative"
    >
      <FiLock
        className="
          pointer-events-none
          absolute
          left-4
          top-1/2
          z-10
          -translate-y-1/2
          text-lg
          text-slate-400
        "
      />

      <input
        id={name}
        name={name}
        type={showPassword ? "text" : "password"}
        value={value}
        onChange={onChange}
        required={required}
        autoComplete={autoComplete}
        placeholder=" "
        className="
          peer
          w-full
          rounded-xl
          border
          border-slate-200
          bg-slate-50/70
          pb-2
          pl-11
          pr-12
          pt-6
          text-sm
          text-slate-900
          outline-none
          transition-all
          duration-200
          hover:border-slate-300
          focus:border-indigo-500
          focus:bg-white
          focus:ring-4
          focus:ring-indigo-500/10
        "
      />

      <label
        htmlFor={name}
        className="
          pointer-events-none
          absolute
          left-11
          top-2
          text-xs
          font-medium
          text-slate-500
          transition-all
          duration-200

          peer-placeholder-shown:top-1/2
          peer-placeholder-shown:-translate-y-1/2
          peer-placeholder-shown:text-sm
          peer-placeholder-shown:text-slate-400

          peer-focus:top-2
          peer-focus:translate-y-0
          peer-focus:text-xs
          peer-focus:text-indigo-600
        "
      >
        {label}
      </label>

      <button
        type="button"
        onClick={() => setShowPassword((prev) => !prev)}
        aria-label={showPassword ? "Hide password" : "Show password"}
        className="
          absolute
          right-4
          top-1/2
          z-10
          -translate-y-1/2
          text-lg
          text-slate-400
          transition
          hover:text-indigo-600
          focus:outline-none
        "
      >
        {showPassword ? <FiEyeOff /> : <FiEye />}
      </button>
    </motion.div>
  );
};

export default PasswordInput;