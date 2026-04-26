const sizeMap = {
  sm: 'h-7 w-7 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-14 w-14 text-base',
  xl: 'h-20 w-20 text-lg',
};

const hashColor = (text = '') => {
  const colors = ['#6C63FF', '#00D4AA', '#FFB800', '#FF4757', '#03A89E', '#4A90E2'];
  const value = Array.from(text).reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return colors[value % colors.length];
};

const getInitials = (name = '') => {
  const words = String(name).trim().split(/\s+/).filter(Boolean);
  if (!words.length) return 'U';
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return `${words[0][0]}${words[1][0]}`.toUpperCase();
};

const Avatar = ({ username, displayName, src, size = 'md', isOnline = false, className = '' }) => {
  const label = displayName || username || 'User';

  if (src) {
    return (
      <div className={`relative inline-flex ${className}`}>
        <img src={src} alt={label} className={`${sizeMap[size]} rounded-full object-cover ring-2 ring-base-300`} />
        {isOnline && <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-base-100 bg-[#00D4AA]" />}
      </div>
    );
  }

  return (
    <div className={`relative inline-flex ${className}`}>
      <span
        className={`${sizeMap[size]} inline-flex items-center justify-center rounded-full font-semibold text-white ring-2 ring-base-300`}
        style={{ backgroundColor: hashColor(label) }}
        aria-label={label}
      >
        {getInitials(label)}
      </span>
      {isOnline && <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-base-100 bg-[#00D4AA]" />}
    </div>
  );
};

export default Avatar;
