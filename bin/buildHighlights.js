//
// Process the list of current highlight.js CSS files and places them
// in the `./lib/highlights dirctory.  An index.ts file is also created
// to "require" them.  This file is then used by markup.ts to
// pull in each of these files for webpack.
//
// The index.ts file contains an exported object named "cssHighlights"
// that contains a key for each CSS file and the associated ".style"
// file.  The markup processor can then present a list of all
// available CSS syntax highlighting schemes for the user to choose.
//
// A new method named "setHighligh(name: string)" is provided by
// Markup to set the current CSS scheme.  There is also a new
// property on the MarkupOptions.
//
"use strict";

const debug = require("debug")("buildStyles");
const fs = require("fs-extra");
const {join} = require("util.join");
const shell = require("shelljs");

console.log("Processing CSS highlight styles");

let src = join(process.cwd(), "node_modules", "highlight.js", "styles");
let dst = join(process.cwd(), "public", "highlights");
let license = join(process.cwd(), "node_modules", "highlight.js", "LICENSE");

if (fs.existsSync(dst)) {
	shell.rm("-rf", dst);
}
shell.mkdir(dst);

let files = fs
	.readdirSync(src)
	.filter(
		(file) =>
			fs.statSync(join(src, file)).isFile() && file.slice(-4) === ".css"
	);

const styles = {};

for (const filename of files) {
	const sf = join(src, filename);
	const df = join(dst, filename);

	debug("copy file %s to %s", sf, df);
	shell.cp(sf, df);

	styles[filename.slice(0, filename.length - 4)] = `highlights/${filename}`;
}

shell.cp(license, dst);

const json = JSON.stringify(styles, null, "\t").replace(/\"/g, "'");
const s = `export const cssHighlights: any = ${json};\n`;

fs.writeFileSync(join(process.cwd(), "lib", "highlights.ts"), s);
