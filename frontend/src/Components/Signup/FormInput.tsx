// src/components/Signup/FormInput.tsx


const FormInput = ({ label, icon: Icon, error, gridCol = "", ...props }: any) => {
  return (
    <div className={`${gridCol}`}>
      <label className="flex items-center gap-2 text-[var(--tertiary-500)] text-sm mb-2">
        {Icon && <Icon size={16} />}
        {label}
      </label>

      <input
        className="w-full bg-[var(--tertiary-600)] border border-[var(--primary-100)] rounded-lg px-4 py-3 text-white placeholder-[var(--primary-300)] focus:outline-none focus:border-[var(--secondary-100)] transition-colors"
        {...props}
      />

      {error && <p className="text-[var(--tertiary-100)] text-xs mt-1">{error}</p>}
    </div>
  );
};

export default FormInput;
