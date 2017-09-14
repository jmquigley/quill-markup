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
				test: /\.js$/,
				exclude: /(node_modules|bower_components)/,
				loader: 'babel-loader'
			},
			{
				test: /\.css$/,
				use: ['style-loader', 'css-loader']
			},
		]
	}
}
