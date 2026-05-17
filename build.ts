import { build } from 'esbuild';

export async function buildTools() {
  await build({
    entryPoints: [`${__dirname}/src/index.tsx`],
    bundle: true,
    minify: true,
    sourcemap: true,
    target: 'es2024',
    format: 'esm',
    outdir: 'public',
  });
}

buildTools();
