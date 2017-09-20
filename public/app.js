Quill.register('modules/markup', Markup);
let quill = new Quill('#editor', {
	modules: {
		markup: {
			mode: MarkupMode.markdown,
			styling: MarkupStyle.monokai
		},
		toolbar: false
	},
	theme: 'snow'
});

let markup = quill.getModule('markup');
markup.set({
	content: 'Hello World'
});

document.getElementById("font").onchange = (e) => {
	markup.setFont(e.target.value);
}

document.getElementById("fontsize").onchange = (e) => {
	markup.setFontSize(e.target.value);
}

document.getElementById("bold-button").onclick = (e) => {
	markup.setBold();
}

document.getElementById("italic-button").onclick = (e) => {
	markup.setItalic();
}

document.getElementById("underline-button").onclick = (e) => {
	markup.setUnderline();
}

document.getElementById("strike-button").onclick = (e) => {
	markup.setStrikeThrough();
}

document.getElementById("headerlevel").onchange = (e) => {
	markup.setHeader(e.target.value);

	let elements = e.target.selectedOptions;
    for(var i = 0; i < elements.length; i++){
      elements[i].selected = false;
    }
}
