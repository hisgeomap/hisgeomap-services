const webpack = require("webpack");
const path = require("path");
module.exports = {
    entry: "./ts-build/index.js",
    output: {
        path: path.join(__dirname, "build/"),
        publicPath: "/",
        filename: "index.js"
    },
    target: "node",
    node: {
        // Need this when working with express, otherwise the build fails
        __dirname: false, // if you don't put this is, __dirname
        __filename: false // and __filename return blank or /
    },
    mode: "production"
};
