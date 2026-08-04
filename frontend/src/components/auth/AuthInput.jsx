import { motion } from "framer-motion";

const AuthInput = ({
  label,
  name,
  type = "text",
  value,
  onChange,
  icon: Icon,
  required = false,
  autoComplete,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="relative"
    >
      {Icon && (
        <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-lg text-slate-400 pointer-events-none" />
      )}

      <input
        id={name}
        name={name}
        type={type}
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
          px-4
          pb-2
          pt-6
          pl-11
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
    </motion.div>
  );
};

export default AuthInput;