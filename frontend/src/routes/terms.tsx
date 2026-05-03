import { Shield, Lock, FileText, ChevronRight } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="flex flex-col">
      <section className="mx-auto max-w-4xl px-4 py-16 md:py-24">
        <div className="mb-12">
          <div className="mb-4 flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-primary">
            <FileText className="h-4 w-4" />
            <span>Legal</span>
          </div>
          <h1 className="font-display text-4xl font-bold tracking-tight md:text-5xl">Terms of Service</h1>
          <p className="mt-4 text-muted-foreground">Last updated: May 03, 2026</p>
        </div>

        <div className="prose prose-invert max-w-none space-y-12">
          <section>
            <h2 className="font-display text-2xl font-bold">1. Agreement to Terms</h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              By accessing or using LeetLab, you agree to be bound by these Terms of Service. If you disagree with any part of the terms, you may not access the service. LeetLab is a platform for competitive programming, learning, and technical interview preparation.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold">2. User Accounts</h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              To access certain features of the platform, you must create an account. You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account.
            </p>
            <ul className="mt-4 list-inside list-disc space-y-2 text-muted-foreground">
              <li>You must provide accurate and complete information when creating an account.</li>
              <li>You are responsible for keeping your account secure.</li>
              <li>Accounts are for personal use only and cannot be shared.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold">3. Code Submission & Execution</h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              When you submit code on LeetLab, it is executed on our servers using Judge0 technology.
            </p>
            <ul className="mt-4 list-inside list-disc space-y-2 text-muted-foreground">
              <li>You retain ownership of the code you write.</li>
              <li>You grant LeetLab a non-exclusive right to store, execute, and analyze your submissions for the purpose of providing the service (e.g., grading, rankings).</li>
              <li>Attempting to bypass security restrictions during code execution is strictly prohibited and will result in account termination.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold">4. Conduct & Fair Play</h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              LeetLab is built on the foundation of fair play and learning.
            </p>
            <ul className="mt-4 list-inside list-disc space-y-2 text-muted-foreground">
              <li>Plagiarism or using unauthorized AI tools during rated contests is prohibited.</li>
              <li>Scraping problem data or test cases is strictly forbidden.</li>
              <li>Respectful communication is required in the Discussion forums.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold">5. Limitation of Liability</h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              LeetLab is provided "as is" without any warranties. We are not liable for any damages arising from your use of the platform, including but not limited to loss of data, service interruptions, or grading inaccuracies.
            </p>
          </section>

          <div className="rounded-xl border border-border bg-muted/30 p-6">
            <h3 className="font-display text-lg font-bold">Have questions?</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              If you have any questions about these Terms, please reach out to us on GitHub.
            </p>
            <a 
              href="https://github.com/Abhinandankaushik" 
              className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Contact Support <ChevronRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
