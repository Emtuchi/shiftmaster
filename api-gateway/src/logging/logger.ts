export function logRequest(entry: {
  requestId: string;
  method: string;
  path: string;
  route: string;
  clientId: string;
  status: number;
  durationMs: number;
}) {
  // Ship to stdout — let your log collector handle the rest
  process.stdout.write(JSON.stringify(entry) + '\n');
}