import zxcvbn from "zxcvbn";
import { motion } from "framer-motion";

const PasswordStrength = ({ password }) => {
  if (!password) {
    return null;
  }

  const result = zxcvbn(password);
  const score = result.score;

  const levels = [
    {
      label: "Very weak",
      bar: "bg-red-500",
      text: "text-red-600",
    },
    {
      label: "Weak",
      bar: "bg-orange-500",
      text: "text-orange-600",
    },
    {
      label: "Fair",
      bar: "bg-amber-500",
      text: "text-amber-600",
    },
    {
      label: "Good",
      bar: "bg-blue-500",
      text: "text-blue-600",
    },
    {
      label: "Strong",
      bar: "bg-emerald-500",
      text: "text-emerald-600",
    },
  ];

  const current = levels[score];

  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-3"
    >
      <div className="flex gap-1.5">
        {[0, 1, 2, 3, 4].map((item) => (
          <div
            key={item}
            className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-200"
          >
            {item <= score && (
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 0.25 }}
                className={`h-full rounded-full ${current.bar}`}
              />
            )}
          </div>
        ))}
      </div>

      <div className="mt-2 flex items-center justify-between">
        <p className="text-xs text-slate-400">
          Password strength
        </p>

        <p className={`text-xs font-semibold ${current.text}`}>
          {current.label}
        </p>
      </div>

      {result.feedback?.suggestions?.length > 0 && score < 3 && (
        <p className="mt-2 text-xs leading-5 text-slate-500">
          {result.feedback.suggestions[0]}
        </p>
      )}
    </motion.div>
  );
};

export default PasswordStrength;