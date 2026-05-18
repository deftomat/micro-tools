import { build } from 'esbuild';
import { cpSync, rmSync } from 'fs';

export async function run() {
  const buildDir = `${__dirname}/.build`;

  rmSync(buildDir, { recursive: true, force: true });
  cpSync(`${__dirname}/public`, buildDir, { recursive: true, force: true });

  await build({
    entryPoints: [`${__dirname}/src/index.tsx`],
    bundle: true,
    minify: true,
    sourcemap: true,
    target: 'es2024',
    format: 'esm',
    outdir: buildDir,
  });
}

run();
