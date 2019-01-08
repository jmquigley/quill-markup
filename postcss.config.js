module.exports = {
  plugins: [
	require('postcss-import')({}),
	require('precss')({}),
	require('postcss-preset-env')({ stage: 2 }),
	require('postcss-modules')({
		scopeBehaviour: 'global'
	})
  ]
}
