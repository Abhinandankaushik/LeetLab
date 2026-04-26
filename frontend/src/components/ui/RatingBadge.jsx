import { Star } from 'lucide-react';

const tiers = [
  { max: 1199, label: 'Newbie', color: '#808080' },
  { max: 1399, label: 'Pupil', color: '#008000' },
  { max: 1599, label: 'Specialist', color: '#03A89E' },
  { max: 1899, label: 'Expert', color: '#0000FF' },
  { max: 2099, label: 'Candidate Master', color: '#AA00AA' },
  { max: 2299, label: 'Master', color: '#FF8C00' },
  { max: 2399, label: 'International Master', color: '#FF8C00' },
  { max: 2999, label: 'Grandmaster', color: '#FF0000' },
  { max: Number.POSITIVE_INFINITY, label: 'Legendary', color: '#FF0000', legendary: true },
];

const getTier = (rating = 0) => tiers.find((tier) => rating <= tier.max) || tiers[0];

const RatingBadge = ({ rating = 0, className = '' }) => {
  const tier = getTier(rating);

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold ${className}`}
      style={{ borderColor: `${tier.color}66`, backgroundColor: `${tier.color}1A`, color: tier.color }}
      aria-label={`Tier ${tier.label} with rating ${rating}`}
    >
      {tier.legendary && <Star className="h-3.5 w-3.5" />}
      {tier.label} {rating}
    </span>
  );
};

export default RatingBadge;
