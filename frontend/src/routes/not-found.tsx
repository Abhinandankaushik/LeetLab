import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-7xl font-bold text-primary">404</h1>
        <h2 className="mt-4 font-display text-xl font-semibold">Lost in the testcase grid</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          This route doesn't exist. Try heading back to the problemset.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Home
          </Link>
          <Link
            to="/problems"
            className="inline-flex items-center justify-center rounded-md border border-border px-4 py-2 text-sm font-semibold hover:bg-muted"
          >
            Browse problems
          </Link>
        </div>
      </div>
    </div>
  );
}
