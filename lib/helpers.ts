// This will get a module level import of a Quill instance, but it will not
// be the one on the window.
//
// globals suck.
//
// import * as q from 'quill';

const debug = require("debug")("quill-markup.helpers");

/**
 * Retrieves the global instance of Quill.  When Quill is used in a browser, it
 * is loaded with the `<script>` tag.  This places the global instance on
 * "global" (or window).  There must only be one copy of this instance.  If you use
 * "require" or import to pull it in it will be scoped to that module and will
 * not be the same as the global version.  Bad things happen when one does this
 * as custom, registered modules and formats will not work unless one registers
 * them on the correct instance that is shown in the browser.   This check and
 * retrieval will ensure that it is uses the global instance.
 * @returns {Quill} the reference to the global Quill instance
 */
export function getQuill() {
	const gQuill = (global as any).Quill;
	if (!gQuill) {
		throw new Error("Quill is not loaded in this application");
	}

	debug("Retrieving global quill instance: %O", gQuill);
	return gQuill;
}

const Quill = getQuill();
const Delta = Quill.import("delta");
const Parchment = Quill.import("parchment");

export {Delta, Parchment, Quill};
