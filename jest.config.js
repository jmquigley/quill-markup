module.exports = {
	collectCoverage: true,
	coveragePathIgnorePatterns: [
		"<rootDir>/bin",
		"<rootDir>/images",
		"<rootDir>/public",
		"<rootDir>/__tests__/helpers",
		"<rootDir>/node_modules"
	],
	moduleFileExtensions: ["js", "jsx", "ts", "tsx", "json"],
	moduleNameMapper: {
		"\\.(css|style)$": "identity-obj-proxy"
	},
	notify: false,
	setupFiles: ["<rootDir>/bin/setupDOM.js"],
	testPathIgnorePatterns: [
		"<rootDir>/bin",
		"<rootDir>/__tests__/helpers",
		"<rootDir>/node_modules"
	],
	verbose: true
};
