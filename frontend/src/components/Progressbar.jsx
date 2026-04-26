// import React from 'react'

// const Progressbar = ({ value ,totalProblemsCount}) => {
//     return (
//         <div>
//             <div className="h-40 w-40 radial-progress text-primary" style={{ "--value":  `${(value/totalProblemsCount)*100}` }} aria-valuenow={value} role="progressbar">
//                 {`${value}/${totalProblemsCount}`}
//             </div>
//         </div>
//     )
// }

// export default Progressbar



const Progressbar = ({ value = 0, totalProblemsCount = 0 }) => {
  const safeTotal = Math.max(totalProblemsCount, 1);
  const percentage = Math.min(100, Math.max(0, (value / safeTotal) * 100));

  return (
    <div className="flex w-full flex-col items-center justify-center rounded-3xl border border-base-300 bg-base-100 p-6 text-center shadow-sm md:w-[50%]">
      <div
        className="radial-progress text-primary"
        style={{ "--value": percentage, "--size": "9rem", "--thickness": "0.35rem" }}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={safeTotal}
      >
        <div className="flex flex-col items-center leading-tight">
          <span className="text-2xl font-black">{value}</span>
          <span className="text-xs text-base-content/60">/{safeTotal}</span>
        </div>
      </div>
      <p className="mt-4 text-sm font-medium text-base-content/70">
        {percentage.toFixed(1)}% completed
      </p>
    </div>
  );
};

export default Progressbar;
