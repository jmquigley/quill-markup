const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const path = require("path");
const {leader} = require("util.leader");
const webpack = require("webpack");
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer")
	.BundleAnalyzerPlugin;
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
		"Copyright (c) 2019, James Quigley\n",
	entryOnly: true
});

leader(banner.options.banner);

const constants = new webpack.DefinePlugin({
	MARKUP_VERSION: JSON.stringify(pkg.version),
	NODE_ENV: `${mode}`
});

module.exports = {
	mode,
	performance: {hints: false},
	entry: [path.resolve(__dirname, "index.js")],
	output: {
		path: path.resolve(__dirname, "public"),
		filename: "bundle.js",
		libraryTarget: "umd"
	},
	resolve: {
		extensions: [".js", ".css"],
		alias: {
			lodash: path.resolve(
				__dirname,
				"node_modules",
				"lodash",
				"lodash.min.js"
			)
		}
	},
	externals: {
		quill: {
			root: "Quill",
			commonjs2: "quill",
			commonjs: "quill",
			amd: "quill"
		}
	},
	resolveLoader: {
		modules: [path.join(__dirname, "node_modules")]
	},
	module: {
		rules: [
			{
				test: /\.js$/,
				exclude: /node_modules|public|.*\.d.ts/,
				loader: "babel-loader"
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
		new BundleAnalyzerPlugin({
			analyzerMode: "static",
			reportFilename: "bundle.report.html"
		})
	]
};
