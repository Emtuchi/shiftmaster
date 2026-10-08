import { Route } from '../config/routes';
import { routes } from '../config/routes';

export function matchRoute(path: string): Route | undefined {
  return routes.find((r: Route) => path.startsWith(r.prefix));
}