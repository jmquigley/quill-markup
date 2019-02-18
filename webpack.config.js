const TsDeclarationBundlerPlugin = require("ts-declaration-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const MinifyPlugin = require("babel-minify-webpack-plugin");
const path = require("path");
const {leader} = require("util.leader");
const webpack = require("webpack");
const pkg = require("./package.json");

let mode = process.env.NODE_ENV || "development";

const banner = new webpack.BannerPlugin({
	banner:
		"quill-markup v" +
		pkg.version +
		"\n" +
		`Mode: ${mode}` +
		"\n" +
		"https://www.npmjs.com/package/quill-markup\n" +
		"Copyright (c) 2017, James Quigley\n",
	entryOnly: true
});

leader(banner.options.banner);

const constants = new webpack.DefinePlugin({
	MARKUP_VERSION: JSON.stringify(pkg.version),
	NODE_ENV: `${mode}`
});

module.exports = {
	mode: `${mode}`,
	performance: {hints: false},
	optimization: {
		minimize: false
	},
	entry: [path.resolve(__dirname, "index.ts")],
	target: "web",
	output: {
		path: path.resolve(__dirname, "public"),
		filename: "bundle.js",
		libraryTarget: "umd"
	},
	resolve: {
		extensions: [".ts", ".js", ".css"],
		alias: {
			lodash: path.resolve(
				__dirname,
				"node_modules",
				"lodash",
				"lodash.min.js"
			),
			quill: path.resolve(
				__dirname,
				"node_modules",
				"quill",
				"dist",
				"quill.min.js"
			)
		}
	},
	resolveLoader: {
		modules: [path.join(__dirname, "node_modules")]
	},
	devtool: "source-map",
	module: {
		rules: [
			{
				test: /\.ts$/,
				exclude: /node_modules|public/,
				loader: "js-output-loader!ts-loader"
			},
			{
				test: /\.css$/,
				use: [
					MiniCssExtractPlugin.loader,
					{
						loader: "css-loader",
						options: {
							importLoaders: 1,
							localIdentName: "[folder]_[local]-[hash:base64:5]"
						}
					},
					"postcss-loader"
				]
			},
			{
				test: /\.ttf$/,
				loader: "file-loader?name=[name].[ext]"
			}
		]
	},
	plugins: [
		banner,
		constants,
		new MiniCssExtractPlugin({filename: "styles.css"}),
		new TsDeclarationBundlerPlugin({
			name: "bundle.d.ts"
		})
		// new MinifyPlugin()
	]
};
