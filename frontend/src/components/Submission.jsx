import { useExecutionStore } from "../store/useExecutionStore.js";

const Submission = () => {
  const { submission } = useExecutionStore();

  if (!submission) {
    return (
      <div className="flex w-full justify-center py-10">
        <span className="loading loading-spinner loading-lg text-primary" />
      </div>
    );
  }

  const { testCases } = submission;
  const passedCount = testCases.filter((tc) => tc.passed).length;
  const totalCount = testCases.length;

  const avg = (key) => {
    const values = testCases
      .map((tc) => tc[key])
      .filter(Boolean)
      .map((value) => Number.parseFloat(String(value).split(" ")[0]))
      .filter((n) => Number.isFinite(n));

    if (!values.length) return "-";

    if (key === "time") return `${(values.reduce((a, b) => a + b, 0) / values.length).toFixed(3)} s`;
    return `${Math.round(values.reduce((a, b) => a + b, 0) / values.length)} KB`;
  };

  return (
    <div className="w-full rounded-2xl bg-base-100 px-4 py-4">

      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-semibold text-primary">
        Test Case Results
        </h3>
        <span className="badge badge-outline">{submission.status}</span>
      </div>

      <div className="mb-4 grid gap-3 md:grid-cols-3">
        <div className="rounded-xl border border-base-300 bg-base-200 p-3">
          <p className="text-xs text-base-content/65">Passed</p>
          <p className="text-xl font-black text-success">{passedCount}/{totalCount}</p>
        </div>
        <div className="rounded-xl border border-base-300 bg-base-200 p-3">
          <p className="text-xs text-base-content/65">Average Runtime</p>
          <p className="text-xl font-black text-primary">{avg("time")}</p>
        </div>
        <div className="rounded-xl border border-base-300 bg-base-200 p-3">
          <p className="text-xs text-base-content/65">Average Memory</p>
          <p className="text-xl font-black text-secondary">{avg("memory")}</p>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-2 border-b border-base-300 pb-2 text-xs font-semibold text-base-content/60">
        <div className="col-span-2">Test Case</div>
        <div className="col-span-2">Status</div>
        <div className="col-span-3">Time</div>
        <div className="col-span-3">Memory</div>
        <div className="col-span-2 text-right">Output</div>
      </div>

      {testCases.map((tc) => (
        <div
          key={tc.testCase}
          className="grid grid-cols-12 items-start gap-2 border-b border-base-200 py-3 transition hover:bg-base-200/50"
        >
          <div className="col-span-2 font-medium">#{tc.testCase}</div>

          <div className="col-span-2">
            <span
              className={`badge badge-sm ${tc.passed ? "badge-success" : "badge-error"
                }`}
            >
              {tc.passed ? "Passed" : "Failed"}
            </span>
          </div>

          <div className="col-span-3 text-sm opacity-80">
            {tc.time ?? "-"}
          </div>

          <div className="col-span-3 text-sm opacity-80">
            {tc.memory ?? "-"}
          </div>

          <div className="col-span-2 text-right">
            {!tc.passed && (
              <details>
                <summary className="cursor-pointer text-primary underline underline-offset-2">
                  View
                </summary>

                <div className="mt-2 text-left space-y-2">
                  <div>
                    <p className="text-error font-medium text-xs">
                      Expected
                    </p>
                    <pre className="overflow-x-auto rounded-md bg-base-200 p-2 text-xs">
                      {tc.expected}
                    </pre>
                  </div>

                  <div>
                    <p className="text-error font-medium text-xs">
                      Your Output
                    </p>
                    <pre className="overflow-x-auto rounded-md bg-base-200 p-2 text-xs">
                      {tc.stdout}
                    </pre>
                  </div>
                </div>
              </details>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Submission;
