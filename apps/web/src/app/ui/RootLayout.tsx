import { Link, Outlet } from 'react-router';

export const RootLayout = () => (
  <>
    <a
      href="#main"
      className="sr-only focus:not-sr-only focus:absolute focus:start-3 focus:top-2 focus:z-20 focus:bg-surface focus:px-3 focus:py-2"
    >
      К содержимому
    </a>
    <header className="fixed inset-x-0 top-0 z-10 bg-page">
      <div className="flex h-13 w-full items-center px-3 md:px-5">
        <Link to="/" className="font-medium">
          Canvas
        </Link>
      </div>
    </header>
    <main id="main" className="pt-13">
      <Outlet />
    </main>
  </>
);
