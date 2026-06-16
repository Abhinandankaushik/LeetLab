import { Shield, Lock, Eye, ChevronRight } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="flex flex-col">
      <section className="mx-auto max-w-4xl px-4 py-16 md:py-24">
        <div className="mb-12">
          <div className="mb-4 flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-primary">
            <Shield className="h-4 w-4" />
            <span>Security</span>
          </div>
          <h1 className="font-display text-4xl font-bold tracking-tight md:text-5xl">Privacy Policy</h1>
          <p className="mt-4 text-muted-foreground">Last updated: May 03, 2026</p>
        </div>

        <div className="prose prose-invert max-w-none space-y-12">
          <section>
            <h2 className="font-display text-2xl font-bold">1. Information We Collect</h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              We collect information to provide better services to our users. The data we collect includes:
            </p>
            <ul className="mt-4 list-inside list-disc space-y-2 text-muted-foreground">
              <li><strong>Account Info:</strong> Email address, username, and profile picture (if provided).</li>
              <li><strong>Submission Data:</strong> Code snippets, execution results, and time/memory stats.</li>
              <li><strong>Performance Data:</strong> Contest ratings, streak history, and problem-solving stats.</li>
              <li><strong>Technical Logs:</strong> IP address, browser type, and platform usage patterns.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold">2. How We Use Your Data</h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              Your data is used specifically for:
            </p>
            <ul className="mt-4 list-inside list-disc space-y-2 text-muted-foreground">
              <li>Maintaining your profile and ranking on the leaderboard.</li>
              <li>Executing and grading your code submissions in secure sandboxed containers.</li>
              <li>Providing personalized analytics and recommendations.</li>
              <li>Protecting the platform from abuse and cheating.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold">3. Data Sharing & Third Parties</h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              We do not sell your personal data. We share data only with necessary service providers:
            </p>
            <ul className="mt-4 list-inside list-disc space-y-2 text-muted-foreground">
              <li><strong>Sandboxed Containers:</strong> Isolated code execution infrastructure.</li>
              <li><strong>Supabase/Prisma:</strong> Database and authentication services.</li>
              <li><strong>Cloudflare:</strong> Performance and security.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold">4. Security</h2>
            <div className="mt-6 flex items-start gap-4 rounded-xl border border-border bg-card p-6">
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary">
                <Lock className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-bold">Your data is encrypted.</h4>
                <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                  We use industry-standard encryption (SSL/TLS) for data in transit and secure hashing for passwords. However, no method of transmission over the internet is 100% secure.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold">5. Cookies</h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              We use essential cookies to maintain your session and store your theme preferences (Dark/Light mode). We do not use tracking cookies for third-party advertising.
            </p>
          </section>

          <div className="rounded-xl border border-border bg-muted/30 p-6">
            <h3 className="font-display text-lg font-bold">Contact Privacy Officer</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              If you wish to request data deletion or have privacy concerns, please contact the developer.
            </p>
            <a 
              href="https://www.linkedin.com/in/abhinandan16/" 
              className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Abhinandan Kaushik <ChevronRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
