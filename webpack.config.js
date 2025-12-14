import path from 'path';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import { fileURLToPath } from 'url';
import webpack from 'webpack';
import { loadEnv } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default (envObj = {}) => {
    const mode = envObj.mode || 'development';
    const env = loadEnv(mode, process.cwd(), '');

    return {
        entry: './index.tsx',
        output: {
            path: path.resolve(__dirname, 'dist'),
            filename: 'bundle.js',
            clean: true,
        },
        mode: mode,
        resolve: {
            extensions: ['.tsx', '.ts', '.js'],
        },
        module: {
            rules: [
                {
                    test: /\.(ts|tsx)$/,
                    use: [
                        {
                            loader: 'ts-loader',
                            options: {
                                configFile: 'tsconfig.webpack.json',
                            },
                        },
                    ],
                    exclude: /node_modules/,
                },
                {
                    test: /\.css$/i,
                    use: ['style-loader', 'css-loader'],
                },
            ],
        },
        plugins: [
            new HtmlWebpackPlugin({
                template: './index.webpack.html',
            }),
            new webpack.DefinePlugin({
                'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
                'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
            }),
        ],
        devServer: {
            static: './dist',
            port: 3000,
            open: true,
        },
    };
};
