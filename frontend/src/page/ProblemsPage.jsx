import { useEffect } from 'react';
import { Loader } from 'lucide-react';
import { useProblemStore } from '../store/useProblemStore';
import ProblemTable from '../components/ProblemTable';

const ProblemsPage = () => {
  const { getAllProblem, isProlemsLoading, problems } = useProblemStore();

  useEffect(() => {
    getAllProblem();
  }, [getAllProblem]);

  if (isProlemsLoading) {
    return (
      <div className="grid min-h-[calc(100vh-8rem)] place-items-center">
        <Loader className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-4">
      <section className="rounded-3xl border border-base-300 bg-base-100 p-6 shadow-lg">
        <h1 className="text-3xl font-black tracking-tight">Problem Set</h1>
        <p className="mt-2 text-base-content/70">
          All coding challenges are listed here with filters, tags, difficulty, and quick actions.
        </p>
      </section>
      <ProblemTable problems={problems} />
    </div>
  );
};

export default ProblemsPage;
