const TagChip = ({ label, className = '' }) => {
  return (
    <span
      className={`inline-flex items-center rounded-full border border-base-300 bg-base-200 px-2.5 py-1 text-xs font-medium text-base-content/75 transition hover:border-primary/50 hover:text-base-content ${className}`}
    >
      {label}
    </span>
  );
};

export default TagChip;
