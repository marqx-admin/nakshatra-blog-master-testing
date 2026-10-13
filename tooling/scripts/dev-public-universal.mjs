import { spawn } from 'node:child_process';

// One local Universal process serves any registered Host. The API remains tenant authority.
const port = process.env.VITE_PUBLIC_SITE_PORT || '3015';
const child = spawn('corepack', ['pnpm', '--filter', '@bp/public-universal', 'dev', '--hostname', '127.0.0.1', '--port', port], {
  stdio: 'inherit',
  env: {
    ...process.env,
    BP_API_INTERNAL_ORIGIN: process.env.BP_API_INTERNAL_ORIGIN || `http://127.0.0.1:${process.env.BP_HTTP_PORT || '8080'}`,
  },
});
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => child.kill(signal));
child.on('error', (error) => {
  console.error(`Unable to start Universal frontend: ${error.message}`);
  process.exitCode = 1;
});
child.on('exit', (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  else process.exitCode = code ?? 1;
});
