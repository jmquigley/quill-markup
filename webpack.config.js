const ExtractTextPlugin = require("extract-text-webpack-plugin");
// const MinifyPlugin = require("babel-minify-webpack-plugin");
const path = require('path');

module.exports = {
	entry: [
		path.resolve(__dirname, 'index.ts'),
	],
	target: 'web',
	output: {
		path: path.resolve(__dirname, 'public'),
		filename: 'bundle.js',
		libraryTarget: "umd"
	},
	resolve: {
		extensions: ['.ts', '.js', '.css']
	},
	resolveLoader: {
		modules: [path.join(__dirname, "node_modules")]
	},
	devtool: 'source-map',
	module: {
		rules: [
			{
				test: /\.ts$/,
				exclude: /node_modules|public/,
				loader: 'js-output-loader!awesome-typescript-loader?useBabel=true&useCache=true'
			},
			{
				test: /\.css$/,
				use: ExtractTextPlugin.extract({
					fallback: 'style-loader',
					use: [{
						loader: "css-loader",
						options: {
							importLoaders: 1,
							localIdentName: '[folder]_[local]-[hash:base64:5]'
						}
					},
					'postcss-loader'
					]}
				)
			},
			{
				test: /\.ttf$/,
				loader: "file-loader?name=[name].[ext]"
			},
			{
				test: /\.style$/,
				loader: "file-loader?name=./highlights/[name].[ext]"
			}
		]
	},
	plugins: [
		new ExtractTextPlugin({filename: "styles.css"})
    	// new MinifyPlugin()
  	]
}
