Quill.register('modules/markup', Markup);
let quill = new Quill('#editor', {
	modules: {
		history: {
      		delay: 2000,
      		maxStack: 500,
      		userOnly: true
    	},
		markup: true,
		toolbar: false
	},
	theme: 'snow'
});

let markup = quill.getModule('markup');
markup.set({
	mode: MarkupMode.markdown,
	styling: MarkupStyle.monokai,
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

document.getElementById("undo-button").onclick = (e) => {
	markup.undo();
}

document.getElementById("redo-button").onclick = (e) => {
	markup.redo();
}
