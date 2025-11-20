// src/components/Signup/GymIcon.tsx
const GymIcon = () => {
  return (
    <div className="w-16 h-16 bg-[var(--secondary-100)] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="w-8 h-8 text-white"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M6.5 6.5v11" />
        <path d="M17.5 6.5v11" />
        <path d="M3 10v4" />
        <path d="M21 10v4" />
        <path d="M6.5 12h11" />
        <path d="M3 12h3.5" />
        <path d="M17.5 12H21" />
      </svg>
    </div>
  );
};

export default GymIcon;
