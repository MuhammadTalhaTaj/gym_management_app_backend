// src/components/Signup/PasswordInput.tsx
import { useState } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";

const PasswordInput = ({ label, error, gridCol = "", ...props }: any) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className={`${gridCol}`}>
      <label className="flex items-center gap-2 text-[var(--tertiary-500)] text-sm mb-2">
        <Lock size={16} />
        {label}
      </label>

      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          className="w-full bg-[var(--tertiary-600)] border border-[var(--primary-100)] rounded-lg px-4 py-3 pr-12 text-white placeholder-[var(--primary-300)] focus:outline-none focus:border-[var(--secondary-100)] transition-colors"
          {...props}
        />

        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--primary-300)] hover:text-[var(--tertiary-500)] transition-colors"
        >
          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </div>

      {error && <p className="text-[var(--tertiary-100)] text-xs mt-1">{error}</p>}
    </div>
  );
};

export default PasswordInput;
