import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Clock3, MemoryStick, CheckCircle2, XCircle } from 'lucide-react';
import { useSubmissionStore } from '../store/useSubmissionStore';

const SubmissionDetailPage = () => {
  const { submissionId } = useParams();
  const {
    submissionDetails,
    isSubmissionLoading,
    getSubmissionDetailsById,
    clearSubmissionDetails,
  } = useSubmissionStore();

  useEffect(() => {
    if (!submissionId) return;
    getSubmissionDetailsById(submissionId);

    return () => {
      clearSubmissionDetails();
    };
  }, [submissionId, getSubmissionDetailsById, clearSubmissionDetails]);

  if (isSubmissionLoading || !submissionDetails) {
    return (
      <div className="grid min-h-[calc(100vh-8rem)] place-items-center">
        <span className="loading loading-dots loading-lg text-primary" />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-5">
      <section className="rounded-3xl border border-base-300 bg-base-100 p-5 shadow-lg">
        <div className="mb-3 flex items-center justify-between">
          <Link to={`/problem/${submissionDetails.problem.id}?tab=submissions`} className="btn btn-ghost btn-sm">
            <ArrowLeft className="h-4 w-4" /> Back to Problem
          </Link>
          <span className="badge badge-outline">{submissionDetails.language}</span>
        </div>
        <h1 className="text-2xl font-black tracking-tight">{submissionDetails.problem.title}</h1>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-base-content/70">
          <span className={`badge ${submissionDetails.status === 'Accepted' ? 'badge-success' : 'badge-error'}`}>
            {submissionDetails.status}
          </span>
          <span>Submitted {new Date(submissionDetails.createdAt).toLocaleString('en-US')}</span>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-3xl border border-base-300 bg-base-100 p-5 shadow">
          <h2 className="mb-4 text-lg font-bold">Source Code</h2>
          <pre className="max-h-[460px] overflow-auto rounded-xl bg-base-200 p-4 text-sm">
            {typeof submissionDetails.sourceCode === 'string'
              ? submissionDetails.sourceCode
              : JSON.stringify(submissionDetails.sourceCode, null, 2)}
          </pre>
        </div>

        <div className="rounded-3xl border border-base-300 bg-base-100 p-5 shadow">
          <h2 className="mb-4 text-lg font-bold">Test Case Breakdown</h2>
          <div className="space-y-3">
            {submissionDetails.testCases?.map((testCase) => (
              <div key={testCase.id} className="rounded-xl border border-base-300 p-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">Test Case #{testCase.testCase}</span>
                  {testCase.passed ? (
                    <span className="inline-flex items-center gap-1 text-success"><CheckCircle2 className="h-4 w-4" />Passed</span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-error"><XCircle className="h-4 w-4" />Failed</span>
                  )}
                </div>
                <div className="mt-2 grid gap-2 text-xs text-base-content/70 sm:grid-cols-2">
                  <div className="inline-flex items-center gap-1"><Clock3 className="h-4 w-4" />{testCase.time || 'N/A'}</div>
                  <div className="inline-flex items-center gap-1"><MemoryStick className="h-4 w-4" />{testCase.memory || 'N/A'}</div>
                </div>
                {!testCase.passed && (
                  <div className="mt-3 grid gap-2 text-xs md:grid-cols-2">
                    <div>
                      <p className="mb-1 font-medium text-error">Expected</p>
                      <pre className="overflow-auto rounded-md bg-base-200 p-2">{testCase.expected}</pre>
                    </div>
                    <div>
                      <p className="mb-1 font-medium text-warning">Output</p>
                      <pre className="overflow-auto rounded-md bg-base-200 p-2">{testCase.stdout || 'No output'}</pre>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default SubmissionDetailPage;
