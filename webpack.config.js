const HtmlWebpackPlugin = require("html-webpack-plugin");
const path = require("path");

const dev = process.env.NODE_ENV !== "production";

const sharedPlugins = [new HtmlWebpackPlugin()];
const devPlugins = [];
const prodPlugins = [];

const plugins = dev
  ? [...sharedPlugins, ...devPlugins, ...prodPlugins]
  : [...sharedPlugins, ...prodPlugins];

const tsLoader = {
  loader: "ts-loader",
  options: {
    transpileOnly: true
  }
};

module.exports = {
  mode: dev ? "development" : "production",
  entry: "./src/index.ts",
  output: {
    path: path.join(__dirname, "/public"),
    filename: "bundle.js"
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".worker.ts"]
  },
  module: {
    rules: [
      { test: /\.worker.tsx?$/, use: [tsLoader, "worker-loader"] },
      { test: /\.tsx?$/, use: [tsLoader] }
    ]
  },
  plugins,
  devtool: dev ? "inline-source-map" : "source-map",
  devServer: dev
    ? {
        host: "0.0.0.0"
      }
    : undefined
};
