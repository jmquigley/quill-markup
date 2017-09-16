const MinifyPlugin = require("babel-minify-webpack-plugin");
const path = require('path');

module.exports = {
	entry: path.resolve(__dirname, 'index.ts'),
	output: {
		path: path.resolve(__dirname, 'public'),
		filename: 'bundle.js',
		libraryTarget: "umd"
	},
	resolve: {
		extensions: ['.ts', '.js', '.css']
	},
	module: {
		rules: [
			{
				test: /\.ts$/,
				exclude: /node_modules|public/,
				loader: 'js-output-loader!awesome-typescript-loader?useBabel=true&useCache=true'
			},
			{
				test: /\.css$/,
				use: ['style-loader', 'css-loader']
			},
		]
	},
	plugins: [
    	new MinifyPlugin()
  	]
}
