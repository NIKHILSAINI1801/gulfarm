import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  const isVercelBuild = process.env.VERCEL === '1' || process.env.VERCEL === 'true';
  const buildDir = path.resolve(__dirname, isVercelBuild ? 'public' : 'dist');
  const publicDir: string | false = isVercelBuild ? false : 'public';

  return {
    publicDir,
    plugins: [
      react(),
      tailwindcss(),
      // Copies src/assets into the build output so root-relative URLs like
      // "/src/assets/images/..." (e.g. generate_image output) still resolve
      // in production builds. Do not remove.
      {
        name: 'copy-unbundled-src-assets',
        apply: 'build',
        closeBundle(error?: Error): void {
          if (error) {
            return;
          }
          const srcAssets = path.resolve(__dirname, 'src/assets');
          const outputAssets = path.resolve(buildDir, 'src/assets');
          if (fs.existsSync(buildDir) && fs.existsSync(srcAssets)) {
            fs.cpSync(srcAssets, outputAssets, {recursive: true, force: true});
          }
        },
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
    build: {
      outDir: buildDir,
      emptyOutDir: !isVercelBuild,
    },
  };
});
