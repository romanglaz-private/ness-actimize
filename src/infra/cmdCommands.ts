import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

export type CurlExecResult = {
  statusCode: number;
  body: string;
};

export function execCurlSync(
  curlArgs: readonly string[],
  execOptions?: { maxBuffer?: number },
): CurlExecResult {
  const dir = mkdtempSync(join(tmpdir(), 'pw-curl-'));
  const bodyPath = join(dir, 'body.out');
  const maxBuffer = execOptions?.maxBuffer ?? 10 * 1024 * 1024;
  try {
    const statusText = execFileSync(
      'curl',
      ['-sS', '-o', bodyPath, '-w', '%{http_code}', ...curlArgs],
      { encoding: 'utf-8', maxBuffer },
    );
    const parsed = Number.parseInt(statusText.trim(), 10);
    const statusCode = Number.isNaN(parsed) ? 0 : parsed;
    const body = readFileSync(bodyPath, 'utf-8');
    return { statusCode, body };
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}
