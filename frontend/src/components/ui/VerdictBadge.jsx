import { CheckCircle2, XCircle, Timer, AlertTriangle, Bug } from 'lucide-react';

const styles = {
  accepted: {
    label: 'Accepted',
    className: 'border-[#00D4AA55] bg-[#00D4AA1A] text-[#00D4AA]',
    icon: CheckCircle2,
  },
  wrong_answer: {
    label: 'Wrong Answer',
    className: 'border-[#FF475755] bg-[#FF47571A] text-[#FF4757]',
    icon: XCircle,
  },
  tle: {
    label: 'Time Limit Exceeded',
    className: 'border-[#FFB80055] bg-[#FFB8001A] text-[#FFB800]',
    icon: Timer,
  },
  mle: {
    label: 'Memory Limit Exceeded',
    className: 'border-[#FFB80055] bg-[#FFB8001A] text-[#FFB800]',
    icon: AlertTriangle,
  },
  runtime_error: {
    label: 'Runtime Error',
    className: 'border-[#FF475755] bg-[#FF47571A] text-[#FF4757]',
    icon: Bug,
  },
  compile_error: {
    label: 'Compile Error',
    className: 'border-[#FF475755] bg-[#FF47571A] text-[#FF4757]',
    icon: AlertTriangle,
  },
};

const VerdictBadge = ({ status = 'wrong_answer', className = '' }) => {
  const key = String(status).toLowerCase();
  const config = styles[key] || styles.wrong_answer;
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold ${config.className} ${className}`}>
      <Icon className="h-3.5 w-3.5" />
      {config.label}
    </span>
  );
};

export default VerdictBadge;
