// Central place to read Clerk config. Social login (Google / GitHub) is fully
// optional: if no publishable key is set, the Clerk provider, social buttons and
// SSO routes are simply not rendered, and the app keeps working with email/password.
export const CLERK_PUBLISHABLE_KEY =
  (typeof import.meta !== "undefined" &&
    (import.meta as any).env?.VITE_CLERK_PUBLISHABLE_KEY) ||
  "";

export const clerkEnabled = Boolean(CLERK_PUBLISHABLE_KEY);
