const trackMeta = [
    { key: 'Easy', color: 'text-success', bg: 'bg-success/10', border: 'border-success/30' },
    { key: 'Medium', color: 'text-warning', bg: 'bg-warning/10', border: 'border-warning/30' },
    { key: 'Hard', color: 'text-error', bg: 'bg-error/10', border: 'border-error/30' },
];

const TotalProblemTrack = ({ TotalProblemSolvedByUser, TotalProblemPresentInPlatform }) => {
    return (
        <div className="w-full space-y-3">
            {trackMeta.map((track) => (
                <div
                    key={track.key}
                    className={`flex items-center justify-between rounded-2xl border px-4 py-3 ${track.bg} ${track.border}`}
                >
                    <p className={`text-sm font-semibold ${track.color}`}>{track.key}</p>
                    <div className="text-sm">
                        <span className="text-lg font-black">{TotalProblemSolvedByUser?.[track.key] ?? 0}</span>
                        <span className="mx-1 text-base-content/50">/</span>
                        <span className="font-semibold text-base-content/70">{TotalProblemPresentInPlatform?.[track.key] ?? 0}</span>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default TotalProblemTrack;