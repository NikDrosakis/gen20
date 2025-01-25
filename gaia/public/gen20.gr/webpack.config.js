const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: './src/index.js', // Entry point of your React app
    output: {
        path: path.resolve(__dirname, 'build'),
        filename: 'bundle.js',
    },
    resolve: {
        extensions: ['.js', '.jsx', '.pug'], // Resolve .js, .jsx, .pug extensions
    },
    module: {
        rules: [
            // Babel loader for React and JS files
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: 'babel-loader',
            },
            // Pug loader
            {
                test: /\.pug$/,
                use: ['html-loader', 'pug-html-loader'],  // Handle Pug files
            },
            // CSS and SASS support (optional, if you need it)
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader'],
            },
        ],
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './public/index.html', // Template HTML file
        }),
    ],
    devServer: {
        static: {
            directory: path.join(__dirname, 'dist'), // Replace `contentBase` with `static`
        },
        hot: true,
        port: 3000, // Optional: set a custom port
    },
    mode: 'production',
    devtool: 'source-map', // Optional: to enable source maps for debugging
};
