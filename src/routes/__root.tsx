import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">
          Page not found
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Lore — Every list you finish is a day you lived" },
      { name: "description", content: "Every list you finish is a day you lived. Lore keeps both. Track tasks, reading habits, and personal growth." },
      { name: "author", content: "Lovable" },
      { property: "og:title", content: "Lore — Every list you finish is a day you lived" },
      { property: "og:description", content: "Every list you finish is a day you lived. Lore keeps both. Track tasks, reading habits, and personal growth." },
      { property: "og:type", content: "website" },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/7a81d0d2-3896-4428-b68e-a9887515b8a6/id-preview-287b7800--825e3947-9e5b-41c3-9078-38b5a1480bc9.lovable.app-1775221736204.png" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:site", content: "@Lovable" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/7a81d0d2-3896-4428-b68e-a9887515b8a6/id-preview-287b7800--825e3947-9e5b-41c3-9078-38b5a1480bc9.lovable.app-1775221736204.png" },
      { name: "twitter:title", content: "Lore — Every list you finish is a day you lived" },
      { name: "twitter:description", content: "Every list you finish is a day you lived. Lore keeps both. Track tasks, reading habits, and personal growth." },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
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
  return <Outlet />;
}
