import { Link, Outlet } from 'react-router';

import { SkipLink } from '@/shared/ui/SkipLink';

export const RootLayout = () => (
  <>
    <SkipLink />
    <header className="fixed inset-x-0 top-0 z-10 bg-page">
      <div className="mx-auto flex h-13 w-full max-w-7xl items-center px-3 md:px-5">
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
