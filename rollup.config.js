import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import postcss from 'rollup-plugin-postcss';
import dts from 'rollup-plugin-dts';
import { readFileSync, cpSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const packageJson = JSON.parse(readFileSync('./package.json', 'utf8'));

function copyAssets() {
  return {
    name: 'copy-assets',
    generateBundle() {
      if (!existsSync('dist')) {
        mkdirSync('dist', { recursive: true });
      }
      
      if (existsSync('src/assets')) {
        cpSync('src/assets', 'dist/assets', { recursive: true });
        console.log('✅ Copied assets to dist/assets');
      }
    }
  };
}

export default [
  {
    input: 'src/index.ts',
    output: [
      {
        file: packageJson.main,
        format: 'cjs',
        sourcemap: true,
      },
      {
        file: packageJson.module,
        format: 'esm',
        sourcemap: true,
      },
      {
        file: 'dist/index.umd.js',
        format: 'umd',
        name: 'Shmoobium',
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM'
        },
        sourcemap: true,
      },
    ],
    external: ['react', 'react-dom'],
    plugins: [
      resolve(),
      commonjs(),
      typescript({ 
        tsconfig: './tsconfig.json',
        declaration: false,
        declarationMap: false
      }),
      postcss({
        extract: true,
        minimize: true,
      }),
      copyAssets(),
    ],
  },
  {
    input: 'src/index.ts',
    output: [{ file: 'dist/index.d.ts', format: 'esm' }],
    plugins: [
      dts({
        compilerOptions: {
          baseUrl: './src'
        }
      }),
      postcss({
        extract: false,
        inject: false,
      }),
    ],
    external: [/\.css$/],
  },
]; 