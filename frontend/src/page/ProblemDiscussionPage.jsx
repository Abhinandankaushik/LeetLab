import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useProblemStore } from '../store/useProblemStore';
import ProblemDiscussionPanel from '../components/ProblemDiscussionPanel';

const ProblemDiscussionPage = () => {
  const { problemId } = useParams();
  const { problem, getProblemById, isProblemLoading } = useProblemStore();

  useEffect(() => {
    if (!problemId) return;
    getProblemById(problemId);
  }, [problemId, getProblemById]);

  if (isProblemLoading || !problem) {
    return (
      <div className="grid min-h-[calc(100vh-8rem)] place-items-center">
        <span className="loading loading-dots loading-lg text-primary" />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-5">
      <section className="rounded-3xl border border-base-300 bg-base-100 p-5 shadow-lg">
        <Link to="/discussion" className="btn btn-ghost btn-sm">
          <ArrowLeft className="h-4 w-4" /> All Discussions
        </Link>
        <h1 className="mt-3 text-3xl font-black tracking-tight">{problem.title}</h1>
        <p className="mt-1 text-sm text-base-content/70">Focused discussion feed for this problem only.</p>
      </section>

      <ProblemDiscussionPanel problemId={problem.id} />
    </div>
  );
};

export default ProblemDiscussionPage;
