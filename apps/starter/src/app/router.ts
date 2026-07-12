import { useEffect, useState } from 'react';

/** The routes the app ships. Add a page by extending this and the nav config. */
export const ROUTES = ['dashboard', 'library', 'settings', 'about'] as const;
export type Route = (typeof ROUTES)[number];

const DEFAULT_ROUTE: Route = 'dashboard';

function fromHash(): Route {
  const id = window.location.hash.replace(/^#\/?/, '');
  return (ROUTES as readonly string[]).includes(id) ? (id as Route) : DEFAULT_ROUTE;
}

/** The current route plus a setter that also updates the URL hash. */
export function useRoute(): [Route, (route: Route) => void] {
  const [route, setRoute] = useState<Route>(fromHash);

  useEffect(() => {
    const onHash = () => setRoute(fromHash());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const navigate = (next: Route) => {
    window.location.hash = `/${next}`;
    setRoute(next);
  };

  return [route, navigate];
}
