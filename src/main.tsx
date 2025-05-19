import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App"; // We'll create this next
import { StoreProvider } from "./store";

// Create a client
const queryClient = new QueryClient();

// It's common to create a context for the Zustand store if you need to provide it explicitly.
// However, Zustand is often used directly via its hook (`useStore`).
// For this task, the user story mentions a <StoreProvider>.
// A simple way to achieve this if not built into your Zustand setup is to create a context.

// Let's assume for now the direct hook usage is sufficient as per typical Zustand,
// unless a specific <StoreProvider> component is required by the user's setup.
// If a <StoreProvider> is strictly needed, we'd define it in store/index.ts or here.

// For now, let's proceed without a custom StoreProvider wrapper, as Zustand hooks typically don't require one.
// If this is incorrect, we can adjust.

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <StoreProvider>
        <App />
      </StoreProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
