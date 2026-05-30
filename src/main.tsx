import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { lazy, StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";

import { createRootRoute, createRoute, createRouter, Outlet, RouterProvider } from "@tanstack/react-router";
import { Toaster } from "sonner";
import App from "./App.tsx";
import { ThemeProvider } from "./components/theme-provider.tsx";
import { SavedDealsProvider } from "./hooks/use-saved-deals";
import "./index.css";

const Encrypt = lazy(() => import("./encrypt"));

const About = lazy(() => import("./about"));

const queryClient = new QueryClient();

const RootRoute = createRootRoute({
  component: () => (
    <ThemeProvider defaultTheme="dark" storageKey="darkMode">
      <SavedDealsProvider>
        <Outlet />
        <Toaster />
      </SavedDealsProvider>
    </ThemeProvider>
  ),
});

const IndexRoute = createRoute({
  getParentRoute: () => RootRoute,
  path: "/",
  component: App,
});

const EncryptRoute = createRoute({
  getParentRoute: () => RootRoute,
  path: "/encrypt",
  component: () => (
    <Suspense fallback={<div className="p-4">Loading…</div>}>
      <Encrypt />
    </Suspense>
  ),
});

const AboutRoute = createRoute({
  getParentRoute: () => RootRoute,
  path: "/about",
  component: () => (
    <Suspense fallback={<div className="p-4">Loading…</div>}>
      <About />
    </Suspense>
  ),
});

const routeTree = RootRoute.addChildren([IndexRoute, EncryptRoute, AboutRoute]);

const router = createRouter({
  routeTree,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>,
);
