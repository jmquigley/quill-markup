const MinifyPlugin = require("babel-minify-webpack-plugin");

module.exports = {
	entry: './index.ts',
	output: {
		path: __dirname,
		filename: './public/bundle.js',
		libraryTarget: "umd"
	},
	resolve: {
		extensions: ['.js', '.ts', '.css']
	},
	module: {
		rules: [
			{
				test: /\.ts$/,
				loader: 'awesome-typescript-loader?useBabel=true&useCache=true'
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
