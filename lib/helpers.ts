/**
 * Retrieves the global instance of Quill.  When Quill is used in a browser, it
 * is loaded with the `<script>` tag.  This places the global instance on
 * "global" (or window).  There must only be one copy of this instance.  If you use
 * "require" or import to pull it in it will be scoped to that module and will
 * not be the same as the global version.  Bad things happen when one does this
 * as custom, registered modules and formats will not work.   This check and
 * retrieval will ensure that it is loaded.
 * @returns {Quill} the reference to the global Quill instance
 */
export function getQuill() {
	const Quill = (global as any).Quill;
	if (!Quill) {
		throw new Error('Quill is not loaded in this application');
	}

	return Quill;
}
