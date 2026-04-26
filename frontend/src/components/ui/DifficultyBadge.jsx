const normalizeLevel = (level = '') => {
  const normalized = String(level).toLowerCase();
  if (normalized.includes('easy')) return 'easy';
  if (normalized.includes('medium')) return 'medium';
  if (normalized.includes('hard')) return 'hard';
  return 'unknown';
};

const styles = {
  easy: 'border-[#00D4AA44] bg-[#00D4AA1A] text-[#00D4AA]',
  medium: 'border-[#FFB80044] bg-[#FFB8001A] text-[#FFB800]',
  hard: 'border-[#FF475744] bg-[#FF47571A] text-[#FF4757]',
  unknown: 'border-base-300 bg-base-200 text-base-content/70',
};

const labels = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
  unknown: 'Unknown',
};

const DifficultyBadge = ({ level, className = '' }) => {
  const key = normalizeLevel(level);

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${styles[key]} ${className}`}
      aria-label={`Difficulty ${labels[key]}`}
    >
      {labels[key]}
    </span>
  );
};

export default DifficultyBadge;
