// src/components/Signup/SectionHeader.tsx


const SectionHeader = ({ icon: Icon, title }: any) => {
  return (
    <div className="flex items-center gap-2 text-white font-medium mb-4 pt-6">
      {Icon && <Icon size={20} />}
      {title}
    </div>
  );
};

export default SectionHeader;
