const HtmlWebpackPlugin = require("html-webpack-plugin");
const MinifyPlugin = require("babel-minify-webpack-plugin");
const path = require("path");

const dev = process.env.NODE_ENV !== "production";

const sharedPlugins = [
  new HtmlWebpackPlugin()
];
const devPlugins = [];
const prodPlugins = [
  new MinifyPlugin()
];

const plugins = dev 
  ? [
    ...sharedPlugins,
    ...devPlugins
  ]
  : [
    ...sharedPlugins,
    ...prodPlugins
  ];

module.exports = {
  entry: "./src/index.ts",
  output: {
    path: path.join(__dirname, "/dist"),
    filename: "bundle.js"
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".worker.ts"]
  },
  module: {
    loaders: [
      { test: /\.tsx?$/, loader: "ts-loader" }
    ]
  },
  plugins,
  devtool: dev ? "inline-source-map" : "source-map",
  devServer: {
    host: "0.0.0.0"
  }
}