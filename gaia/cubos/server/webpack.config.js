const path = require('path');

module.exports = {
    entry: './curriculum/src/index.jsx',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle.js',
        publicPath: '/',
    },
    resolve: {
        extensions: ['.js', '.jsx'],
        alias: {
            curriculum: path.resolve(__dirname, 'curriculum/src'),
        },
    },
    module: {
        rules: [
            {
                test: /\.jsx?$/,  // Matches .js and .jsx files
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env', '@babel/preset-react'],
                    },
                },
            },
            {
                test: /\.css$/,  // Matches .css files
                use: ['style-loader', 'css-loader'],  // Use style-loader and css-loader
            },
        ],
    },
    devServer: {
        allowedHosts: 'all',
        proxy: [
            {
                context: ['/api', '/cubos'],
                target: 'http://vivalibro.com:3000',
                changeOrigin: true,
                secure: false,
                pathRewrite: {
                    '^/api': '',
                    '^/cubos': '',
                },
            },
        ],
        historyApiFallback: true,
        hot: true,
        port: 3000,
        static: path.join(__dirname, 'public'),
    },
};
