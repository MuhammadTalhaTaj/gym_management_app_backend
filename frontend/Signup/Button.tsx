// src/components/Signup/Button.tsx


const Button = ({ children, icon: Icon, onClick, disabled, ...props }: any) => {
  return (
    <button
      onClick={onClick}
      type={props.type || "button"}
      role="button"
      disabled={disabled}
      className="w-full bg-[var(--secondary-100)] hover:bg-opacity-90 text-white font-medium py-3.5 px-6 rounded-lg flex items-center justify-center gap-2 transition-all"
      {...props}
    >
      {Icon && <Icon size={20} />}
      {children}
    </button>
  );
};

export default Button;
