import {
    CheckCircle2,
    XCircle,
    Clock,
    MemoryStick as Memory,
    Calendar,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";

const SubmissionsList = ({ submissions, isSubmissionLoading }) => {
    // Helper function to safely parse JSON strings to JSON Object
    const safeParse = (data) => {
        try {
            const parsed = JSON.parse(data);
            return Array.isArray(parsed) ? parsed : [];
        } catch (error) {
            console.log("error parsing json ", error);
            return [];
        }
    };

    // Helper function to calculate average memory usage
    const calculateAverageMemory = (memoryData) => {
        const memoryArray = safeParse(memoryData).map((m) =>
            parseFloat(m.split(" ")[0])
        );
        if (memoryArray.length === 0) return 0;
        return memoryArray.reduce((acc, curr) => acc + curr, 0) / memoryArray.length;
    };

    // Helper function to calculate average runtime
    const calculateAverageTime = (timeData) => {
        const timeArray = safeParse(timeData).map((t) =>
            parseFloat(t.split(" ")[0])
        );
        if (timeArray.length === 0) return 0;
        return timeArray.reduce((acc, curr) => acc + curr, 0) / timeArray.length;
    };

    // Loading state
    if (isSubmissionLoading) {
        return (
            <div className="flex min-h-[200px] items-center justify-center rounded-3xl border border-base-300 bg-base-200/60">
                <div className="relative">
                    <div className="h-16 w-16 animate-spin rounded-full border-b-4 border-t-4 border-primary" />
                    <div className="absolute inset-0 flex items-center justify-center text-sm font-medium text-base-content">
                        Loading...
                    </div>
                </div>
            </div>
        );
    }

    // No submissions state
    if (!submissions?.length) {
        return (
            <div className="flex min-h-[200px] flex-col items-center justify-center rounded-3xl border border-base-300 bg-base-200/60 text-base-content/70">
                <svg className="mb-4 h-12 w-12 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p className="text-lg font-medium">No submissions yet</p>
                <p className="text-sm opacity-70">Start coding to see your submissions here!</p>
            </div>
        );
    }

    return (
        <div className="max-h-[600px] overflow-y-auto pr-2" style={{ scrollBehavior: 'smooth' }}>
            <div className="space-y-4">
                <AnimatePresence>
                    {submissions?.map((submission) => {
                        const avgMemory = calculateAverageMemory(submission.memory);
                        const avgTime = calculateAverageTime(submission.time);

                        return (
                            <motion.div
                                key={submission.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                                className="card border border-base-300 bg-base-100 shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-2xl"
                            >
                                <Link to={`/submission/${submission.id}`} className="card-body flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                                    {/* Left Section: Status and Language */}
                                    <div className="flex items-center gap-4">
                                        {submission.status === "Accepted" ? (
                                            <div className="flex items-center gap-2 text-success">
                                                <CheckCircle2 className="w-6 h-6 animate-pulse" />
                                                <span className="font-semibold text-lg">Accepted</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2 text-error">
                                                <XCircle className="w-6 h-6 animate-pulse" />
                                                <span className="font-semibold text-lg">
                                                    {submission.status}
                                                </span>
                                            </div>
                                        )}
                                        <div className="badge badge-primary px-3 py-1 text-sm font-medium text-white">
                                            {submission.language}
                                        </div>
                                    </div>

                                    {/* Right Section: Runtime, Memory, and Date */}
                                    <div className="flex flex-wrap items-center gap-4 text-sm text-base-content/70">
                                        <div className="flex items-center gap-1 transition-colors hover:text-primary">
                                            <Clock className="w-4 h-4" />
                                            <span>{avgTime.toFixed(3)} s</span>
                                        </div>
                                        <div className="flex items-center gap-1 transition-colors hover:text-primary">
                                            <Memory className="w-4 h-4" />
                                            <span>{avgMemory.toFixed(0)} KB</span>
                                        </div>
                                        <div className="flex items-center gap-1 transition-colors hover:text-primary">
                                            <Calendar className="w-4 h-4" />
                                            <span>
                                                {new Date(submission.createdAt).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric',
                                                })}
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default SubmissionsList;