import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ClerkProvider } from "@clerk/clerk-react";
import App from "./App";
import { CLERK_PUBLISHABLE_KEY, clerkEnabled } from "./lib/clerk";
import "./styles.css";

const tree = (
  <BrowserRouter>
    <App />
  </BrowserRouter>
);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    {clerkEnabled ? (
      <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY} afterSignOutUrl="/">
        {tree}
      </ClerkProvider>
    ) : (
      tree
    )}
  </React.StrictMode>
);
