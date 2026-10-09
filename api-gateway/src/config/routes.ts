export interface Route {
  prefix: string;
  target: string;
  rewrite?: (path: string) => string;
  auth: 'jwt' | 'apikey' | 'none';
  rateLimit?: { window: number; max: number };
}

export const routes: Route[] = [
  {
    prefix: '/api/auth/signup',
    target: 'http://localhost:3001',
    auth: 'none',
    rateLimit: { window: 60_000, max: 100 },
  },
  {
    prefix: '/api/auth/login',
    target: 'http://localhost:3002',
    auth: 'jwt',
    rateLimit: { window: 60_000, max: 20 },
  },
  {
    prefix: '/webhooks',
    target: 'http://localhost:3003',
    auth: 'apikey',
  },
];
