import babel from '@rollup/plugin-babel';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import replace from '@rollup/plugin-replace';
import terser from '@rollup/plugin-terser';
import postcss from 'rollup-plugin-postcss';
import autoprefixer from 'autoprefixer';

const srcDir = 'src/treeloader/';
const distDir = 'app/dist/';

const rollplugins = () => [
    resolve(),
    commonjs(),
    // eslint({
    //     fix: true,
    //     exclude: ['./node_modules/**', './src/styles/**']
    // }),
    babel({
        babelrc: false,
        exclude: ['./node_modules/**', './src/**'],
        babelHelpers: 'bundled'
    }),
    replace({
        exclude: ['node_modules/**', './src/static_data/**'],
        preventAssignment: true,
        ENV: JSON.stringify(process.env.NODE_ENV || 'development')
    }),
    (process.env.NODE_ENV === 'production' && terser()),
    postcss({
        plugins: [autoprefixer()],
        inject: false,
        extract: true,
        sourceMap: (process.env.NODE_ENV === 'production' ? false : 'inline'),
        minimize: (process.env.NODE_ENV === 'production')
    }),
]

function setupBuild(src, dist, name) {
    return {
        input: srcDir + src,
        output: {
            file: distDir + dist,
            format: 'iife',
            name,
            globals: 
            { 
                ishashmap: 'ishashmap',
                d3: 'd3', 
                datajson: 'datajson' 
            },
            sourcemap: (process.env.NODE_ENV === 'production' ? false : 'inline')
        },
        external: ['d3', 'ishashmap', 'datajson'],
        plugins: rollplugins(),
        onwarn: function (warning, warner) {
            if (warning.code === 'CIRCULAR_DEPENDENCY') {
                if (warning.importer && warning.importer.startsWith('node_modules/')) {
                    return;
                }
            }
            warner(warning);
        },
    }
}

export default [
    setupBuild('loadtree.js', 'treeloader.js', 'plt')
]