const GasPlugin = require("gas-webpack-plugin");
const TerserPlugin = require('terser-webpack-plugin');
const path = require('path');
const JavaScriptObfuscator = require('webpack-obfuscator');


const assignPath = (pathUser) => path.resolve(__dirname, pathUser ? pathUser : '')

const entry = assignPath('./src/Index.js');
const outDir = assignPath('../Server');
const outName = 'code.js';

module.exports = {
    mode: "production",
    entry,
    output: {
        path: outDir,
        filename: outName,
    },
    plugins: [
        new GasPlugin({
            autoGlobalExportsFiles: [entry],
        }),
    ],
    optimization: {
        minimize: false,
        //minimizer: [new TerserPlugin()],
    },

    devtool: false,
};