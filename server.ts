/**
 * Demo application server.  The server contents are located in the ./public
 * folder.  It servers "index.html" file that loads external dependencies
 * and then servers up the bundle.  At the bottom of the script it start
 * "app.js" which loads the Quill package and the custom Markup plugin.
 *
 * Got to "https://localhost:4000" to see an instance of the editor.
 *
 */
const express = require("express");
const app = express();

app.use(express.static("public"));

app.listen(4000, () => {
	console.log("Express server is up on port 4000 (CTRL+C to quit)");
});
