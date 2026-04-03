import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { lazy, StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";

import { createRootRoute, createRoute, createRouter, Outlet, RouterProvider } from "@tanstack/react-router";
import { Toaster } from "sonner";
import App from "./App.tsx";
import { ThemeProvider } from "./components/theme-provider.tsx";
import "./index.css";
import { NotificationSubscriber } from "./notification.tsx";

const Encrypt = lazy(() => import("./encrypt"));

const queryClient = new QueryClient();

const RootRoute = createRootRoute({
  component: () => (
    <ThemeProvider defaultTheme="dark" storageKey="darkMode">
      <Outlet />
      <Toaster />
      <NotificationSubscriber />
    </ThemeProvider>
  ),
});

type MySearch = {
  notify?: string;
};

const IndexRoute = createRoute({
  getParentRoute: () => RootRoute,
  path: "/",
  component: App,
  validateSearch: (search: Record<string, unknown>): MySearch => {
    return {
      notify: search.notify as string | undefined,
    };
  },
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

const routeTree = RootRoute.addChildren([IndexRoute, EncryptRoute]);

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
