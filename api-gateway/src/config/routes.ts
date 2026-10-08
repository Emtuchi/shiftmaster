export interface Route {
  prefix: string;
  target: string;
  rewrite?: (path: string) => string;
  auth: 'jwt' | 'apikey' | 'none';
  rateLimit?: { window: number; max: number };
}

export const routes: Route[] = [
  {
    prefix: '/api/users',
    target: 'http://users-service:3001',
    rewrite: (p) => p.replace(/^\/api\/users/, '/v2/users'),
    auth: 'jwt',
    rateLimit: { window: 60_000, max: 100 },
  },
  {
    prefix: '/api/payments',
    target: 'http://payments-service:3002',
    auth: 'jwt',
    rateLimit: { window: 60_000, max: 20 },
  },
  {
    prefix: '/webhooks',
    target: 'http://webhook-handler:3003',
    auth: 'apikey',
  },
];
