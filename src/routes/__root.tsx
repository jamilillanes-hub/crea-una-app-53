import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { StoreProvider } from "@/lib/store";
import { SiteHeader } from "@/components/pidelo/SiteHeader";
import { CartSheet } from "@/components/pidelo/CartSheet";
import { Toaster } from "@/components/ui/sonner";

function NotFoundComponent() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="panel max-w-md p-10 text-center">
        <h1 className="text-7xl">404</h1>
        <h2 className="mt-4 text-2xl">Página no encontrada</h2>
        <p className="mt-2 text-muted-foreground">Esta página no existe o fue movida.</p>
        <Link to="/" className="btn-ink mt-6">
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="panel max-w-md p-10 text-center">
        <h1 className="text-3xl">Esta página no cargó</h1>
        <p className="mt-2 text-muted-foreground">Algo salió mal. Intenta de nuevo o vuelve al inicio.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="btn-ink"
          >
            Intentar de nuevo
          </button>
          <a href="/" className="btn-paper">
            Ir al inicio
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "PIDELO — Pide comida de tus puestos favoritos" },
      { name: "description", content: "Pide salteñas, pizza, hamburguesas, sushi y postres de los puestos de tu patio de comidas." },
      { property: "og:title", content: "PIDELO — Pide comida de tus puestos favoritos" },
      { property: "og:description", content: "Pide de varios puestos en un solo carrito, con promociones del mes." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Anton&family=Figtree:wght@400;500;600;700;800&display=swap",
      },
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <StoreProvider>
        <SiteHeader />
        <main className="mx-auto max-w-[1400px] px-4 pb-20 sm:px-10">
          <Outlet />
        </main>
        <CartSheet />
        <Toaster position="bottom-center" />
      </StoreProvider>
    </QueryClientProvider>
  );
}
