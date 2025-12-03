// src/components/Signup/Checkbox.tsx


const Checkbox = ({ label, checked, onChange, error }: any) => {
  return (
    <div>
      <label className="flex items-start gap-3 cursor-pointer group">
        <div className="relative flex-shrink-0 mt-1">
          <input
            type="checkbox"
            checked={checked}
            onChange={onChange}
            className="w-4 h-4 appearance-none border-2 border-[var(--primary-300)] rounded bg-transparent checked:bg-[var(--secondary-100)] checked:border-[var(--secondary-100)] cursor-pointer transition-all"
          />

          {checked && (
            <svg
              className="absolute top-0 left-0 w-4 h-4 text-white pointer-events-none"
              viewBox="0 0 16 16"
            >
              <path
                d="M3 8l3 3 7-7"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </div>

        <span className="text-[var(--tertiary-500)] text-sm leading-relaxed">
          {label}
        </span>
      </label>

      {error && <p className="text-[var(--tertiary-100)] text-xs mt-1 ml-7">{error}</p>}
    </div>
  );
};

export default Checkbox;
