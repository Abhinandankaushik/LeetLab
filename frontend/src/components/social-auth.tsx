import * as React from "react";
import { useNavigate } from "react-router-dom";
import {
  useSignIn,
  useAuth as useClerkAuth,
  AuthenticateWithRedirectCallback,
} from "@clerk/clerk-react";
import { useAuth } from "@/lib/auth-context";
import { authApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Github, Loader2 } from "lucide-react";

type OAuthStrategy = "oauth_google" | "oauth_github";

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38z"
      />
    </svg>
  );
}

/**
 * Google + GitHub social sign-in buttons. Designed to slot under the existing
 * email/password form without changing its look.
 */
export function SocialAuthButtons() {
  const { signIn, isLoaded } = useSignIn();
  const [pending, setPending] = React.useState<OAuthStrategy | null>(null);

  const signInWith = async (strategy: OAuthStrategy) => {
    if (!isLoaded || !signIn) return;
    setPending(strategy);
    try {
      await signIn.authenticateWithRedirect({
        strategy,
        redirectUrl: "/sso-callback",
        redirectUrlComplete: "/sso-finish",
      });
    } catch (err: any) {
      setPending(null);
      toast.error(err?.errors?.[0]?.message || "Could not start social sign-in");
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative flex items-center">
        <span className="h-px flex-1 bg-border" />
        <span className="px-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          or continue with
        </span>
        <span className="h-px flex-1 bg-border" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Button
          type="button"
          variant="outline"
          className="hover-lift"
          disabled={!isLoaded || pending !== null}
          onClick={() => signInWith("oauth_google")}
        >
          {pending === "oauth_google" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <GoogleIcon className="h-4 w-4" />
          )}
          Google
        </Button>
        <Button
          type="button"
          variant="outline"
          className="hover-lift"
          disabled={!isLoaded || pending !== null}
          onClick={() => signInWith("oauth_github")}
        >
          {pending === "oauth_github" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Github className="h-4 w-4" />
          )}
          GitHub
        </Button>
      </div>
    </div>
  );
}

function SsoLoader({ label }: { label: string }) {
  return (
    <div className="grid min-h-[60vh] place-items-center">
      <div className="flex flex-col items-center gap-3 text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <p className="font-mono text-xs">{label}</p>
      </div>
    </div>
  );
}

/** Completes the OAuth handshake with Clerk, then forwards to /sso-finish. */
export function SsoCallback() {
  return (
    <>
      <AuthenticateWithRedirectCallback
        signInForceRedirectUrl="/sso-finish"
        signUpForceRedirectUrl="/sso-finish"
      />
      {/* Required for Clerk's bot protection on OAuth sign-ups */}
      <div id="clerk-captcha" />
      <SsoLoader label="Securing your session..." />
    </>
  );
}

/**
 * After Clerk has an active session, exchange its token with our backend so the
 * regular `jwt` cookie is issued and our AuthContext picks up the user.
 */
export function SsoFinish() {
  const { isLoaded, isSignedIn, getToken } = useClerkAuth();
  const { refresh } = useAuth();
  const navigate = useNavigate();
  const ran = React.useRef(false);

  React.useEffect(() => {
    if (!isLoaded || ran.current) return;
    ran.current = true;

    (async () => {
      try {
        if (!isSignedIn) {
          navigate("/login", { replace: true });
          return;
        }
        const token = await getToken();
        if (!token) throw new Error("No session token");
        await authApi.oauth(token);
        await refresh();
        toast.success("Welcome.");
        navigate("/problems", { replace: true });
      } catch (err: any) {
        toast.error(err?.message || "Social sign-in failed");
        navigate("/login", { replace: true });
      }
    })();
  }, [isLoaded, isSignedIn, getToken, refresh, navigate]);

  return <SsoLoader label="Signing you in..." />;
}
